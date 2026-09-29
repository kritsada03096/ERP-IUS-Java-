@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-database.ps1"
exit /b %errorlevel%
