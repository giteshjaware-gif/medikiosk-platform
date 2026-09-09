@echo off
title MediKiosk Platform Launcher
echo ===================================================
echo Starting MediKiosk AI Clinical History Platform...
echo ===================================================
cd /d "C:\Users\gites\.gemini\antigravity\scratch\medikiosk-platform"

:: Open browser in 2 seconds
start "" "http://localhost:8080"

:: Start Python HTTP Server
echo Server running at http://localhost:8080
echo Press Ctrl+C or close this window to stop.
py -m http.server 8080
pause
