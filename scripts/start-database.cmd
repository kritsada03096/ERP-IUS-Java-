@echo off
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-database.ps1"
exit /b %errorlevel%
