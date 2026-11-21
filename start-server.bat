@echo off
title ShopBridge Marketplace Server
echo ==========================================================
echo Starting ShopBridge Local Web Server...
echo URL: http://localhost:8080/
echo ==========================================================
powershell -ExecutionPolicy Bypass -NoProfile -File "%~dp0server.ps1"
pause
