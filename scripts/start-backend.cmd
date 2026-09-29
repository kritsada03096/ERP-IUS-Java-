@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-backend.ps1"
exit /b %errorlevel%
