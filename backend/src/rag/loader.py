"""BƯỚC 1 — LOAD: Đọc tài liệu thô từ thư mục data/raw.

Hỗ trợ .txt, .md, .markdown và .pdf. Mỗi file trở thành một `Document`.
Đây là "nguyên liệu đầu vào" cho toàn bộ pipeline RAG.
"""

from __future__ import annotations

import os
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

# Các định dạng văn bản thuần đọc trực tiếp được
_TEXT_SUFFIXES = {".txt", ".md", ".markdown", ".csv"}


@dataclass
class Document:
    """Một tài liệu đã đọc vào bộ nhớ."""

    source: str  # Tên file (tương đối) để sau này trích dẫn nguồn
    text: str    # Toàn bộ nội dung văn bản


def _read_pdf(path: Path) -> str:
    """Đọc nội dung text từ file PDF (sử dụng pypdf hoặc pdftotext trên Fedora)."""
    # Cách 1: pypdf
    try:
        from pypdf import PdfReader
        reader = PdfReader(str(path))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        if text.strip():
            return text
    except Exception:
        pass

    # Cách 2: pdftotext poppler-utils
    try:
        res = subprocess.run(["pdftotext", "-layout", str(path), "-"], capture_output=True, text=True)
        if res.returncode == 0 and res.stdout.strip():
            return res.stdout.strip()
    except Exception:
        pass

    # Cách 3: Fallback đọc dạng văn bản (nếu file được lưu sẵn dạng text)
    try:
        text = path.read_text(encoding="utf-8")
        if text.strip():
            return text
    except Exception:
        try:
            text = path.read_text(encoding="latin-1", errors="ignore")
            if text.strip():
                return text
        except Exception:
            pass

    return ""


def _read_docx(path: Path) -> str:
    """Đọc nội dung text từ file Word (.docx) thuần bằng zipfile và ElementTree tiêu chuẩn."""
    import zipfile
    import xml.etree.ElementTree as ET
    try:
        with zipfile.ZipFile(str(path)) as z:
            xml_content = z.read("word/document.xml")
        tree = ET.fromstring(xml_content)
        ns = {"w": "http://schemas.openxmlformats.org/wordprocessingml/2006/main"}
        paragraphs = []
        for p in tree.findall(".//w:p", ns):
            texts = [node.text for node in p.findall(".//w:t", ns) if node.text]
            if texts:
                paragraphs.append("".join(texts))
        return "\n".join(paragraphs)
    except Exception as e:
        print(f"Docx parsing notice for {path}: {e}")
        return ""


def load_documents(raw_dir: Path) -> list[Document]:
    """Duyệt đệ quy thư mục raw_dir, đọc mọi file được hỗ trợ (.txt, .md, .csv, .pdf, .docx)."""
    documents: list[Document] = []
    if not raw_dir.exists():
        return documents

    for path in sorted(raw_dir.rglob("*")):
        if not path.is_file():
            continue

        suffix = path.suffix.lower()
        if suffix in _TEXT_SUFFIXES:
            try:
                text = path.read_text(encoding="utf-8")
            except Exception:
                text = path.read_text(encoding="latin-1", errors="ignore")
        elif suffix == ".pdf":
            text = _read_pdf(path)
        elif suffix == ".docx":
            text = _read_docx(path)
        else:
            continue  # Bỏ qua định dạng không hỗ trợ

        text = text.strip()
        if text:  # Bỏ qua file rỗng
            documents.append(
                Document(source=str(path.relative_to(raw_dir)), text=text)
            )

    return documents
