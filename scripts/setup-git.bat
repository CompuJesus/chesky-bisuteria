@echo off
chcp 65001 >nul
echo Iniciando repositorio Git de CHESKY...

set "NODE_DIR=%USERPROFILE%\tools\node-v20"
set "CHESKY_DIR=%USERPROFILE%\OneDrive\Documents\CHESKY"
set PATH=%NODE_DIR%;%PATH%

cd /d "%CHESKY_DIR%"

:: Inicializar git si no existe
if not exist ".git" (
    git init
    git branch -M main
    echo Repositorio git inicializado.
) else (
    echo Repositorio git ya existe.
)

:: Crear .gitignore raiz
echo node_modules/ >> .gitignore
echo *.db >> .gitignore
echo *.db-journal >> .gitignore
echo .env >> .gitignore
echo uploads/ >> .gitignore

git add .
git commit -m "feat: Sistema de inventario y catalogo CHESKY v1.0"

echo.
echo [OK] Codigo preparado y commiteado localmente.
echo Ahora solo falta conectar con GitHub.
pause
