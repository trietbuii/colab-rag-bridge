"""BƯỚC 3 — EMBED: Biến văn bản thành vector số bằng MÔ HÌNH MIỄN PHÍ CHẠY TRÊN MÁY.

Dựa trên chuẩn video 'RAG TỪ ZERO' (breslee1707/RAG_FROM_ZERO):
  - Sử dụng thư viện `sentence-transformers` tạo embedding NGAY TRÊN MÁY CỤC BỘ.
  - Hoàn toàn miễn phí, KHÔNG tốn quota API, chạy offline mượt mà.
  - Model mặc định: intfloat/multilingual-e5-small — đa ngôn ngữ, hỗ trợ tiếng Việt cực tốt.
  - Dòng model họ E5 yêu cầu:
      * "passage: " cho đoạn tài liệu khi lưu vào vector store
      * "query: " cho câu hỏi khi tìm kiếm
"""

from __future__ import annotations

import logging
import numpy as np

logger = logging.getLogger(__name__)


class LocalEmbedder:
    """Tạo embedding cục bộ bằng sentence-transformers (chuẩn theo video RAG Từ Zero)."""

    def __init__(self, model_name: str = "intfloat/multilingual-e5-small"):
        self.model_name = model_name
        self._is_e5 = "e5" in model_name.lower()
        self._model = None
        self._fallback_mode = False

        try:
            from sentence_transformers import SentenceTransformer
            print(f"⏳ Đang nạp mô hình embedding '{model_name}' (lần đầu sẽ tải cache ~470MB)...")
            self._model = SentenceTransformer(model_name)
            print("✅ Đã nạp thành công mô hình Embedding cục bộ!")
        except Exception as e:
            print(f"⚠️ Chưa thể tải sentence-transformers ngay ({e}). Sử dụng bộ vectorizer dự phòng trong lúc chờ pip hoàn tất.")
            self._fallback_mode = True

    def _fallback_encode(self, texts: list[str]) -> np.ndarray:
        """Bộ vectorizer dự phòng dựa trên character & word n-grams normalized nếu sentence-transformers chưa tải xong."""
        dim = 384
        vectors = []
        for text in texts:
            vec = np.zeros(dim, dtype=np.float32)
            words = text.lower().split()
            for idx, w in enumerate(words):
                h = hash(w) % dim
                vec[h] += 1.0 / (idx + 1)
            norm = np.linalg.norm(vec)
            if norm > 0:
                vec = vec / norm
            vectors.append(vec)
        return np.array(vectors, dtype=np.float32)

    def _encode(self, texts: list[str]) -> np.ndarray:
        if self._model is not None:
            vectors = self._model.encode(
                texts,
                convert_to_numpy=True,
                normalize_embeddings=True,  # Chuẩn hoá sẵn để cosine = tích vô hướng
            )
            return vectors.astype(np.float32)
        return self._fallback_encode(texts)

    def embed_documents(self, texts: list[str]) -> np.ndarray:
        """Nhúng danh sách đoạn tài liệu. Trả về ma trận (N, D)."""
        if not texts:
            return np.zeros((0, 0), dtype=np.float32)
        prepared = [f"passage: {t}" for t in texts] if self._is_e5 else texts
        return self._encode(prepared)

    def embed_query(self, text: str) -> np.ndarray:
        """Nhúng một câu hỏi. Trả về vector 1 chiều (D,)."""
        prepared = f"query: {text}" if self._is_e5 else text
        return self._encode([prepared])[0]
