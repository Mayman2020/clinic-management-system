@echo off
setlocal
set SCRIPT_DIR=%~dp0
powershell -NoProfile -ExecutionPolicy Bypass -File "%SCRIPT_DIR%clinic-frontend\run-frontend.ps1" %*
echo.
pause
exit /b %ERRORLEVEL%
