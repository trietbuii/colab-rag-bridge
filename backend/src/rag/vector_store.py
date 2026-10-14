"""BƯỚC 4 & 5 — STORE + RETRIEVE: lưu vector và tìm kiếm theo độ tương đồng cosine.

Chuẩn theo video hướng dẫn 'RAG TỪ ZERO' (breslee1707/RAG_FROM_ZERO):
  - Viết thuần bằng NumPy để hiểu sâu cơ chế toán học bên trong RAG.
  - Tìm kiếm ngữ nghĩa thực chất là: Phép nhân ma trận (dot product) + Sắp xếp (argsort).
  - Chuẩn hoá mọi vector về độ dài 1 (L2 normalization) -> Cosine similarity chính là tích vô hướng.
  - Lưu trữ bền vững dưới dạng:
      * File nén nhị phân: `vector_store.npz`
      * File metadata: `vector_store.meta.json`
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import numpy as np


@dataclass
class SearchResult:
    """Một kết quả tìm kiếm: đoạn văn + nguồn + điểm tương đồng cosine."""

    text: str
    source: str
    score: float


class VectorStore:
    def __init__(self, vectors: np.ndarray, metadatas: list[dict]):
        # vectors: ma trận (N, D) ĐÃ chuẩn hoá L2; metadatas: thông tin kèm theo mỗi chunk
        self._vectors = vectors
        self._metadatas = metadatas

    @staticmethod
    def _normalize(matrix: np.ndarray) -> np.ndarray:
        """Chuẩn hoá từng hàng về độ dài 1 (để cosine = dot product)."""
        if matrix.size == 0:
            return matrix
        norms = np.linalg.norm(matrix, axis=1, keepdims=True)
        norms[norms == 0] = 1e-12  # tránh chia cho 0
        return matrix / norms

    @classmethod
    def build(cls, vectors: np.ndarray, metadatas: list[dict]) -> "VectorStore":
        """Tạo store mới từ vector thô (tự chuẩn hoá L2)."""
        return cls(cls._normalize(vectors.astype(np.float32)), metadatas)

    def search(
        self, query_vector: np.ndarray, top_k: int = 4, similarity_threshold: float = 0.0, allowed_sources: list[str] | None = None
    ) -> list[SearchResult]:
        """Trả về top_k đoạn có cosine cao nhất so với câu hỏi và vượt qua ngưỡng similarity_threshold.
        Nếu allowed_sources được cung cấp, chỉ trả về các đoạn thuộc các tài liệu này.
        """
        if not self._metadatas or self._vectors.size == 0:
            return []

        q = query_vector.astype(np.float32)
        q = q / (np.linalg.norm(q) + 1e-12)      # chuẩn hoá vector câu hỏi

        scores = self._vectors @ q               # (N,) điểm cosine cho toàn bộ các chunk
        top_idx = np.argsort(-scores)            # sắp xếp giảm dần

        # Chuẩn hoá danh sách allowed_sources nếu có
        allowed_set = None
        if allowed_sources and len(allowed_sources) > 0 and 'all' not in allowed_sources:
            allowed_set = [s.strip().lower() for s in allowed_sources if s.strip()]

        results: list[SearchResult] = []
        for i in top_idx:
            score_val = float(scores[i])
            if score_val < similarity_threshold:
                continue  # Bỏ qua các đoạn dưới ngưỡng tương đồng

            meta = self._metadatas[int(i)]
            source_name = meta.get("source", "")

            # Lọc theo nguồn tài liệu nếu có ràng buộc Knowledge Base riêng cho đoạn chat
            if allowed_set:
                source_lower = source_name.lower()
                source_basename = Path(source_name).name.lower()
                matched = any(
                    doc_item in source_lower or doc_item == source_basename
                    for doc_item in allowed_set
                )
                if not matched:
                    continue

            results.append(
                SearchResult(
                    text=meta["text"],
                    source=source_name,
                    score=score_val,
                )
            )
            if len(results) >= top_k:
                break

        return results

    # ----- Lưu / nạp từ đĩa -----

    def save(self, path: Path) -> None:
        """Lưu vector (.npz) và metadata (.meta.json) cạnh nhau."""
        path.parent.mkdir(parents=True, exist_ok=True)
        np.savez(path, vectors=self._vectors)
        meta_path = path.with_suffix(".meta.json")
        meta_path.write_text(
            json.dumps(self._metadatas, ensure_ascii=False, indent=2), encoding="utf-8"
        )

    @classmethod
    def load(cls, path: Path) -> "VectorStore":
        """Nạp lại store đã lưu. Báo lỗi thân thiện nếu chưa chạy ingest."""
        if not path.exists():
            raise FileNotFoundError(
                f"Chưa có vector store tại {path}.\n"
                "-> Hãy chạy trước: python scripts/ingest.py"
            )
        data = np.load(path)
        meta_path = path.with_suffix(".meta.json")
        if not meta_path.exists():
            raise FileNotFoundError(f"Không tìm thấy file metadata tương ứng: {meta_path}")
        metadatas = json.loads(meta_path.read_text(encoding="utf-8"))
        return cls(data["vectors"], metadatas)
