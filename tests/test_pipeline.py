"""Kiểm thử tích hợp RAGPipeline và Guardrails."""

import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "backend" / "src"))

from rag.config import load_settings
from rag.loader import load_documents
from rag.pipeline import RAGPipeline


class TestRAGPipeline(unittest.TestCase):
    def test_settings_load(self):
        settings = load_settings()
        self.assertEqual(settings.chunk_size, 800)
        self.assertEqual(settings.chunk_overlap, 120)
        self.assertEqual(settings.top_k, 4)

    def test_load_documents(self):
        settings = load_settings()
        docs = load_documents(settings.raw_dir)
        self.assertGreater(len(docs), 0)


if __name__ == "__main__":
    unittest.main()
