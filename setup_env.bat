@echo off
REM Run this from project root (double-click or from terminal)
python -m venv .venv
call .\.venv\Scripts\activate.bat
python -m pip install --upgrade pip
if exist requirements.txt (
  pip install -r requirements.txt
) else (
  echo "requirements.txt not found - installing minimal PyQt6 and pywebview"
  pip install PyQt6 pywebview
)
echo Virtualenv and dependencies installed. Use the VS Code interpreter: .\.venv\Scripts\python.exe
pause