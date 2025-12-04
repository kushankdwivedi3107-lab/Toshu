@echo off
title Toshu

REM Change directory to the script's location
cd /d "%~dp0"

echo Activating virtual environment...
call .\.venv\Scripts\activate.bat

echo Starting Toshu application...
python main.py

echo.
echo Toshu has closed.
pause