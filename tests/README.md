# 🧪 Thư Mục Tests (Kiểm Tra Code Còn Chạy Đúng)

> Theo đúng chuẩn video **"RAG TỪ ZERO"**:
> **"Kiểm tra code còn chạy đúng."**

Thư mục này chứa các bài kiểm thử tự động (Unit Test / Smoke Test) chạy hoàn toàn **offline**, không cần internet và không tốn quota API để xác minh logic băm nhỏ (chunking) và tìm kiếm vector (vector store) luôn hoạt động ổn định.

### Cách chạy:
```bash
# Chạy toàn bộ test:
python -m unittest discover tests

# Hoặc chạy riêng file smoke test:
python -m unittest tests/test_smoke.py
```
