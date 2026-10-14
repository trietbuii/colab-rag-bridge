"""
ColabAI Studio - Google Colab Backend Server với RAG & Xác Thực Bảo Mật
Chạy trực tiếp trên Google Colab với GPU T4 miễn phí.
Tích hợp:
1. Xác thực tài khoản/mật khẩu bảo mật trước khi cho phép client truy cập.
2. Pipeline RAG (Retrieval-Augmented Generation):
   - Cào tài liệu từ URL
   - Chunking (chia nhỏ văn bản)
   - Embeddings với sentence-transformers (all-MiniLM-L6-v2)
   - Vector Search tìm top-k chunks liên quan nhất với câu hỏi
   - LLM (Qwen2.5-Instruct) sinh câu trả lời có trích dẫn nguồn
3. Tự động mở Cloudflare Tunnel miễn phí trả về link HTTPS công khai.
"""

import os
import sys
import time
import re
import uuid
import subprocess
import torch
import requests
import numpy as np
from bs4 import BeautifulSoup
from fastapi import FastAPI, HTTPException, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import uvicorn
from transformers import AutoModelForCausalLM, AutoTokenizer
from sentence_transformers import SentenceTransformer

# --- Cấu hình Tài Khoản Bảo Mật Cho Colab ---
COLAB_AUTH_CONFIG = {
    "username": "admin",
    "password": "colab2026"  # Bạn có thể đổi mật khẩu tại đây
}

ACTIVE_SESSIONS = set()

# --- Cấu hình App & FastAPI ---
app = FastAPI(title="ColabAI RAG Backend", version="3.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
LLM_MODEL_NAME = "Qwen/Qwen2.5-1.5B-Instruct"
EMBED_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

print(f"🔥 Đang chạy trên thiết bị: {DEVICE.upper()}")
if torch.cuda.is_available():
    print(f"🎮 GPU Model: {torch.cuda.get_device_name(0)}")

# Khởi tạo mô hình
llm_tokenizer = None
llm_model = None
embedder = None

def load_models():
    global llm_tokenizer, llm_model, embedder
    print(f"⏳ [1/2] Đang tải mô hình Embedding RAG ({EMBED_MODEL_NAME})...")
    embedder = SentenceTransformer(EMBED_MODEL_NAME, device=DEVICE)
    print("✅ Mô hình Embedding đã sẵn sàng!")

    print(f"⏳ [2/2] Đang tải mô hình LLM ({LLM_MODEL_NAME})... (khoảng 30 giây)")
    try:
        llm_tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME)
        llm_model = AutoModelForCausalLM.from_pretrained(
            LLM_MODEL_NAME,
            torch_dtype=torch.float16 if torch.cuda.is_available() else torch.float32,
            device_map="auto"
        )
        print("✅ Mô hình LLM đã sẵn sàng phục vụ RAG!")
    except Exception as e:
        print(f"⚠️ Không tải được LLM ({e}), sẽ dùng chế độ trích xuất RAG nhẹ.")
        llm_tokenizer = None
        llm_model = None

# --- Tiện ích Cào & Xử lý Văn bản ---
def scrape_web_content(url: str):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    }
    resp = requests.get(url, headers=headers, timeout=12)
    resp.raise_for_status()

    soup = BeautifulSoup(resp.text, "html.parser")
    for tag in soup(["script", "style", "nav", "footer", "header", "noscript", "aside"]):
        tag.decompose()

    title = soup.title.string.strip() if soup.title and soup.title.string else url

    paragraphs = []
    for p in soup.find_all(["p", "h1", "h2", "h3", "li"]):
        text = p.get_text(separator=" ", strip=True)
        if len(text) > 30:
            paragraphs.append(text)

    clean_text = "\n\n".join(paragraphs)
    return {
        "title": title,
        "content": clean_text,
        "word_count": len(clean_text.split())
    }

# --- RAG Core: Chunking & Vector Search ---
def chunk_text(text: str, chunk_size: int = 250, chunk_overlap: int = 40) -> List[str]:
    """Chia văn bản thành các chunks có độ chồng lấn (overlap) để giữ ngữ cảnh."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = start + chunk_size
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk)
        start += (chunk_size - chunk_overlap)
        if start >= len(words):
            break
    return chunks

def cosine_similarity(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    dot = np.dot(a, b.T)
    norm_a = np.linalg.norm(a, axis=1, keepdims=True)
    norm_b = np.linalg.norm(b, axis=1, keepdims=True)
    return dot / (norm_a * norm_b.T + 1e-8)

def perform_rag_retrieval(query: str, text: str, top_k: int = 3):
    """Chia chunks, tính embedding và tìm các chunks có độ liên quan cao nhất."""
    chunks = chunk_text(text)
    if not chunks:
        return []

    if embedder is None:
        # Fallback if embedder not ready: return first chunks
        return [{"chunk_id": i+1, "text": c, "score": 0.8} for i, c in enumerate(chunks[:top_k])]

    # 1. Embed query & chunks
    chunk_embeddings = embedder.encode(chunks, convert_to_numpy=True, normalize_embeddings=True)
    query_embedding = embedder.encode([query], convert_to_numpy=True, normalize_embeddings=True)

    # 2. Tính tương đồng Cosine
    scores = cosine_similarity(query_embedding, chunk_embeddings)[0]

    # 3. Lấy top-k
    top_indices = np.argsort(scores)[::-1][:top_k]

    results = []
    for idx in top_indices:
        results.append({
            "chunk_id": int(idx + 1),
            "text": chunks[idx],
            "score": round(float(scores[idx]), 4)
        })
    return results

# --- Models ---
class LoginRequest(BaseModel):
    username: str
    password: str

class ProcessRequest(BaseModel):
    url: str
    prompt: str = "Tóm tắt các nội dung cốt lõi của tài liệu này"
    mode: str = "summary"
    use_rag: bool = True
    top_k: int = 3

# --- Helper Auth Verification ---
def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization:
        raise HTTPException(status_code=401, detail="Chưa cung cấp mã xác thực Token. Vui lòng đăng nhập lại.")
    token = authorization.replace("Bearer ", "").strip()
    if token not in ACTIVE_SESSIONS:
        raise HTTPException(status_code=401, detail="Phiên đăng nhập Colab đã hết hạn hoặc không hợp lệ.")
    return token

# --- Endpoints ---
@app.get("/")
def home():
    return {
        "status": "online",
        "service": "ColabAI RAG Backend",
        "gpu": torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    }

@app.get("/health")
def health():
    gpu_info = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
    return {
        "status": "online",
        "gpu": gpu_info,
        "device": DEVICE,
        "rag_ready": embedder is not None,
        "llm_ready": llm_model is not None,
        "timestamp": time.time()
    }

@app.post("/api/auth/login")
def login(req: LoginRequest):
    """Xác thực tài khoản và mật khẩu của Colab."""
    if req.username == COLAB_AUTH_CONFIG["username"] and req.password == COLAB_AUTH_CONFIG["password"]:
        session_token = f"colab_token_{uuid.uuid4().hex[:16]}"
        ACTIVE_SESSIONS.add(session_token)
        gpu_info = torch.cuda.get_device_name(0) if torch.cuda.is_available() else "CPU"
        return {
            "status": "authenticated",
            "token": session_token,
            "username": req.username,
            "gpu": gpu_info,
            "message": "Đăng nhập Colab thành công!"
        }
    else:
        raise HTTPException(status_code=401, detail="Sai tên tài khoản hoặc mật khẩu Colab! Mặc định: admin / colab2026")

@app.post("/api/process")
def process_rag_task(req: ProcessRequest, token: str = Depends(verify_token)):
    start_time = time.time()

    # 1. Cào dữ liệu từ URL
    try:
        scraped = scrape_web_content(req.url)
    except Exception as crawl_err:
        raise HTTPException(status_code=400, detail=f"Không thể cào dữ liệu từ URL: {str(crawl_err)}")

    if not scraped["content"].strip():
        raise HTTPException(status_code=400, detail="Không tìm thấy nội dung văn bản nào tại URL đã cung cấp.")

    # 2. Thực hiện RAG: Truy xuất vector top-k chunks liên quan
    rag_sources = []
    if req.use_rag:
        rag_sources = perform_rag_retrieval(req.prompt, scraped["content"], top_k=req.top_k)
        retrieved_context = "\n\n".join([
            f"--- [Đoạn trích #{s['chunk_id']} (Độ liên quan: {int(s['score']*100)}%)] ---\n{s['text']}" 
            for s in rag_sources
        ])
    else:
        retrieved_context = scraped["content"][:3500]

    # 3. Tạo Prompt tăng cường (Augmented Prompt)
    system_instruction = (
        "Bạn là một trợ lý AI phân tích dữ liệu thông minh có tích hợp RAG (Retrieval-Augmented Generation). "
        "Nhiệm vụ của bạn là dựa chặt chẽ vào các đoạn trích dẫn được cung cấp từ tài liệu để trả lời câu hỏi "
        "hoặc thực hiện yêu cầu của người dùng. "
        "Trả lời bằng tiếng Việt, mạch lạc, chính xác, định dạng Markdown đẹp mắt (tiêu đề, gạch đầu dòng, trích dẫn)."
    )

    user_prompt_content = (
        f"THÔNG TIN TÀI LIỆU NGUỒN:\n"
        f"Tiêu đề: {scraped['title']}\n"
        f"URL: {req.url}\n\n"
        f"CÁC ĐOẠN TRÍCH DẪN ĐƯỢC HỆ THỐNG RAG TRUY XUẤT:\n{retrieved_context}\n\n"
        f"========================\n"
        f"YÊU CẦU CỦA NGƯỜI DÙNG: {req.prompt}\n"
        f"Chế độ: {req.mode}\n"
        f"Hãy trả lời chi tiết và nêu rõ thông tin được căn cứ theo các đoạn trích trên:"
    )

    # 4. Sinh câu trả lời với LLM
    if llm_model is not None and llm_tokenizer is not None:
        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_prompt_content}
        ]
        text_input = llm_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        model_inputs = llm_tokenizer([text_input], return_tensors="pt").to(DEVICE)

        with torch.no_grad():
            generated_ids = llm_model.generate(
                **model_inputs,
                max_new_tokens=1024,
                temperature=0.6,
                top_p=0.9,
                repetition_penalty=1.1,
                do_sample=True
            )
            generated_ids = [
                output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
            ]
            ai_response = llm_tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
    else:
        # Dự phòng RAG
        ai_response = (
            f"### 📋 Tổng Quan Phân Tích RAG\n\n"
            f"**Tiêu đề:** {scraped['title']}\n\n"
            f"Dựa trên các đoạn trích xuất RAG có độ tương quan cao nhất:\n\n"
            + "\n".join([f"- **Đoạn #{s['chunk_id']}** ({int(s['score']*100)}%): {s['text'][:150]}..." for s in rag_sources])
        )

    inference_time = round(time.time() - start_time, 2)

    return {
        "status": "success",
        "result": ai_response,
        "rag_sources": rag_sources,
        "metadata": {
            "url": req.url,
            "title": scraped["title"],
            "word_count": scraped["word_count"],
            "chunks_count": len(chunk_text(scraped["content"])),
            "retrieved_chunks": len(rag_sources),
            "inference_time_sec": inference_time,
            "model": LLM_MODEL_NAME,
            "embedder": EMBED_MODEL_NAME,
            "device": DEVICE
        }
    }

# --- Cloudflare Tunnel & Khởi Chạy ---
def start_tunnel_and_server():
    print("🌐 Đang thiết lập Cloudflare Tunnel công khai...")
    if not os.path.exists("./cloudflared"):
        os.system("wget -q https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64 -O cloudflared")
        os.system("chmod +x cloudflared")

    tunnel_cmd = "./cloudflared tunnel --url http://127.0.0.1:8000"
    process = subprocess.Popen(tunnel_cmd.split(), stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

    public_url = None
    for line in iter(process.stdout.readline, ''):
        match = re.search(r'https://[a-zA-Z0-9\-]+\.trycloudflare\.com', line)
        if match:
            public_url = match.group(0)
            break

    print("\n" + "=" * 65)
    print("🎉 MÁY CHỦ COLAB RAG ĐÃ SẴN SÀNG!")
    print(f"👉 SAO CHÉP ĐƯỜNG LINK NÀY VÀO MÀN HÌNH ĐĂNG NHẬP MÁY TÍNH:")
    print(f"\n     {public_url}\n")
    print(f"🔑 TÀI KHOẢN COLAB:")
    print(f"   - Tên đăng nhập: {COLAB_AUTH_CONFIG['username']}")
    print(f"   - Mật khẩu:      {COLAB_AUTH_CONFIG['password']}")
    print("=" * 65 + "\n")

    uvicorn.run(app, host="127.0.0.1", port=8000, log_level="warning")

if __name__ == "__main__":
    load_models()
    start_tunnel_and_server()
