# 🌉 Colab-RAG-Bridge (ResearchMate)

> **A Hybrid Architecture RAG system for scientific research: Local pure NumPy-powered Vector Store paired with Qwen3-4B inference on Google Colab (Tesla T4 GPU), featuring session-isolated Knowledge Bases.**

Hệ thống RAG hoàn chỉnh theo kiến trúc lai (Hybrid Architecture), kết hợp mô hình embedding ngữ nghĩa cục bộ chạy miễn phí trên máy cá nhân và suy luận LLM **Google Colab GPU Tesla T4 (Qwen3-4B)** qua Gradio API.

---

## 📂 Cấu Trúc Dự Án Hoàn Chỉnh

```text
Local AI/
├── 📁 data/
│   ├── 📄 raw/                        # Nơi chứa tài liệu thô (.txt, .md, .pdf)
│   │   ├── 01-rag-la-gi.md
│   │   └── 02-embedding-va-vector-store.md
│   └── 💾 processed/                  # Vector Store bền vững sau khi ingest
│       ├── vector_store.npz           # Ma trận vector số chuẩn hoá L2
│       └── vector_store.meta.json     # Metadata văn bản và nguồn trích dẫn
│
├── 🧠 src/                            # Mã nguồn ứng dụng (Python Package)
│   ├── rag/                           # 1. Thư viện RAG lõi theo chuẩn video (Engine)
│   │   ├── config.py                  # Đọc cấu hình từ .env (Settings)
│   │   ├── loader.py                  # Đọc tài liệu (.txt, .md, .pdf bằng pypdf & pdftotext)
│   │   ├── chunker.py                 # Cắt văn bản: chunk_size=800, overlap=120
│   │   ├── embeddings.py              # LocalEmbedder (intfloat/multilingual-e5-small)
│   │   ├── vector_store.py            # VectorStore NumPy (tích vô hướng cosine & argsort)
│   │   ├── prompts.py                 # System Guardrail chống ảo giác & template prompt
│   │   ├── llm.py                     # ColabQwenLLM kết nối Google Colab GPU T4 Gradio API
│   │   └── pipeline.py                # RAGPipeline: ingest() offline & answer() online
│   └── backend/                       # 2. Máy chủ Web & API Colab Bridge
│       └── server.py                  # Cầu nối HTTP, phục vụ Web UI & API RAG
│
├── 🛠️ scripts/                        # Các lệnh CLI dòng lệnh theo video
│   ├── ingest.py                      # Giai đoạn OFFLINE: nạp data/raw vào vector store
│   └── ask.py                         # Giai đoạn ONLINE: đặt câu hỏi và trích nguồn
│
├── 🧪 tests/                          # 4. Kiểm tra code còn chạy đúng (Smoke tests offline)
│   ├── test_smoke.py                  # Kiểm tra chunking & tìm kiếm vector
│   └── test_pipeline.py               # Kiểm tra tích hợp pipeline
│
├── 📓 notebooks/                      # 5. Nơi thử nghiệm, không phải core
│   └── 01_rag_tu_zero_demo.ipynb      # Thử nghiệm từng bước tương tác trực quan
│
├── 📖 docs/                           # Tài liệu học tập & hướng dẫn sử dụng
│   ├── GIAO_TRINH_RAG_TU_ZERO.md      # 🎓 Giáo trình RAG Từ Zero chi tiết (dạy học)
│   └── HUONG_DAN_SU_DUNG.md           # Hướng dẫn thao tác chi tiết
├── 🌐 frontend/                       # Giao diện Web trực quan (Dashboard, upload PDF)
├── ☁️ colab/                          # Sổ tay Google Colab GPU T4 (Qwen3-4B Gradio API)
├── .env                               # Cấu hình biến môi trường & Colab URL
├── server.py                          # Khởi chạy Web Server cục bộ tại cổng 8080
└── run.sh                             # Phím tắt 1-click khởi chạy
```

---

## ⚡ 6 Bước Cốt Lõi Của RAG (Theo Video)

1. **LOAD** (`src/rag/loader.py`): Đọc văn bản thô từ file `.txt`, `.md`, và file `.pdf`.
2. **CHUNK** (`src/rag/chunker.py`): Chia nhỏ văn bản thành các đoạn 800 ký tự với 120 ký tự chồng lấn để bảo toàn ngữ cảnh.
3. **EMBED** (`src/rag/embeddings.py`): Mô hình `intfloat/multilingual-e5-small` chạy trực tiếp trên máy biến văn bản thành vector ngữ nghĩa 384 chiều (miễn phí, không tốn quota).
4. **STORE** (`src/rag/vector_store.py`): Chuẩn hoá L2 và lưu trữ vào `data/processed/vector_store.npz`.
5. **RETRIEVE** (`src/rag/vector_store.py`): Chuẩn hoá câu hỏi, tính tích vô hướng (cosine similarity) và lấy top k đoạn liên quan nhất.
6. **GENERATE** (`src/rag/llm.py`): Áp dụng 3 quy tắc Guardrail chống ảo giác, gửi prompt kèm ngữ cảnh tới **Google Colab GPU Qwen3-4B** để sinh câu trả lời chính xác.

---

## 🖥️ Cách Dùng Dòng Lệnh (CLI Theo Video)

### Bước 1: Nạp tài liệu vào Vector Store
Thêm các file `.txt`, `.md`, hoặc `.pdf` vào `data/raw/`, sau đó chạy:
```bash
python scripts/ingest.py
```

### Bước 2: Đặt câu hỏi
```bash
# Hỏi một câu nhanh:
python scripts/ask.py "Muốn model biết dữ liệu mới mà không fine-tune thì làm gì?"

# Hoặc vào chế độ trò chuyện liên tục:
python scripts/ask.py
```

---

## 🌐 Cách Dùng Giao Diện Web

Chạy lệnh:
```bash
./run.sh
```
Trình duyệt sẽ mở tại **[http://localhost:8080](http://localhost:8080)**:
- Đăng nhập với URL Colab của bạn (ví dụ `https://xxxx.gradio.live`, user: `triet`, pass: `QwenFedora7392!`).
- Đặt câu hỏi trực tiếp: Web UI sẽ tự động kết nối với Kho Tri Thức RAG và hiển thị các đoạn trích dẫn nguồn có điểm tương đồng cosine.
