"""BƯỚC 6 — GENERATE: Gọi API Google Colab GPU Qwen3-4B để sinh câu trả lời.

Theo kiến trúc video 'RAG TỪ ZERO', lớp LLM bọc toàn bộ lời gọi sinh văn bản:
  - Nhận prompt đã ghép ngữ cảnh và chỉ dẫn hệ thống (anti-hallucination guardrails).
  - Kết nối trực tiếp tới mô hình Qwen3-4B đang chạy trên GPU Tesla T4 của Google Colab
    thông qua Gradio API endpoint `/ask`.
  - Tự động xác thực tài khoản và xử lý lỗi kết nối một cách an toàn.
"""

from __future__ import annotations

import json
import logging
import urllib.parse
import urllib.request
import ssl

logger = logging.getLogger(__name__)


class ColabQwenLLM:
    """Bọc lời gọi API Colab Qwen3-4B Gradio endpoint /ask."""

    def __init__(self, colab_url: str, username: str = "triet", password: str = "QwenFedora7392!"):
        self.colab_url = colab_url.rstrip("/")
        self.username = username
        self.password = password
        self._is_mock = "mock-colab" in self.colab_url

    def generate(self, prompt: str, system: str | None = None) -> str:
        """Sinh văn bản từ prompt bằng Colab Qwen3-4B."""
        # Ghép system instruction vào đầu prompt nếu có
        full_message = f"{system}\n\n{prompt}" if system else prompt

        # 1. Chế độ Mock test (nếu chưa bật Colab hoặc URL chứa mock-colab)
        if self._is_mock or not self.colab_url.startswith(("http://", "https://")):
            return self._mock_response(prompt)

        # 2. Thử gọi bằng gradio_client
        try:
            from gradio_client import Client
            client = Client(self.colab_url, auth=(self.username, self.password), verbose=False)
            res = client.predict(full_message, api_name="/ask")
            if res:
                return str(res).strip()
        except Exception as e:
            logger.warning(f"gradio_client call failed: {e}. Thử phương thức HTTP trực tiếp...")

        # 3. Thử gọi qua HTTP REST endpoint của Gradio
        try:
            http_res = self._call_http_gradio(full_message)
            if http_res:
                return http_res
        except Exception as e:
            logger.warning(f"HTTP Gradio call failed: {e}")

        # 4. Nếu Colab chưa bật hoặc bị ngắt kết nối
        return (
            f"⚠️ Không thể kết nối tới Google Colab tại: {self.colab_url}\n"
            f"Vui lòng kiểm tra:\n"
            f"  1. Notebook trên Google Colab đã chạy ô 'api.launch(...)' chưa.\n"
            f"  2. Đã cập nhật đúng URL `https://xxxx.gradio.live` vào file .env chưa.\n\n"
            f"🤖 [Nội dung phân tích giả lập từ ngữ cảnh]:\n"
            f"{self._mock_response(prompt)}"
        )

    def _call_http_gradio(self, message: str) -> str | None:
        """Gọi dự phòng qua HTTP Gradio API."""
        ctx = ssl.create_default_context()
        ctx.check_hostname = False
        ctx.verify_mode = ssl.CERT_NONE

        endpoint = f"{self.colab_url}/gradio_api/call/ask"
        payload = json.dumps({"data": [message]}).encode("utf-8")
        req = urllib.request.Request(endpoint, data=payload, method="POST")
        req.add_header("Content-Type", "application/json")

        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            if "event_id" in data:
                # Gradio streaming event
                event_id = data["event_id"]
                stream_url = f"{self.colab_url}/gradio_api/call/ask/{event_id}"
                s_req = urllib.request.Request(stream_url, method="GET")
                with urllib.request.urlopen(s_req, context=ctx, timeout=30) as s_resp:
                    raw_lines = s_resp.read().decode("utf-8").split("\n")
                    for line in raw_lines:
                        if line.startswith("data: "):
                            d = json.loads(line[6:])
                            if isinstance(d, list) and d:
                                return str(d[0]).strip()
        return None

    def _mock_response(self, prompt: str) -> str:
        """Phản hồi kiểm thử dựa trên ngữ cảnh đã trích xuất."""
        # Trích lọc dòng câu hỏi
        lines = prompt.split("\n")
        question = ""
        context_lines = []
        for l in lines:
            if l.startswith("CÂU HỎI:"):
                question = l.replace("CÂU HỎI:", "").strip()
            elif l.startswith("[") or "nguồn:" in l:
                context_lines.append(l)

        return (
            f"Dựa vào các tài liệu được cung cấp trong kho lưu trữ:\n\n"
            f"- Về câu hỏi '{question}': Hệ thống RAG (Retrieval-Augmented Generation) "
            f"đã trích xuất các đoạn ngữ cảnh phù hợp nhất từ kho dữ liệu `data/raw/`.\n"
            f"- Mô hình kết hợp ngữ cảnh đã truy xuất cùng với chỉ dẫn chống ảo giác để đưa ra "
            f"câu trả lời chuẩn xác nhất mà không cần phải huấn luyện lại (fine-tune) mô hình nền."
        )
