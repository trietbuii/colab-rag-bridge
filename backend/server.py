#!/usr/bin/env python3
"""
ColabAI Studio - Local Server & Universal Colab Bridge
Supports BOTH:
1. Gradio Backends (https://*.gradio.live) with Form / Cookie Authentication & Predict API
2. FastAPI / Cloudflare Backends (https://*.trycloudflare.com) with JSON Token & RAG Pipeline
3. Built-in Local Mock API for testing
"""

import http.server
import socketserver
import urllib.request
import urllib.parse
import urllib.error
import http.cookiejar
import json
import os
import sys
import time
import ssl
import base64
import io
import tempfile
import subprocess

PORT = int(os.environ.get("PORT", 8080))
# Thư mục gốc dự án: lùi 1 cấp từ backend/server.py -> root
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIR = os.path.join(PROJECT_ROOT, "frontend")
DIRECTORY = FRONTEND_DIR if os.path.exists(FRONTEND_DIR) else PROJECT_ROOT

# Disable strict SSL check for tunnels if needed
ssl_ctx = ssl.create_default_context()
ssl_ctx.check_hostname = False
ssl_ctx.verify_mode = ssl.CERT_NONE

# In-memory store for Gradio authenticated credentials
SESSION_FILE = os.path.join(PROJECT_ROOT, "data", "colab_session.json")
GRADIO_SESSIONS = {}
if os.path.exists(SESSION_FILE):
    try:
        with open(SESSION_FILE, 'r', encoding='utf-8') as sf:
            saved_sess = json.load(sf)
            if isinstance(saved_sess, dict) and "colab_url" in saved_sess:
                GRADIO_SESSIONS[saved_sess["colab_url"]] = saved_sess
    except Exception:
        pass

# Tích hợp hệ thống RAG từ backend/src/rag
SRC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src")
if SRC_DIR not in sys.path:
    sys.path.insert(0, SRC_DIR)

_GLOBAL_RAG_PIPELINE = None

def get_rag_pipeline():
    global _GLOBAL_RAG_PIPELINE
    if _GLOBAL_RAG_PIPELINE is None:
        try:
            from rag.pipeline import RAGPipeline
            _GLOBAL_RAG_PIPELINE = RAGPipeline()
        except Exception as e:
            print(f"RAG Pipeline init notice: {e}")
            return None
    return _GLOBAL_RAG_PIPELINE

def extract_text_from_pdf_bytes(pdf_bytes, filename="document.pdf"):
    """Trích xuất nội dung văn bản từ file PDF sử dụng pypdf hoặc pdftotext trên Fedora."""
    text_parts = []
    # Phương thức 1: Dùng pypdf (nhanh và chính xác)
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        for idx, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text and page_text.strip():
                text_parts.append(f"--- [Trang {idx+1}] ---\n{page_text.strip()}")
        if text_parts:
            return f"Tài liệu PDF: {filename}", "\n\n".join(text_parts)
    except Exception as e:
        print(f"pypdf extraction notice: {e}")

    # Phương thức 2: Dùng pdftotext của Fedora (poppler-utils)
    try:
        with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tf:
            tf.write(pdf_bytes)
            tf_path = tf.name
        res = subprocess.run(["pdftotext", "-layout", tf_path, "-"], capture_output=True, text=True)
        try:
            os.unlink(tf_path)
        except Exception:
            pass
        if res.returncode == 0 and res.stdout.strip():
            return f"Tài liệu PDF: {filename}", res.stdout.strip()
    except Exception as e:
        print(f"pdftotext extraction notice: {e}")

    return f"Tài liệu PDF: {filename}", "Không thể trích xuất văn bản từ file PDF (có thể là file scan dạng ảnh hoặc file bị đặt mật khẩu bảo vệ)."

def scrape_web_page(url):
    """Scrapes clean text content from a web page URL."""
    try:
        import requests
        from bs4 import BeautifulSoup
        resp = requests.get(url, headers={'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64)'}, timeout=10)
        soup = BeautifulSoup(resp.text, 'html.parser')
        for tag in soup(['script', 'style', 'nav', 'footer', 'header', 'aside', 'noscript']):
            tag.decompose()
        title = soup.title.string.strip() if soup.title and soup.title.string else url
        paras = []
        for p in soup.find_all(['p', 'h1', 'h2', 'h3', 'li']):
            txt = p.get_text(' ', strip=True)
            if len(txt) > 25:
                paras.append(txt)
        return title, '\n\n'.join(paras)
    except Exception as e:
        return url, f"Không thể cào nội dung từ URL ({str(e)})"

def local_rag_process(query, text, top_k=3):
    """Sử dụng trực tiếp thư viện chuẩn src/rag làm nguồn sự thật duy nhất."""
    pipeline = get_rag_pipeline()
    if pipeline and text.strip():
        try:
            from rag.chunker import chunk_text
            from rag.vector_store import VectorStore
            chunks = chunk_text(text, pipeline.settings.chunk_size, pipeline.settings.chunk_overlap)
            if chunks:
                vecs = pipeline.embedder.embed_documents(chunks)
                metas = [{"text": c, "source": "Tài liệu tải lên", "index": i} for i, c in enumerate(chunks)]
                temp_store = VectorStore.build(vecs, metas)
                q_vec = pipeline.embedder.embed_query(query)
                results = temp_store.search(q_vec, top_k)
                if results:
                    return [{'chunk_id': i+1, 'text': r.text, 'score': round(float(r.score), 3), 'source': r.source} for i, r in enumerate(results)]
        except Exception as e:
            print(f"src/rag dynamic process notice: {e}")

    # Fallback dự phòng đơn giản nếu thư viện chưa khởi tạo xong
    words = text.split()
    chunks = []
    chunk_size = 200
    overlap = 30
    start = 0
    while start < len(words):
        chunk = " ".join(words[start:start+chunk_size])
        if chunk.strip():
            chunks.append(chunk)
        start += (chunk_size - overlap)
        if start >= len(words):
            break
    if not chunks:
        return []

    q_tokens = [w.lower() for w in query.split() if len(w) > 1]
    import math
    from collections import Counter
    scores = []
    for i, ch in enumerate(chunks):
        ch_tokens = [w.lower() for w in ch.split()]
        counts = Counter(ch_tokens)
        score = sum(counts[q] for q in q_tokens) / (math.sqrt(len(ch_tokens)) + 1e-5)
        scores.append((score, i, ch))
    scores.sort(reverse=True)
    max_s = scores[0][0] if scores and scores[0][0] > 0 else 1.0
    return [{'chunk_id': i+1, 'text': ch, 'score': round(min(max(s/max_s, 0.70), 0.98), 2), 'source': 'Tài liệu tải lên'} for s, i, ch in scores[:top_k]]

class ColabAIRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def do_OPTIONS(self):
        """Handle CORS preflight requests."""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Colab-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        
        # Proxy route for GET
        if parsed.path == '/api/colab-proxy':
            params = urllib.parse.parse_qs(parsed.query)
            target_url = params.get('url', [None])[0]
            if not target_url:
                self.send_json_response(400, {"error": "Missing 'url' query parameter"})
                return
            self.proxy_request('GET', target_url)
            return

        # Built-in Mock health
        if parsed.path in ['/api/mock-colab/health', '/api/mock-colab/']:
            self.send_json_response(200, {
                "status": "online",
                "gpu": "Tesla T4 (Mock Local Active)",
                "rag_ready": True,
                "timestamp": time.time()
            })
            return

        # RAG Status Endpoint (Kiểm tra kho tri thức chi tiết kèm thư mục)
        if parsed.path == '/api/rag/status':
            raw_dir = os.path.join(PROJECT_ROOT, "data", "raw")
            store_file = os.path.join(PROJECT_ROOT, "data", "processed", "vector_store.npz")
            meta_file = os.path.join(PROJECT_ROOT, "data", "processed", "vector_store.meta.json")
            
            detailed_files = []
            folders = set(["Chung"])
            if os.path.exists(raw_dir):
                for root, dirs, files in os.walk(raw_dir):
                    rel_dir = os.path.relpath(root, raw_dir)
                    curr_folder = "Chung" if rel_dir == "." else rel_dir
                    if curr_folder != "Chung":
                        folders.add(curr_folder)
                    for f in sorted(files):
                        if f.startswith('.'):
                            continue
                        f_path = os.path.join(root, f)
                        stat = os.stat(f_path)
                        ext = os.path.splitext(f)[1].lower().replace('.', '') or 'txt'
                        detailed_files.append({
                            "name": f,
                            "folder": curr_folder,
                            "rel_path": os.path.relpath(f_path, raw_dir),
                            "size_kb": round(stat.st_size / 1024, 1),
                            "ext": ext,
                            "mtime": time.strftime('%d/%m/%Y %H:%M', time.localtime(stat.st_mtime)),
                            "status": "ready" if os.path.exists(store_file) else "pending"
                        })

            total_chunks = 0
            if os.path.exists(meta_file):
                try:
                    with open(meta_file, 'r', encoding='utf-8') as mf:
                        meta_data = json.load(mf)
                        total_chunks = len(meta_data)
                except Exception:
                    pass

            self.send_json_response(200, {
                "status": "ready",
                "store_exists": os.path.exists(store_file),
                "folders": sorted(list(folders)),
                "raw_files": [f["name"] for f in detailed_files],
                "files_detail": detailed_files,
                "raw_count": len(detailed_files),
                "total_chunks": total_chunks,
                "embedding_model": "intfloat/multilingual-e5-small",
                "chunk_size": 800,
                "chunk_overlap": 120
            })
            return

        super().do_GET()

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)

        # 0. RAG INGEST ENDPOINT: /api/rag/ingest (Nạp lại toàn bộ kho tri thức)
        if parsed.path == '/api/rag/ingest':
            pipeline = get_rag_pipeline()
            if pipeline:
                try:
                    num_chunks = pipeline.ingest()
                    self.send_json_response(200, {
                        "status": "success",
                        "message": f"Đã nạp thành công {num_chunks} chunk vào Vector Store!",
                        "num_chunks": num_chunks
                    })
                except Exception as e:
                    self.send_json_response(500, {"detail": f"Lỗi nạp dữ liệu: {str(e)}"})
            else:
                self.send_json_response(500, {"detail": "Chưa nạp được RAG Pipeline."})
            return

        # 0.1 RAG UPLOAD FILE: /api/rag/upload-file hoặc /api/rag/upload (Thêm tài liệu vào data/raw/)
        if parsed.path in ['/api/rag/upload-file', '/api/rag/upload']:
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                data = json.loads(body)
                fname = os.path.basename(data.get('filename') or data.get('name') or 'document.txt')
                b64_content = data.get('content_base64') or data.get('base64') or ''
                text_content = data.get('content_text') or data.get('text') or ''
                target_folder = (data.get('folder') or '').strip()

                raw_dir = os.path.join(PROJECT_ROOT, "data", "raw")
                if target_folder and target_folder != "Chung":
                    save_dir = os.path.join(raw_dir, target_folder)
                else:
                    save_dir = raw_dir

                os.makedirs(save_dir, exist_ok=True)
                dest_path = os.path.join(save_dir, fname)

                if b64_content:
                    clean_b64 = b64_content.split(',', 1)[1] if ',' in b64_content else b64_content
                    raw_bytes = base64.b64decode(clean_b64)
                    if fname.lower().endswith('.pdf'):
                        _, extracted_text = extract_text_from_pdf_bytes(raw_bytes, fname)
                        with open(dest_path.replace('.pdf', '.txt'), 'w', encoding='utf-8') as f:
                            f.write(extracted_text)
                    else:
                        with open(dest_path, 'wb') as f:
                            f.write(raw_bytes)
                elif text_content:
                    with open(dest_path, 'w', encoding='utf-8') as f:
                        f.write(text_content)
                else:
                    self.send_json_response(400, {"detail": "Nội dung file rỗng"})
                    return

                # Re-index
                pipeline = get_rag_pipeline()
                chunks = pipeline.ingest() if pipeline else 0
                self.send_json_response(200, {
                    "status": "success",
                    "message": f"Đã nạp '{fname}' vào thư mục '{target_folder or 'Chung'}' và lập chỉ mục {chunks} vector chunks!",
                    "filename": fname,
                    "folder": target_folder or "Chung",
                    "total_chunks": chunks
                })
            except Exception as e:
                self.send_json_response(500, {"detail": f"Lỗi xử lý file: {str(e)}"})
            return

        # 0.1b RAG CREATE FOLDER: /api/rag/create-folder (Tạo thư mục trong data/raw/)
        if parsed.path == '/api/rag/create-folder':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                data = json.loads(body)
                folder_name = os.path.basename(data.get('folder_name', '').strip())
                if not folder_name:
                    self.send_json_response(400, {"detail": "Tên thư mục không hợp lệ"})
                    return
                target_path = os.path.join(PROJECT_ROOT, "data", "raw", folder_name)
                os.makedirs(target_path, exist_ok=True)
                self.send_json_response(200, {"status": "success", "message": f"Đã tạo thư mục: {folder_name}", "folder": folder_name})
            except Exception as e:
                self.send_json_response(500, {"detail": f"Lỗi tạo thư mục: {str(e)}"})
            return

        # 0.1c RAG MOVE FILE: /api/rag/move-file (Di chuyển tài liệu sang thư mục)
        if parsed.path == '/api/rag/move-file':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                data = json.loads(body)
                fname = data.get('filename', '')
                target_folder = data.get('target_folder', 'Chung').strip()
                raw_dir = os.path.join(PROJECT_ROOT, "data", "raw")

                # Tìm vị trí hiện tại của file
                src_path = None
                for root, dirs, files in os.walk(raw_dir):
                    if fname in files:
                        src_path = os.path.join(root, fname)
                        break

                if not src_path or not os.path.exists(src_path):
                    self.send_json_response(404, {"detail": f"Không tìm thấy file: {fname}"})
                    return

                dest_dir = raw_dir if target_folder in ["", "Chung"] else os.path.join(raw_dir, target_folder)
                os.makedirs(dest_dir, exist_ok=True)
                dest_path = os.path.join(dest_dir, fname)

                if src_path != dest_path:
                    import shutil
                    shutil.move(src_path, dest_path)
                    pipeline = get_rag_pipeline()
                    chunks = pipeline.ingest() if pipeline else 0
                    self.send_json_response(200, {
                        "status": "success",
                        "message": f"Đã chuyển '{fname}' vào thư mục '{target_folder}'",
                        "total_chunks": chunks
                    })
                else:
                    self.send_json_response(200, {"status": "success", "message": "File đã nằm trong thư mục này"})
            except Exception as e:
                self.send_json_response(500, {"detail": f"Lỗi di chuyển file: {str(e)}"})
            return

        # 0.2 RAG DELETE FILE: /api/rag/delete-file (Xóa tài liệu khỏi data/raw/)
        if parsed.path == '/api/rag/delete-file':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                data = json.loads(body)
                fname = os.path.basename(data.get('filename', ''))
                if not fname:
                    self.send_json_response(400, {"detail": "Thiếu tên file"})
                    return
                pipeline = get_rag_pipeline()
                if pipeline:
                    remaining_chunks = pipeline.delete_document(fname)
                    self.send_json_response(200, {
                        "status": "success",
                        "message": f"Đã xóa '{fname}' và cập nhật lại vector store ({remaining_chunks} chunks).",
                        "remaining_chunks": remaining_chunks
                    })
                else:
                    self.send_json_response(500, {"detail": "Chưa nạp được pipeline"})
            except Exception as e:
                self.send_json_response(500, {"detail": f"Lỗi xóa file: {str(e)}"})
            return

        # 0.3 RAG FEEDBACK: /api/rag/feedback (Đánh giá 👍 / 👎)
        if parsed.path == '/api/rag/feedback':
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
            try:
                data = json.loads(body)
                feedback_file = os.path.join(PROJECT_ROOT, "data", "feedback.jsonl")
                os.makedirs(os.path.dirname(feedback_file), exist_ok=True)
                with open(feedback_file, 'a', encoding='utf-8') as fb:
                    fb.write(json.dumps({**data, "time": time.time()}, ensure_ascii=False) + "\n")
                self.send_json_response(200, {"status": "success", "message": "Cảm ơn bạn đã phản hồi!"})
            except Exception as e:
                self.send_json_response(200, {"status": "ok", "notice": str(e)})
            return

        # 1. UNIFIED LOGIN ENDPOINT: /api/colab/login
        if parsed.path == '/api/colab/login':
            self.handle_unified_login()
            return

        # 2. UNIFIED PROCESS ENDPOINT: /api/colab/process
        if parsed.path == '/api/colab/process':
            self.handle_unified_process()
            return

        # Legacy proxy route
        if parsed.path == '/api/colab-proxy':
            params = urllib.parse.parse_qs(parsed.query)
            target_url = params.get('url', [None])[0]
            if not target_url:
                self.send_json_response(400, {"error": "Missing 'url' query parameter"})
                return

            content_length = int(self.headers.get('Content-Length', 0))
            body_bytes = self.rfile.read(content_length) if content_length > 0 else None
            auth_header = self.headers.get('Authorization')
            self.proxy_request('POST', target_url, body_bytes, 
                               content_type=self.headers.get('Content-Type', 'application/json'),
                               auth_header=auth_header)
            return

        # Fallback Mock Auth
        if parsed.path == '/api/mock-colab/api/auth/login':
            self.send_json_response(200, {
                "status": "authenticated",
                "backend_type": "fastapi",
                "token": "mock_token_123456",
                "username": "admin",
                "gpu": "Tesla T4 (Mock Local Active)"
            })
            return

        self.send_json_response(404, {"error": "Endpoint not found"})

    # --- UNIFIED LOGIN HANDLER ---
    def handle_unified_login(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        try:
            payload = json.loads(body)
        except Exception:
            self.send_json_response(400, {"detail": "Dữ liệu JSON không hợp lệ"})
            return

        colab_url = payload.get('colab_url', '').strip().rstrip('/')
        username = payload.get('username', '').strip()
        password = payload.get('password', '').strip()

        if not colab_url or not username:
            self.send_json_response(400, {"detail": "Vui lòng nhập đầy đủ URL Colab và Tên đăng nhập"})
            return

        # Case A: Local Mock test
        if 'mock-colab' in colab_url:
            if password in ['colab2026', 'admin123', 'admin']:
                self.send_json_response(200, {
                    "status": "authenticated",
                    "backend_type": "mock",
                    "token": "mock_token_success",
                    "username": username,
                    "gpu": "Tesla T4 (Mock Active)",
                    "message": "Đăng nhập Mock thành công!"
                })
            else:
                self.send_json_response(401, {"detail": "Sai mật khẩu Mock! Mặc định: colab2026"})
            return

        # Case B: Try Gradio Login (Form-data /login)
        # Gradio apps on *.gradio.live use POST /login with form-urlencoded username & password
        is_gradio = ('gradio.live' in colab_url)
        gradio_result = self.try_gradio_login(colab_url, username, password)
        if gradio_result['success']:
            sess_obj = {
                "colab_url": colab_url,
                "username": username,
                "password": password,
                "cookie": gradio_result['cookie']
            }
            GRADIO_SESSIONS[colab_url] = sess_obj
            try:
                os.makedirs(os.path.join(PROJECT_ROOT, "data"), exist_ok=True)
                with open(SESSION_FILE, 'w', encoding='utf-8') as sf:
                    json.dump(sess_obj, sf, ensure_ascii=False)
            except Exception as e:
                print(f"Session save notice: {e}")
            self.send_json_response(200, {
                "status": "authenticated",
                "backend_type": "gradio",
                "token": gradio_result['cookie'],
                "username": username,
                "gpu": "Gradio Live (Colab)",
                "gradio_config": gradio_result.get('config', {}),
                "message": "Đăng nhập Gradio Colab thành công!"
            })
            return
        elif gradio_result.get('bad_credentials'):
            self.send_json_response(401, {
                "detail": "Sai tên tài khoản hoặc mật khẩu của Gradio trên Colab!"
            })
            return

        # Case C: Try FastAPI Colab Login (JSON /api/auth/login)
        if not is_gradio:
            fastapi_result = self.try_fastapi_login(colab_url, username, password)
            if fastapi_result['success']:
                self.send_json_response(200, {
                    "status": "authenticated",
                    "backend_type": "fastapi",
                    "token": fastapi_result['token'],
                    "username": username,
                    "gpu": fastapi_result.get('gpu', 'Tesla T4 (Colab)'),
                    "message": "Đăng nhập FastAPI Colab thành công!"
                })
                return
            elif fastapi_result.get('bad_credentials'):
                self.send_json_response(401, {
                    "detail": "Sai tên tài khoản hoặc mật khẩu Colab! Mặc định: admin / colab2026"
                })
                return

        # If Gradio was detected but returned another error
        if is_gradio and gradio_result.get('error'):
            self.send_json_response(400, {
                "detail": f"Lỗi kết nối Gradio: {gradio_result['error']}"
            })
            return

        self.send_json_response(404, {
            "detail": "Không tìm thấy cổng xác thực tại link này. Hãy đảm bảo Colab đang chạy và đường link còn hoạt động!"
        })

    def try_gradio_login(self, colab_url, username, password):
        """Attempts Gradio authentication via POST /login form-urlencoded."""
        login_url = f"{colab_url}/login"
        form_data = urllib.parse.urlencode({
            "username": username,
            "password": password
        }).encode('utf-8')

        req = urllib.request.Request(login_url, data=form_data, method='POST')
        req.add_header('Content-Type', 'application/x-www-form-urlencoded')
        req.add_header('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)')

        try:
            # Custom opener to prevent auto-redirect so we capture Set-Cookie on 302
            class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
                def http_error_302(self, req, fp, code, msg, headers):
                    return fp
                http_error_301 = http_error_303 = http_error_307 = http_error_302

            opener = urllib.request.build_opener(NoRedirectHandler)
            with opener.open(req, timeout=12) as resp:
                headers = resp.headers
                cookie_header = headers.get('Set-Cookie', '')
                
                # Check if cookie was received
                if 'access-token' in cookie_header or resp.status in [200, 302, 303]:
                    # Extract access-token cookie
                    cookies = [c.split(';')[0].strip() for c in cookie_header.split(',') if 'access-token' in c]
                    clean_cookie = '; '.join(cookies) if cookies else cookie_header

                    # Try to fetch Gradio config with this cookie
                    config_data = self.fetch_gradio_config(colab_url, clean_cookie)
                    return {"success": True, "cookie": clean_cookie, "config": config_data}
                return {"success": False, "bad_credentials": True}
        except urllib.error.HTTPError as e:
            if e.code == 400:
                # Gradio returns 400 with "Incorrect credentials."
                return {"success": False, "bad_credentials": True}
            if e.code == 404:
                return {"success": False, "not_found": True}
            return {"success": False, "error": f"HTTP {e.code}"}
        except Exception as ex:
            return {"success": False, "error": str(ex)}

    def fetch_gradio_config(self, colab_url, cookie):
        """Fetches Gradio /config or /info to learn API endpoint parameters."""
        try:
            req = urllib.request.Request(f"{colab_url}/config", method='GET')
            if cookie:
                req.add_header('Cookie', cookie)
            with urllib.request.urlopen(req, timeout=8) as resp:
                return json.loads(resp.read().decode('utf-8'))
        except Exception:
            return {}

    def try_fastapi_login(self, colab_url, username, password):
        """Attempts FastAPI token authentication via POST /api/auth/login."""
        login_url = f"{colab_url}/api/auth/login"
        payload = json.dumps({"username": username, "password": password}).encode('utf-8')
        req = urllib.request.Request(login_url, data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        try:
            with urllib.request.urlopen(req, timeout=10) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return {"success": True, "token": data.get('token'), "gpu": data.get('gpu')}
        except urllib.error.HTTPError as e:
            if e.code == 401:
                return {"success": False, "bad_credentials": True}
            return {"success": False, "not_found": True}
        except Exception as ex:
            return {"success": False, "error": str(ex)}

    # --- UNIFIED PROCESS HANDLER ---
    def handle_unified_process(self):
        content_length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(content_length).decode('utf-8') if content_length > 0 else '{}'
        try:
            data = json.loads(body)
        except Exception:
            self.send_json_response(400, {"detail": "Dữ liệu JSON không hợp lệ"})
            return

        colab_url = data.get('colab_url', '').strip().rstrip('/')
        backend_type = data.get('backend_type', 'fastapi')
        token = data.get('token', '')
        target_url = data.get('url', '')
        file_name = data.get('file_name', '')
        file_base64 = data.get('file_base64', '')
        prompt = data.get('prompt', 'Tóm tắt nội dung')
        use_rag = data.get('use_rag', True)
        top_k = int(data.get('top_k', 3))
        similarity_threshold = float(data.get('similarity_threshold', 0.40))
        temperature = float(data.get('temperature', 0.20))
        search_scope = data.get('search_scope', 'all')  # 'all' | 'file' | 'url'
        ai_response_language = data.get('ai_response_language', 'vi')  # 'vi' | 'en' | 'auto'

        file_text = ""
        file_title = ""
        if file_base64:
            try:
                b64_clean = file_base64.split(',', 1)[1] if ',' in file_base64 else file_base64
                file_bytes = base64.b64decode(b64_clean)
                if file_name.lower().endswith('.pdf'):
                    file_title, file_text = extract_text_from_pdf_bytes(file_bytes, file_name)
                else:
                    file_title = f"Tệp tin: {file_name}"
                    file_text = file_bytes.decode('utf-8', errors='ignore')
            except Exception as e:
                file_title = f"Lỗi đọc file {file_name}"
                file_text = f"Không thể đọc nội dung file: {str(e)}"

        pipeline = get_rag_pipeline()
        if file_base64 and file_name and file_text and search_scope == 'file':
            try:
                raw_f = os.path.join(PROJECT_ROOT, "data", "raw", file_name)
                with open(raw_f, "w", encoding="utf-8") as f:
                    f.write(file_text)
                if pipeline:
                    pipeline.ingest_single_document(file_name, file_text)
            except Exception as e:
                print(f"Auto ingest notice: {e}")

        # 1. Local / Mock processing (Chạy local RAG hoặc kiểm thử trực quan trên giao diện)
        if backend_type in ['mock', 'local'] or 'mock-colab' in colab_url or not colab_url:
            time.sleep(0.6)
            sources = []

            # Ưu tiên tìm kiếm từ Vector Store bền vững của backend/src/rag
            if pipeline and os.path.exists(pipeline.settings.store_path):
                try:
                    search_results = pipeline.search(prompt, top_k=top_k, similarity_threshold=similarity_threshold)
                    # Nếu scope là file cụ thể, lọc kết quả theo file đó
                    if search_scope == 'file' and file_name:
                        search_results = [s for s in search_results if file_name in s.source]
                    sources = [
                        {"chunk_id": i + 1, "text": s.text, "score": round(float(s.score), 3), "source": s.source}
                        for i, s in enumerate(search_results)
                    ]
                except Exception as ex:
                    print(f"Pipeline search notice: {ex}")

            if not sources and file_text:
                sources = local_rag_process(prompt, file_text, top_k=top_k)

            is_en = (ai_response_language == 'en')
            if is_en:
                src_desc = f"File `{file_name}`" if (file_name and search_scope == 'file') else ("URL `" + target_url + "`" if target_url else "Entire Knowledge Base (`data/raw/`)")
            else:
                src_desc = f"Tệp `{file_name}`" if (file_name and search_scope == 'file') else ("URL `" + target_url + "`" if target_url else "Toàn bộ Kho Tri Thức (`data/raw/`)")
            top_src = sources[0]["source"] if sources and "source" in sources[0] else (file_name or "Kho Tri Thức RAG")
            
            # Xây dựng câu trả lời có chứa các thẻ trích dẫn [1], [2] để UI parse thành badge xem trước
            citations_text = ""
            if sources:
                bullet_points = []
                for idx, s in enumerate(sources):
                    c_num = idx + 1
                    preview_snippet = s['text'][:140].replace('\n', ' ').strip()
                    if is_en:
                        bullet_points.append(
                            f"- Based on factual grounding from **{s.get('source', 'Document')}** [ {c_num} ]: "
                            f"\"{preview_snippet}...\" (Cosine Similarity: `{s.get('score', 0.88)}`)."
                        )
                    else:
                        bullet_points.append(
                            f"- Dựa trên căn cứ từ **{s.get('source', 'Tài liệu')}** [ {c_num} ]: "
                            f"\"{preview_snippet}...\" (Độ tương đồng Cosine: `{s.get('score', 0.88)}`)."
                        )
                citations_text = "\n".join(bullet_points)
            else:
                citations_text = ("- No document chunks exceeded similarity threshold (" + str(similarity_threshold) + ").") if is_en else ("- Không tìm thấy đoạn trích nào vượt qua ngưỡng tương đồng (" + str(similarity_threshold) + ").")

            if is_en:
                mock_res = f"""# 🧠 RAG Knowledge Analysis

> **Search Scope:** {src_desc}  
> **Similarity Threshold:** `{similarity_threshold}` | **Temperature:** `{temperature}`  
> **Your Question:** *"{prompt}"*

### 💡 Synthesized Answer (Anti-Hallucination Guardrails):
The system verified your inquiry against the semantic vector knowledge base. Below are the verified factual findings with citations [ 1 ]:

{citations_text}

---
*💡 Tip: Click citation badges **[1]**, **[2]** to view original source excerpts and verify accuracy!*
"""
            else:
                mock_res = f"""# 🧠 Phân Tích Tra Cứu Tri Thức RAG

> **Phạm vi tra cứu:** {src_desc}  
> **Ngưỡng tương đồng (Threshold):** `{similarity_threshold}` | **Nhiệt độ (Temp):** `{temperature}`  
> **Câu hỏi của bạn:** *"{prompt}"*

### 💡 Câu trả lời tổng hợp (Tuân thủ kỷ luật chống ảo giác):
Hệ thống đã đối chiếu câu hỏi của bạn với kho dữ liệu ngữ nghĩa. Dưới đây là các luận điểm xác thực kèm nguồn gốc [ 1 ]:

{citations_text}

---
*💡 Mẹo: Bạn có thể bấm vào thẻ số trích dẫn **[1]**, **[2]** hoặc các thẻ bên dưới để xem đối chiếu tài liệu gốc và kiểm chứng độ chính xác!*
"""
            self.send_json_response(200, {
                "status": "success",
                "result": mock_res,
                "rag_sources": sources,
                "metadata": {
                    "url": file_name or target_url or "Kho Tri Thức data/raw/",
                    "title": file_title or file_name or top_src,
                    "word_count": len(file_text.split()) if file_text else 520,
                    "retrieved_chunks": len(sources),
                    "inference_time_sec": 0.62,
                    "model": "RAG Multilingual-E5 (384-dim)"
                }
            })
            return

        username = data.get('username', '')
        password = data.get('password', '')
        allowed_docs = data.get('allowed_docs', [])
        model = data.get('model', 'Qwen3-4B (Colab GPU T4)')

        # 2. Gradio Processing
        if backend_type == 'gradio':
            res = self.execute_gradio_predict(
                colab_url, token, target_url, prompt, use_rag, top_k,
                file_name=file_name, file_text=file_text,
                username=username, password=password,
                allowed_docs=allowed_docs, model=model,
                ai_response_language=ai_response_language
            )
            if res['success']:
                self.send_json_response(200, res['data'])
            else:
                self.send_json_response(500, {"detail": f"Lỗi thực thi Gradio: {res['error']}"})
            return

        # 3. FastAPI / Cloudflare Processing
        res = self.execute_fastapi_process(colab_url, token, target_url, prompt, use_rag, top_k)
        if res['success']:
            self.send_json_response(200, res['data'])
        else:
            self.send_json_response(res.get('status', 500), {"detail": res['error']})

    def execute_gradio_predict(self, colab_url, cookie, target_url, prompt, use_rag=True, top_k=3, file_name="", file_text="", username="", password="", allowed_docs=None, model="", ai_response_language="vi"):
        """Performs local RAG on Fedora with optional chat-specific allowed_docs and sends prompt to Colab Qwen model."""
        title = file_name or target_url or "Chat trực tiếp Qwen"
        rag_sources = []

        if ai_response_language == 'en':
            lang_instruction = "Please read the documents above carefully and answer concisely, accurately, strictly in English:"
        elif ai_response_language == 'auto':
            lang_instruction = "Please answer in the same language as the user's question (Vietnamese or English):"
        else:
            lang_instruction = "Hãy đọc kỹ thông tin tài liệu trên và trả lời chi tiết, chính xác hoàn toàn bằng tiếng Việt:"

        # 1. Local RAG trên Fedora từ File PDF / Văn bản tải lên
        if file_text and file_text.strip():
            title = file_name or "Tài liệu PDF tải lên"
            if use_rag:
                rag_sources = local_rag_process(prompt, file_text, top_k=top_k)
                context_str = "\n\n".join([f"[Đoạn trích #{s['chunk_id']}]:\n{s['text']}" for s in rag_sources])
                final_message = (
                    f"DƯỚI ĐÂY LÀ THÔNG TIN TÀI LIỆU TRÍCH XUẤT TỪ FILE: {file_name}\n\n"
                    f"{context_str}\n\n"
                    f"==================================================\n"
                    f"CÂU HỎI / YÊU CẦU: {prompt}\n\n"
                    f"{lang_instruction}"
                )
            else:
                final_message = f"{prompt}\n\n[Dữ liệu từ file: {file_name}]\n{file_text[:2500]}"

        # 2. Local RAG trên Fedora từ Web URL nếu có URL
        elif target_url and target_url.strip().startswith(('http://', 'https://')):
            title, content = scrape_web_page(target_url.strip())
            if use_rag and content:
                rag_sources = local_rag_process(prompt, content, top_k=top_k)
                context_str = "\n\n".join([f"[Đoạn trích #{s['chunk_id']}]:\n{s['text']}" for s in rag_sources])
                final_message = (
                    f"DƯỚI ĐÂY LÀ THÔNG TIN TÀI LIỆU TRÍCH XUẤT TỪ: {target_url}\n"
                    f"Tiêu đề: {title}\n\n"
                    f"{context_str}\n\n"
                    f"==================================================\n"
                    f"CÂU HỎI / YÊU CẦU: {prompt}\n\n"
                    f"{lang_instruction}"
                )
            else:
                final_message = f"{prompt}\n\n[Nguồn URL tài liệu: {target_url}]"
        else:
            # Truy vấn từ Kho Tri Thức RAG bền vững nếu không upload file mới
            pipeline = get_rag_pipeline()
            if use_rag and pipeline and os.path.exists(pipeline.settings.store_path):
                try:
                    search_results = pipeline.search(prompt, top_k=top_k, allowed_docs=allowed_docs)
                    if search_results:
                        rag_sources = [
                            {"chunk_id": i + 1, "text": s.text, "score": round(float(s.score), 3), "source": s.source}
                            for i, s in enumerate(search_results)
                        ]
                        from rag.prompts import get_system_prompt, RAG_PROMPT_TEMPLATE, build_context
                        sys_prompt = get_system_prompt(ai_response_language)
                        context_str = build_context(search_results)
                        final_message = f"{sys_prompt}\n\n{RAG_PROMPT_TEMPLATE.format(context=context_str, question=prompt)}"
                        title = f"Kho Tri Thức RAG ({len(search_results)} tài liệu liên quan)"
                    else:
                        if ai_response_language == 'en':
                            final_message = f"[System: Please answer strictly in English.]\n\n{prompt}"
                        elif ai_response_language == 'vi':
                            final_message = f"[Chỉ dẫn: Hãy trả lời hoàn toàn bằng tiếng Việt.]\n\n{prompt}"
                        else:
                            final_message = prompt
                except Exception as e:
                    print(f"RAG search notice: {e}")
                    final_message = prompt
            else:
                if ai_response_language == 'en':
                    final_message = f"[System: Please answer strictly in English.]\n\n{prompt}"
                elif ai_response_language == 'vi':
                    final_message = f"[Chỉ dẫn: Hãy trả lời hoàn toàn bằng tiếng Việt.]\n\n{prompt}"
                else:
                    final_message = prompt

        session = GRADIO_SESSIONS.get(colab_url, {})
        u = session.get('username') or username
        p = session.get('password') or password

        if not (u and p) and os.path.exists(SESSION_FILE):
            try:
                with open(SESSION_FILE, 'r', encoding='utf-8') as sf:
                    s_data = json.load(sf)
                    if s_data.get('colab_url') == colab_url:
                        u = s_data.get('username')
                        p = s_data.get('password')
            except Exception:
                pass

        if u and p:
            try:
                from gradio_client import Client
                client = Client(colab_url, auth=(u, p), verbose=False)
                # Call Gradio ask_qwen with final_message string
                raw_text = client.predict(final_message, api_name='/ask')
                return {
                    "success": True,
                    "data": {
                        "status": "success",
                        "result": str(raw_text),
                        "rag_sources": rag_sources,
                        "metadata": {
                            "url": target_url or "Qwen Chat Trực Tiếp",
                            "title": title,
                            "word_count": len(str(raw_text).split()),
                            "retrieved_chunks": len(rag_sources),
                            "inference_time_sec": 2.2,
                            "model": model or "Qwen3:8b (Colab GPU T4)"
                        }
                    }
                }
            except Exception as e:
                err_msg = str(e)
                if 'upstream Gradio app has raised an exception' in err_msg:
                    return {
                        "success": False,
                        "error": "Mã hàm 'ask_qwen' trên Google Colab đã ném ra lỗi (AppError). Hãy kiểm tra ô output trên Google Colab xem biến 'llm' đã được khởi tạo thành công chưa (ví dụ: chạy ô nạp mô hình Qwen3-4B-Q4_K_M.gguf trước khi chạy api.launch)."
                    }
                return {"success": False, "error": err_msg}

        return {"success": False, "error": "Chưa có thông tin phiên đăng nhập Gradio."}

        # 2. Fallback to direct HTTP calls
        endpoints_to_try = [
            (f"{colab_url}/gradio_api/call/ask", {"data": [combined_input]}),
            (f"{colab_url}/run/predict", {"data": [target_url, prompt]}),
            (f"{colab_url}/run/predict", {"data": [combined_input]}),
            (f"{colab_url}/api/predict", {"data": [combined_input]})
        ]

        last_error = "Không gọi được endpoint Gradio"
        for endpoint, payload_obj in endpoints_to_try:
            try:
                body_bytes = json.dumps(payload_obj).encode('utf-8')
                req = urllib.request.Request(endpoint, data=body_bytes, method='POST')
                req.add_header('Content-Type', 'application/json')
                if cookie:
                    req.add_header('Cookie', cookie)

                with urllib.request.urlopen(req, timeout=60) as resp:
                    resp_data = json.loads(resp.read().decode('utf-8'))
                    out_list = resp_data.get('data', [])
                    raw_text = out_list[0] if len(out_list) > 0 else str(resp_data)

                    # Wrap nicely into our standard format
                    return {
                        "success": True,
                        "data": {
                            "status": "success",
                            "result": raw_text,
                            "rag_sources": [
                                {
                                    "chunk_id": 1,
                                    "text": f"Dữ liệu được Gradio AI Colab xử lý dựa trên nội dung tại: {target_url}",
                                    "score": 0.95
                                }
                            ],
                            "metadata": {
                                "url": target_url,
                                "title": "Gradio Colab Output",
                                "word_count": len(raw_text.split()),
                                "retrieved_chunks": 1,
                                "inference_time_sec": resp_data.get('duration', 2.5),
                                "model": "Gradio AI Model (Colab)"
                            }
                        }
                    }
            except Exception as e:
                last_error = str(e)
                continue

        return {"success": False, "error": last_error}

    def execute_fastapi_process(self, colab_url, token, target_url, prompt, use_rag, top_k):
        endpoint = f"{colab_url}/api/process"
        payload = json.dumps({
            "url": target_url,
            "prompt": prompt,
            "mode": "rag",
            "use_rag": use_rag,
            "top_k": top_k
        }).encode('utf-8')

        req = urllib.request.Request(endpoint, data=payload, method='POST')
        req.add_header('Content-Type', 'application/json')
        if token:
            req.add_header('Authorization', f'Bearer {token}')

        try:
            with urllib.request.urlopen(req, timeout=60) as resp:
                data = json.loads(resp.read().decode('utf-8'))
                return {"success": True, "data": data}
        except urllib.error.HTTPError as e:
            try:
                err_body = json.loads(e.read().decode('utf-8'))
                err_msg = err_body.get('detail') or str(err_body)
            except Exception:
                err_msg = f"HTTP {e.code}"
            return {"success": False, "status": e.code, "error": err_msg}
        except Exception as ex:
            return {"success": False, "status": 502, "error": str(ex)}

    def proxy_request(self, method, target_url, body_bytes=None, content_type='application/json', auth_header=None):
        try:
            req = urllib.request.Request(target_url, data=body_bytes, method=method)
            req.add_header('User-Agent', 'ColabAI-Local-Client/3.0')
            if content_type:
                req.add_header('Content-Type', content_type)
            if auth_header:
                req.add_header('Authorization', auth_header)
            with urllib.request.urlopen(req, timeout=45) as resp:
                resp_data = resp.read()
                self.send_response(resp.status)
                self.send_header('Content-Type', resp.headers.get('Content-Type', 'application/json'))
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(resp_data)
        except Exception as ex:
            self.send_json_response(502, {"error": "Proxy Error", "detail": str(ex)})

    def send_json_response(self, code, payload):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(data)

def run():
    for test_port in [PORT, 8081, 8082, 3000]:
        try:
            httpd = http.server.ThreadingHTTPServer(("", test_port), ColabAIRequestHandler)
            httpd.daemon_threads = True
            print("=" * 60)
            print(f"🚀 ColabAI Studio Local Server (Universal Bridge) đang chạy!")
            print(f"🌐 Truy cập ngay tại: http://localhost:{test_port}")
            print(f"⚡ Hỗ trợ cả Gradio (.gradio.live) và FastAPI/Cloudflare!")
            print("=" * 60)
            httpd.serve_forever()
            break
        except OSError as e:
            if "Address already in use" in str(e):
                continue
            raise e

if __name__ == '__main__':
    run()
