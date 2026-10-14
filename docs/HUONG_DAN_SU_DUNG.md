# 📖 Hướng Dẫn Sử Dụng ColabAI Studio (Phiên Bản RAG & Xác Thực Colab)

Hệ thống cho phép bạn chạy toàn bộ tiến trình **RAG (Retrieval-Augmented Generation)** và mô hình LLM trên **Google Colab (GPU T4 miễn phí)**, kết nối bảo mật trực tiếp với máy tính của bạn.

---

## 🔐 1. Luồng Hoạt Động & Bảo Mật Mới

1. Khi mở Web trên máy tính, giao diện chính **bị khóa hoàn toàn**.
2. Bạn phải nhập:
   - **Đường dẫn URL Colab** (`https://xxxx.trycloudflare.com`).
   - **Tài khoản Colab** (Mặc định: `admin`).
   - **Mật khẩu Colab** (Mặc định: `colab2026` - bạn có thể tự đổi trong Colab).
3. Colab sẽ kiểm tra và cấp Token xác thực (`Bearer Token`). **Chỉ khi đăng nhập thành công, bạn mới được truy cập vào giao diện Dashboard!**

---

## 🧠 2. Cơ Chế RAG (Vector Search) Hoạt Động Như Thế Nào?

Khi bạn nhập một liên kết URL và câu hỏi/prompt:
```
[URL Trang Web] 
       │
       ▼ (1. Cào nội dung sạch)
[Văn bản trích xuất] 
       │
       ▼ (2. Chunking: Chia nhỏ thành các đoạn 250 từ, overlap 40 từ)
[Các Chunks văn bản] 
       │
       ▼ (3. Embedding Model: sentence-transformers/all-MiniLM-L6-v2)
[Vector Database trong RAM Colab]
       ▲
       │ (4. Vector Search Cosine Similarity với Câu hỏi của bạn)
[Top 3-5 Chunks liên quan nhất]
       │
       ▼ (5. Augmented Prompt nạp vào LLM Qwen2.5-Instruct)
[Câu trả lời có dẫn chứng + Danh sách Chunks trích dẫn kèm % độ khớp]
```

---

## 🚀 3. Hướng Dẫn Sử Dụng Từng Bước

### Bước 1: Khởi động trên máy tính
Mở Terminal và chạy:
```bash
./run.sh
```
Trình duyệt sẽ mở trang: **[http://localhost:8080](http://localhost:8080)**

---

### Bước 2: Chạy trên Google Colab
1. Mở [Google Colab](https://colab.research.google.com).
2. Tải tệp [colab/colab_ai_server.ipynb](file:///home/trietbui/Documents/HK5/Local%20AI/colab/colab_ai_server.ipynb) lên (Menu *File* &rarr; *Upload notebook*).
3. Bật GPU: Menu *Runtime* &rarr; *Change runtime type* &rarr; Chọn **T4 GPU** &rarr; Bấm *Save*.
4. Chạy toàn bộ: Menu *Runtime* &rarr; *Run all*.
5. Cuối ô số 4, bạn sẽ nhận được thông tin:
   ```text
   =================================================================
   🎉 MÁY CHỦ COLAB RAG ĐÃ SẴN SÀNG HOẠT ĐỘNG!
   👉 DÁN LINK NÀY VÀO MÀN HÌNH ĐĂNG NHẬP MÁY TÍNH:

        https://xxxx-xxxx.trycloudflare.com

   🔑 TÀI KHOẢN ĐĂNG NHẬP COLAB:
      - Tên đăng nhập: admin
      - Mật khẩu:      colab2026
   =================================================================
   ```

---

### Bước 3: Đăng nhập & Bắt đầu sử dụng
1. Quay lại trang [http://localhost:8080](http://localhost:8080):
   - Dán URL Colab vào ô đầu tiên.
   - Nhập tài khoản: `admin` / Mật khẩu: `colab2026`.
   - Bấm **"Xác Thực & Vào Giao Diện"**.
2. **Khai thác RAG:**
   - Dán URL bài báo, tài liệu, blog công nghệ cần phân tích.
   - Tùy chọn số lượng trích dẫn: *Top 3 Chunks* hoặc *Top 5 Chunks*.
   - Nhập câu hỏi cụ thể & bấm **"Gửi đến Colab RAG xử lý"**.
3. **Xem kết quả:**
   - Xem câu trả lời đã được định dạng Markdown.
   - Bấm mở rộng phần **"Các Đoạn Trích Dẫn RAG (Vector Chunks)"** để xem trực tiếp các đoạn văn bản gốc và **% độ khớp ngữ nghĩa** mà AI đã tìm ra!
   - Tải kết quả về máy dạng `.md` hoặc `.json`.

---

### 🧪 Chế độ Test Nhanh (Chưa cần mở Colab)
Tại màn hình đăng nhập, bấm vào nút **"Dán link Test Mock"**:
- URL: `http://localhost:8080/api/mock-colab`
- User: `admin`
- Pass: `colab2026`
- Bấm **"Xác Thực & Vào Giao Diện"** để trải nghiệm ngay quy trình RAG cục bộ!
