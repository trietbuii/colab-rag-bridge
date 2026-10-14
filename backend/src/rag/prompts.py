"""Nơi tập trung các 'prompt' — lời chỉ dẫn gửi cho LLM.

Theo đúng chuẩn video 'RAG TỪ ZERO' (breslee1707/RAG_FROM_ZERO):
  - Tách riêng prompt giúp dễ bảo trì và tinh chỉnh mà không can thiệp vào logic.
  - Áp dụng 3 quy tắc Guardrail nghiêm ngặt để chống Hallucination (Ảo giác AI):
      1. CHỈ trả lời dựa trên NGỮ CẢNH được cung cấp.
      2. Nếu không có thông tin thì NÓI THẲNG là không tìm thấy, tuyệt đối không tự bịa.
      3. Trích dẫn rõ nguồn tài liệu [nguồn: tên_file].
"""

from __future__ import annotations

from .vector_store import SearchResult

# Chỉ dẫn vai trò (system) — ép model tuân thủ kỷ luật ngữ cảnh, chống bịa đặt.
SYSTEM_PROMPT_VI = (
    "Bạn là trợ lý AI nghiên cứu khoa học trả lời câu hỏi CHỈ dựa trên phần NGỮ CẢNH được cung cấp. "
    "Nếu ngữ cảnh không chứa đủ thông tin, hãy nói rõ là bạn không tìm thấy thông tin "
    "trong tài liệu, tuyệt đối không bịa. Trả lời ngắn gọn, chính xác, hoàn toàn bằng tiếng Việt. "
    "Khi có thể, hãy trích dẫn nguồn theo dạng [nguồn: tên_file]."
)

SYSTEM_PROMPT_EN = (
    "You are an AI scientific research assistant that answers questions based ONLY on the provided CONTEXT. "
    "If the context does not contain enough information, state clearly that you cannot find the information "
    "in the documents, never hallucinate or fabricate facts. Answer concisely, accurately, strictly in English. "
    "Whenever possible, cite sources in the format [source: filename]."
)

SYSTEM_PROMPT_AUTO = (
    "Bạn là trợ lý AI nghiên cứu khoa học trả lời câu hỏi CHỈ dựa trên phần NGỮ CẢNH được cung cấp. "
    "Nếu ngữ cảnh không chứa đủ thông tin, hãy nói rõ là bạn không tìm thấy thông tin trong tài liệu, tuyệt đối không bịa. "
    "Hãy trả lời bằng cùng ngôn ngữ với câu hỏi của người dùng (nếu hỏi tiếng Anh hãy đáp lại bằng tiếng Anh, nếu hỏi tiếng Việt hãy đáp lại bằng tiếng Việt). "
    "Khi có thể, hãy trích dẫn nguồn theo dạng [nguồn: tên_file]."
)

# Mặc định tương thích ngược
SYSTEM_PROMPT = SYSTEM_PROMPT_VI

def get_system_prompt(lang: str = "vi") -> str:
    """Trả về system prompt theo ngôn ngữ yêu cầu ('vi', 'en', hoặc 'auto')."""
    l = (lang or "vi").lower().strip()
    if l == "en":
        return SYSTEM_PROMPT_EN
    if l == "auto":
        return SYSTEM_PROMPT_AUTO
    return SYSTEM_PROMPT_VI


# Khung câu hỏi (user) — ghép ngữ cảnh trích xuất và câu hỏi của người dùng.
RAG_PROMPT_TEMPLATE = """NGỮ CẢNH:
{context}

CÂU HỎI: {question}

Hãy trả lời câu hỏi dựa trên NGỮ CẢNH ở trên."""


def build_context(results: list[SearchResult]) -> str:
    """Ghép các đoạn tìm được thành một khối ngữ cảnh, có đánh số thứ tự và ghi rõ nguồn gốc."""
    blocks = []
    for i, r in enumerate(results, start=1):
        blocks.append(f"[{i}] (nguồn: {r.source})\n{r.text}")
    return "\n\n".join(blocks)
