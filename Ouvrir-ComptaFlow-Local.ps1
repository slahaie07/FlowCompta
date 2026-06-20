# Lance le serveur local puis ouvre le navigateur (PowerShell — pas Git Bash).
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js requis. Installez depuis https://nodejs.org/" -ForegroundColor Red
  exit 1
}

$port = if ($env:PORT) { $env:PORT } else { "3000" }
$url = "http://localhost:$port"

Write-Host "Démarrage du serveur dev sur $url ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
  '-NoExit', '-Command',
  "Set-Location '$root'; npm run dev"
) | Out-Null

Start-Sleep -Seconds 4
Start-Process $url
Write-Host "Navigateur ouvert sur $url" -ForegroundColor Green
