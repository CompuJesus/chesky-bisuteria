@echo off
title CHESKY - Subir a GitHub
color 0B
chcp 65001 >nul

echo.
echo ========================================================
echo        CHESKY - SUBIR CODIGO A GITHUB
echo ========================================================
echo.

set "GIT_EXE=C:\Program Files\Git\cmd\git.exe"
if not exist "%GIT_EXE%" (
    echo [ERROR] No se encontro Git instalado en tu equipo.
    pause
    exit /b 1
)

cd /d "%~dp0"

echo [1/3] Preparando cambios locales...
"%GIT_EXE%" add .
"%GIT_EXE%" commit -m "update: Sistema CHESKY optimizado con Supabase" >nul 2>&1

echo.
echo Por favor ingresa el enlace de tu repositorio de GitHub.
echo Ejemplo: https://github.com/tu-usuario/chesky-bisuteria.git
echo.
set /p REPO_URL="Pega tu enlace de GitHub aqui: "

if "%REPO_URL%"=="" (
    echo [ERROR] No ingresaste ningun enlace.
    pause
    exit /b 1
)

echo.
echo [2/3] Configurando origen remoto...
"%GIT_EXE%" remote remove origin >nul 2>&1
"%GIT_EXE%" remote add origin %REPO_URL%
"%GIT_EXE%" branch -M main

echo.
echo [3/3] Subiendo codigo a GitHub...
echo (Se abrira una ventanita del navegador para iniciar sesion en GitHub si es la primera vez)
echo.
"%GIT_EXE%" push -u origin main

if %ERRORLEVEL% equ 0 (
    echo.
    echo ========================================================
    echo      [EXITO] Codigo subido correctamente a GitHub!
    echo ========================================================
) else (
    echo.
    echo [AVISO] Hubo un problema al subir. Revisa tus credenciales o permisos de GitHub.
)

echo.
pause
