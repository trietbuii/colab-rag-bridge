"""Smoke test — kiểm tra nhanh các thành phần KHÔNG cần gọi API (chạy offline).

Chạy:
    python -m unittest tests/test_smoke.py
    (hoặc: pytest)

Mục đích: đảm bảo logic chia chunk và tìm kiếm vector hoạt động đúng,
mà không tốn quota API và không cần mạng internet.
"""

import sys
import unittest
from pathlib import Path

import numpy as np

# Cho phép import package 'rag' từ thư mục backend/src/
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend" / "src"))

from rag.chunker import chunk_text  # noqa: E402
from rag.vector_store import VectorStore  # noqa: E402


class TestRAGSmoke(unittest.TestCase):
    def test_chunk_text_respects_size_and_overlap(self):
        text = "a" * 1000
        chunks = chunk_text(text, chunk_size=300, overlap=50)

        self.assertGreater(len(chunks), 1)                       # phải chia thành nhiều đoạn
        self.assertTrue(all(len(c) <= 300 for c in chunks))      # không đoạn nào vượt chunk_size
        # Đoạn 2 phải bắt đầu bằng phần đuôi chồng lấn của đoạn 1
        self.assertEqual(chunks[1][:50], chunks[0][-50:])

    def test_chunk_text_empty_returns_empty(self):
        self.assertEqual(chunk_text("   ", chunk_size=100, overlap=10), [])

    def test_vector_store_search_ranks_by_similarity(self):
        # 3 vector: doc0 trùng hướng câu hỏi, doc2 gần, doc1 vuông góc
        vectors = np.array([[1, 0, 0], [0, 1, 0], [0.9, 0.1, 0]], dtype=np.float32)
        metas = [{"text": f"doc{i}", "source": "t", "index": i} for i in range(3)]
        store = VectorStore.build(vectors, metas)

        results = store.search(np.array([1, 0, 0], dtype=np.float32), top_k=2)

        self.assertEqual(len(results), 2)
        self.assertEqual(results[0].text, "doc0")               # giống nhất đứng đầu
        self.assertGreaterEqual(results[0].score, results[1].score)  # điểm giảm dần


if __name__ == "__main__":
    unittest.main()
