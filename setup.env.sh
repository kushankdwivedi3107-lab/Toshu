#!/usr/bin/env bash
# Unix / WSL
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
if [ -f requirements.txt ]; then
  pip install -r requirements.txt
else
  pip install PyQt6 pywebview
fi
echo "Virtualenv created. Activate with: source .venv/bin/activate"