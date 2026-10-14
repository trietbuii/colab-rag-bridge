"""RAGPipeline — lớp ĐIỀU PHỐI ghép toàn bộ 6 bước lại thành một quy trình hoàn chỉnh.

Theo đúng chuẩn video 'RAG TỪ ZERO' (breslee1707/RAG_FROM_ZERO):
  Toàn bộ RAG được rút gọn về HAI hành động cốt lõi:

  1. ingest()  — GIAI ĐOẠN OFFLINE (chạy mỗi khi có tài liệu mới):
       Load -> Chunk -> Embed -> Store

  2. answer()  — GIAI ĐOẠN ONLINE (chạy mỗi khi người dùng đặt câu hỏi):
       Embed câu hỏi -> Retrieve (tìm đoạn liên quan) -> Generate (Colab Qwen trả lời)
"""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

from . import prompts
from .chunker import chunk_documents, chunk_text
from .config import Settings, load_settings
from .embeddings import LocalEmbedder
from .llm import ColabQwenLLM
from .loader import Document, load_documents
from .vector_store import SearchResult, VectorStore


@dataclass
class RAGAnswer:
    """Kết quả trả về cho người dùng: câu trả lời + các nguồn trích dẫn đã dùng."""

    answer: str
    sources: list[SearchResult]


class RAGPipeline:
    """Quy trình RAG hoàn chỉnh theo video hướng dẫn."""

    def __init__(self, settings: Settings | None = None):
        self.settings = settings or load_settings()

        # LLM chạy bằng Google Colab GPU T4 Qwen3-4B API của người dùng
        self.llm = ColabQwenLLM(
            colab_url=self.settings.colab_url,
            username=self.settings.colab_user,
            password=self.settings.colab_pass,
        )

        # Embedding chạy cục bộ bằng sentence-transformers
        self.embedder = LocalEmbedder(self.settings.embed_model)

        self._store: VectorStore | None = None

    # ---------- GIAI ĐOẠN 1: INGEST (offline) ----------

    def ingest(self) -> int:
        """Đọc toàn bộ tài liệu trong data/raw/, chia chunk, tạo embedding và lưu vector store.

        Trả về số lượng chunk đã tạo.
        """
        documents = load_documents(self.settings.raw_dir)
        if not documents:
            raise RuntimeError(
                f"Không tìm thấy tài liệu nào trong {self.settings.raw_dir}.\n"
                "-> Hãy bỏ vài file .txt/.md/.pdf vào thư mục data/raw/ rồi thử lại."
            )

        chunks = chunk_documents(
            documents, self.settings.chunk_size, self.settings.chunk_overlap
        )
        vectors = self.embedder.embed_documents([c.text for c in chunks])
        metadatas = [
            {"text": c.text, "source": c.source, "index": c.index} for c in chunks
        ]

        store = VectorStore.build(vectors, metadatas)
        store.save(self.settings.store_path)
        self._store = store
        return len(chunks)

    def ingest_single_document(self, source_name: str, text: str) -> int:
        """Nạp trực tiếp một tài liệu văn bản/PDF tải lên vào vector store."""
        doc = Document(source=source_name, text=text)
        chunks = chunk_documents([doc], self.settings.chunk_size, self.settings.chunk_overlap)
        if not chunks:
            return 0

        vectors = self.embedder.embed_documents([c.text for c in chunks])
        metadatas = [
            {"text": c.text, "source": c.source, "index": c.index} for c in chunks
        ]

        store = VectorStore.build(vectors, metadatas)
        store.save(self.settings.store_path)
        self._store = store
        return len(chunks)

    # ---------- GIAI ĐOẠN 2: QUERY (online) ----------

    def search(
        self,
        question: str,
        top_k: int | None = None,
        similarity_threshold: float = 0.0,
        allowed_docs: list[str] | None = None,
    ) -> list[SearchResult]:
        """Chỉ thực hiện truy xuất (Retrieve) các đoạn liên quan nhất.
        Hỗ trợ lọc theo allowed_docs cho từng đoạn chat riêng biệt.
        """
        store = self._get_store()
        k = top_k or self.settings.top_k
        query_vector = self.embedder.embed_query(question)
        return store.search(
            query_vector,
            k,
            similarity_threshold=similarity_threshold,
            allowed_sources=allowed_docs
        )

    def answer(
        self,
        question: str,
        top_k: int | None = None,
        similarity_threshold: float = 0.0,
    ) -> RAGAnswer:
        """Trả lời một câu hỏi bằng quy trình Retrieve -> Generate."""
        store = self._get_store()
        k = top_k or self.settings.top_k

        # (a) Nhúng câu hỏi thành vector rồi tìm các đoạn liên quan nhất
        query_vector = self.embedder.embed_query(question)
        results = store.search(query_vector, k, similarity_threshold=similarity_threshold)

        # (b) Ghép ngữ cảnh + câu hỏi thành prompt theo chuẩn và nhờ Colab Qwen trả lời
        context = prompts.build_context(results)
        prompt = prompts.RAG_PROMPT_TEMPLATE.format(
            context=context, question=question
        )
        answer_text = self.llm.generate(prompt, system=prompts.SYSTEM_PROMPT)

        return RAGAnswer(answer=answer_text, sources=results)

    def delete_document(self, filename: str) -> int:
        """Xóa file khỏi data/raw/ (kể cả trong thư mục con) và re-ingest lại toàn bộ."""
        target_file = self.settings.raw_dir / filename
        if not target_file.exists():
            for p in self.settings.raw_dir.rglob("*"):
                if p.is_file() and (p.name == filename or str(p.relative_to(self.settings.raw_dir)) == filename):
                    target_file = p
                    break
        if target_file.exists():
            target_file.unlink()
        return self.ingest()

    # ---------- Tiện ích nội bộ ----------

    def _get_store(self) -> VectorStore:
        """Nạp vector store từ đĩa (cache trong RAM)."""
        if self._store is None:
            self._store = VectorStore.load(self.settings.store_path)
        return self._store
