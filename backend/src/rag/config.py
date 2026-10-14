"""Cấu hình tập trung cho toàn bộ pipeline RAG.

Mọi tham số (Colab URL, tài khoản, model embedding, kích thước chunk...)
đều được đọc từ file .env và gói gọn trong một đối tượng `Settings` duy nhất.
"""

from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path

# Thư mục gốc của project (chứa data/ và .env): backend/src/rag/config.py -> <root>
_parents = Path(__file__).resolve().parents
PROJECT_ROOT = _parents[3] if len(_parents) > 3 and (_parents[3] / "data").exists() else _parents[2]


def _load_env_file(env_path: Path) -> None:
    """Đọc file .env đơn giản không cần phụ thuộc thư viện ngoài."""
    if not env_path.exists():
        return
    try:
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue
                k, v = line.split("=", 1)
                k = k.strip()
                v = v.strip().strip("'\"")
                if k and k not in os.environ:
                    os.environ[k] = v
    except Exception:
        pass


_load_env_file(PROJECT_ROOT / ".env")


@dataclass(frozen=True)
class Settings:
    """Toàn bộ cấu hình cần thiết, gom về một chỗ."""

    # --- Kết nối Colab GPU Qwen3-4B API ---
    colab_url: str
    colab_user: str
    colab_pass: str

    # --- Embedding cục bộ (sentence-transformers) ---
    embed_model: str

    # --- Đường dẫn dữ liệu ---
    raw_dir: Path       # Nơi chứa tài liệu gốc (.txt, .md, .pdf)
    store_path: Path    # Nơi lưu vector store đã build

    # --- Tham số RAG chuẩn từ video ---
    chunk_size: int     # 800 ký tự mỗi chunk
    chunk_overlap: int  # 120 ký tự chồng lấn
    top_k: int          # 4 đoạn trích dẫn hàng đầu


def load_settings() -> Settings:
    """Đọc cấu hình từ môi trường và trả về đối tượng Settings."""
    data_dir = PROJECT_ROOT / "data"

    return Settings(
        colab_url=os.getenv("COLAB_URL", "http://localhost:8080/api/mock-colab").strip(),
        colab_user=os.getenv("COLAB_USER", "triet").strip(),
        colab_pass=os.getenv("COLAB_PASS", "QwenFedora7392!").strip(),
        embed_model=os.getenv("EMBED_MODEL", "intfloat/multilingual-e5-small").strip(),
        raw_dir=data_dir / "raw",
        store_path=data_dir / "processed" / "vector_store.npz",
        chunk_size=int(os.getenv("RAG_CHUNK_SIZE", "800")),
        chunk_overlap=int(os.getenv("RAG_CHUNK_OVERLAP", "120")),
        top_k=int(os.getenv("RAG_TOP_K", "4")),
    )
