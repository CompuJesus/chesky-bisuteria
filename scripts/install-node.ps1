# Script para descargar y configurar Node.js portátil en Windows
$ErrorActionPreference = "Stop"

$destinationDir = "$env:USERPROFILE\tools"
$nodeZip = "$destinationDir\node.zip"
$nodeFinalDir = "$destinationDir\node-v20"

if (-not (Test-Path $destinationDir)) {
    New-Item -ItemType Directory -Path $destinationDir -Force | Out-Null
}

if (-not (Test-Path "$nodeFinalDir\node.exe")) {
    Write-Host ">>> Descargando Node.js v20.18.0 portátil para Windows..." -ForegroundColor Cyan
    $url = "https://nodejs.org/dist/v20.18.0/node-v20.18.0-win-x64.zip"
    & "C:\Windows\System32\curl.exe" -L -o $nodeZip $url

    Write-Host ">>> Extrayendo Node.js..." -ForegroundColor Cyan
    Expand-Archive -Path $nodeZip -DestinationPath $destinationDir -Force

    if (Test-Path "$destinationDir\node-v20.18.0-win-x64") {
        Rename-Item -Path "$destinationDir\node-v20.18.0-win-x64" -NewName "node-v20" -Force
    }

    if (Test-Path $nodeZip) {
        Remove-Item -Path $nodeZip -Force
    }
}

Write-Host ">>> Configurando PATH para Node.js..." -ForegroundColor Green
$currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
if ($currentPath -notlike "*$nodeFinalDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$nodeFinalDir;$currentPath", "User")
    Write-Host ">>> Añadido a PATH de usuario permanentemente." -ForegroundColor Green
}

$env:Path = "$nodeFinalDir;$env:Path"

Write-Host ">>> Versión de Node:" -ForegroundColor Yellow
& "$nodeFinalDir\node.exe" -v
Write-Host ">>> Versión de npm:" -ForegroundColor Yellow
& "$nodeFinalDir\npm.cmd" -v
Write-Host ">>> Node.js configurado con éxito!" -ForegroundColor Green
