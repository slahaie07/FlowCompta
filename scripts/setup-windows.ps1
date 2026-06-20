# ComptaFlow — Windows setup helper (instructions only, no auto-launch)
# Usage: npm run setup:windows

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

Write-Host ""
Write-Host "ComptaFlow — Windows setup" -ForegroundColor Cyan
Write-Host "==========================" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js not found. Install from https://nodejs.org/" -ForegroundColor Red
  exit 1
}
Write-Host ("Node: " + (node -v)) -ForegroundColor Green

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

if (-not (Test-Path (Join-Path $root "node_modules"))) {
  Write-Host "Run: npm install" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. npm install"
Write-Host "  2. Supabase Dashboard -> SQL Editor -> paste scripts/combined-migrations.sql"
Write-Host "  3. Auth -> Users -> create admin accounts (see docs/SETUP_WITHOUT_CLI.md)"
Write-Host "  4. SQL Editor -> paste scripts/seed-admins-manual.sql"
Write-Host "  5. npm run setup:print-sql   (full copy-paste bundle)"
Write-Host ""
Write-Host "Dev server:" -ForegroundColor Green
Write-Host "  npm run dev"
Write-Host "  Then open http://localhost:3000 in your browser manually."
Write-Host ""
Write-Host "Production site: https://compta-flow.net" -ForegroundColor Green
Write-Host "Promotion check: npm run promotion:check"
Write-Host "Seed dry-run: npm run seed:admins:dry-run"
Write-Host "Docs: docs/DEV_COMMANDS.md"
Write-Host ""
