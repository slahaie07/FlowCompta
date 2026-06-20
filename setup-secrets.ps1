# 🏛️ Cabinet Comptaflow — Configuration des secrets GitHub
# Renseignez les variables ci-dessous puis exécutez ce script en local (Windows PowerShell).

$SupabaseUrl = $env:VITE_SUPABASE_URL
$SupabaseAnonKey = $env:VITE_SUPABASE_ANON_KEY

if ([string]::IsNullOrWhiteSpace($SupabaseUrl) -or [string]::IsNullOrWhiteSpace($SupabaseAnonKey)) {
    Write-Host "❌ Définissez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans l'environnement ou .env.local" -ForegroundColor Red
    Exit 1
}

Write-Host "===============================================================" -ForegroundColor Gold
Write-Host "🏛️ COMPTAFLOW — CONFIGURATEUR DE SECRETS GITHUB" -ForegroundColor Gold
Write-Host "===============================================================" -ForegroundColor Gold
Write-Host ""

if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Le CLI GitHub 'gh' n'est pas installé." -ForegroundColor Red
    Exit 1
}

$ghAuth = gh auth status 2>&1
if ($ghAuth -match "You are not logged into any GitHub hosts") {
    Write-Host "🔑 Authentification requise sur GitHub..." -ForegroundColor Yellow
    gh auth login
}

Write-Host ""
Write-Host "Veuillez entrer vos identifiants Cloudflare (optionnel, legacy) :" -ForegroundColor Cyan
$CfToken = Read-Host "👉 CLOUDFLARE_API_TOKEN (Entrée pour ignorer)"
$CfAccount = Read-Host "👉 CLOUDFLARE_ACCOUNT_ID (Entrée pour ignorer)"

Write-Host ""
Write-Host "🚀 Envoi des secrets vers GitHub..." -ForegroundColor Gold

try {
    $SupabaseUrl | gh secret set VITE_SUPABASE_URL
    $SupabaseAnonKey | gh secret set VITE_SUPABASE_ANON_KEY

    if (-not [string]::IsNullOrWhiteSpace($CfToken)) {
        $CfToken | gh secret set CLOUDFLARE_API_TOKEN
    }
    if (-not [string]::IsNullOrWhiteSpace($CfAccount)) {
        $CfAccount | gh secret set CLOUDFLARE_ACCOUNT_ID
    }

    Write-Host ""
    Write-Host "🎉 Secrets GitHub mis à jour." -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur : $_" -ForegroundColor Red
}
