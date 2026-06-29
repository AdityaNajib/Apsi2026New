@echo off
title SICAL-TI UNS - Server

echo ========================================
echo   SICAL-TI UNS - Starting Server...
echo ========================================
echo.

:: Add firewall rule (requires admin - will prompt UAC)
echo [1/2] Opening firewall port 3000...
powershell -Command "Start-Process powershell -ArgumentList 'netsh advfirewall firewall delete rule name=""SICAL-TI 3000""; netsh advfirewall firewall add rule name=""SICAL-TI 3000"" dir=in action=allow protocol=TCP localport=3000' -Verb RunAs -WindowStyle Hidden" 2>nul
timeout /t 2 /nobreak >nul

:: Get current IP
echo [2/2] Getting network IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set IP=%%a
    goto :found
)
:found
set IP=%IP: =%

echo.
echo ========================================
echo   Server URL:
echo   Local:   http://localhost:3000
echo   Network: http://%IP%:3000
echo ========================================
echo.
echo Share the Network URL to other devices on the same WiFi
echo Press Ctrl+C to stop the server
echo.

:: Start the dev server
cd /d "%~dp0"
npm run dev
pause
