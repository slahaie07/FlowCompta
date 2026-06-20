# ComptaFlow — Windows setup helper
# Usage: npm run setup:windows
# Or:    powershell -ExecutionPolicy Bypass -File scripts/setup-windows.ps1

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host ""
Write-Host "ComptaFlow — Windows setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

# Node check
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
  exit 1
}
Write-Host ("Node: " + (node -v)) -ForegroundColor Green

# .env.local from example
$envExample = Join-Path $root ".env.example"
$envLocal = Join-Path $root ".env.local"
if (-not (Test-Path $envLocal) -and (Test-Path $envExample)) {
  Copy-Item $envExample $envLocal
  Write-Host "Created .env.local from .env.example — fill in Supabase keys." -ForegroundColor Yellow
} elseif (Test-Path $envLocal) {
  Write-Host ".env.local already exists." -ForegroundColor Green
} else {
  Write-Host "Warning: .env.example missing." -ForegroundColor Yellow
}

# Install deps if needed
if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "Running npm install..." -ForegroundColor Yellow
  npm install
}

Write-Host ""
Write-Host "Next steps (no service role key required locally):" -ForegroundColor Cyan
Write-Host "  1. Supabase Dashboard -> SQL Editor -> paste scripts/combined-migrations.sql"
Write-Host "  2. Auth -> Users -> create 3 admin accounts (see docs/SETUP_WITHOUT_CLI.md)"
Write-Host "  3. SQL Editor -> paste scripts/seed-admins-manual.sql"
Write-Host "  4. npm run setup:print-sql   (full copy-paste bundle)"
Write-Host ""
Write-Host "Dev server: npm run dev" -ForegroundColor Green
Write-Host "Promotion check: npm run promotion:check" -ForegroundColor Green
Write-Host "Seed dry-run: npm run seed:admins:dry-run" -ForegroundColor Green
Write-Host "Seed live: npm run seed:admins -- --password=YOUR_PASSWORD" -ForegroundColor Green
Write-Host "Docs: docs/DEV_COMMANDS.md" -ForegroundColor Green
Write-Host ""
