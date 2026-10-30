@echo off
title CHESKY - Deteniendo servidores...
color 0C
chcp 65001 >nul

echo.
echo  Cerrando servidores CHESKY...
echo.

taskkill /FI "WINDOWTITLE eq CHESKY-Backend*" /T /F >nul 2>&1
taskkill /FI "WINDOWTITLE eq CHESKY-Frontend*" /T /F >nul 2>&1
taskkill /IM "node.exe" /F >nul 2>&1

echo  [OK] Servidores detenidos correctamente.
echo.
timeout /t 2 /nobreak >nul
