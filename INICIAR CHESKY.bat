@echo off
title CHESKY - Sistema de Bisuteria
color 0A
chcp 65001 >nul

echo.
echo  ==============================================
echo   CHESKY - Sistema de Inventario y Catalogo
echo   Bisuteria fina - Panel de administracion
echo  ==============================================
echo.

:: Usar USERPROFILE para evitar problemas con acentos en el nombre de usuario
set "NODE_DIR=%USERPROFILE%\tools\node-v20"
set "CHESKY_DIR=%USERPROFILE%\OneDrive\Documents\CHESKY"

:: Verificar que node existe
if not exist "%NODE_DIR%\node.exe" (
    echo [ERROR] No se encontro Node.js en: %NODE_DIR%
    echo Por favor contacta al soporte tecnico.
    pause
    exit /b 1
)

echo [1/2] Iniciando servidor Backend API en puerto 5000...
start "CHESKY-Backend" cmd /k "set PATH=%NODE_DIR%;%PATH% && cd /d "%CHESKY_DIR%\backend" && echo. && echo  == CHESKY Backend API == && echo  http://localhost:5000/api && echo  NO CIERRES ESTA VENTANA && echo. && node src/server.js"

timeout /t 4 /nobreak >nul

echo [2/2] Iniciando servidor Frontend en puerto 5173...
start "CHESKY-Frontend" cmd /k "set PATH=%NODE_DIR%;%PATH% && cd /d "%CHESKY_DIR%\frontend" && echo. && echo  == CHESKY Frontend Web == && echo  http://localhost:5173 && echo  NO CIERRES ESTA VENTANA && echo. && npx vite --host"

timeout /t 6 /nobreak >nul

echo.
echo  ==============================================
echo   CHESKY esta corriendo - Abriendo navegador
echo  ==============================================
echo.
echo   Web:    http://localhost:5173
echo   API:    http://localhost:5000/api
echo.
echo   Admin:  admin@chesky.com
echo   Pass:   admin1234
echo.

start "" "http://localhost:5173"

echo  Presiona cualquier tecla para cerrar este mensaje.
echo  (Las dos ventanas negras deben seguir abiertas)
pause >nul
