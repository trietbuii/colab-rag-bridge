#!/usr/bin/env bash
# ==============================================================================
# ColabAI Studio - Khởi chạy Giao Diện Nhanh
# ==============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "============================================================"
echo "⚡ Đang khởi động ColabAI Studio..."
echo "============================================================"

# Tự động mở trình duyệt sau 1 giây
(
  sleep 1.2
  if command -v xdg-open > /dev/null; then
    xdg-open "http://localhost:8080" > /dev/null 2>&1
  elif command -v sensible-browser > /dev/null; then
    sensible-browser "http://localhost:8080" > /dev/null 2>&1
  fi
) &

# Chạy Local Server
python3 server.py
