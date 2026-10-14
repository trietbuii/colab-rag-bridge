#!/usr/bin/env python3
"""
ColabAI Studio - Main Entry Point
Khởi chạy máy chủ Universal Bridge & phục vụ giao diện Web từ thư mục frontend/.
"""

import sys
import os

project_root = os.path.dirname(os.path.abspath(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.server import run

if __name__ == '__main__':
    run()
