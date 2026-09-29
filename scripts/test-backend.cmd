@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0test-backend.ps1"
exit /b %errorlevel%
