# 🏛️ Cabinet Comptaflow — Script de Configuration des Secrets GitHub
# Ce script configure automatiquement les variables et secrets de déploiement dans GitHub.

$SupabaseUrl = "https://hnxdlzdgiascuawgydir.supabase.co"
$SupabaseAnonKey = "sb_publishable_BHVkYelBLz9x0HJn_EWDyQ_EyJxaAWF"

Write-Host "===============================================================" -ForegroundColor Gold
Write-Host "🏛️ COMPTAFLOW SYSTEM — CONFIGURATEUR DE SECRETS GITHUB" -ForegroundColor Gold
Write-Host "===============================================================" -ForegroundColor Gold
Write-Host ""

# 1. Vérification de GitHub CLI (gh)
if (!(Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Le CLI GitHub 'gh' n'est pas installé sur cette machine." -ForegroundColor Red
    Write-Host "Veuillez l'installer via : winget install GitHub.cli" -ForegroundColor Yellow
    Exit
}

# 2. Vérification de la connexion GitHub
$ghAuth = gh auth status 2>&1
if ($ghAuth -match "You are not logged into any GitHub hosts") {
    Write-Host "🔑 Authentification requise sur GitHub..." -ForegroundColor Yellow
    gh auth login
} else {
    Write-Host "✅ Connecté à GitHub avec succès." -ForegroundColor Green
}

# 3. Demande des identifiants Cloudflare
Write-Host ""
Write-Host "Veuillez entrer vos identifiants Cloudflare (nécessaires pour le déploiement Pages) :" -ForegroundColor Cyan
$CfToken = Read-Host "👉 CLOUDFLARE_API_TOKEN"
$CfAccount = Read-Host "👉 CLOUDFLARE_ACCOUNT_ID"

if ([string]::IsNullOrWhiteSpace($CfToken) -or [string]::IsNullOrWhiteSpace($CfAccount)) {
    Write-Host "❌ Les identifiants Cloudflare ne peuvent pas être vides." -ForegroundColor Red
    Exit
}

# 4. Envoi des secrets vers GitHub
Write-Host ""
Write-Host "🚀 Envoi des secrets vers votre dépôt GitHub..." -ForegroundColor Gold

try {
    # Configuration des secrets Supabase (remplis automatiquement)
    Write-Host "-> Envoi de VITE_SUPABASE_URL..." -ForegroundColor Gray
    $SupabaseUrl | gh secret set VITE_SUPABASE_URL
    
    Write-Host "-> Envoi de VITE_SUPABASE_ANON_KEY..." -ForegroundColor Gray
    $SupabaseAnonKey | gh secret set VITE_SUPABASE_ANON_KEY

    # Configuration des secrets Cloudflare
    Write-Host "-> Envoi de CLOUDFLARE_API_TOKEN..." -ForegroundColor Gray
    $CfToken | gh secret set CLOUDFLARE_API_TOKEN

    Write-Host "-> Envoi de CLOUDFLARE_ACCOUNT_ID..." -ForegroundColor Gray
    $CfAccount | gh secret set CLOUDFLARE_ACCOUNT_ID

    Write-Host ""
    Write-Host "🎉 TOUS LES SECRETS ONT ÉTÉ APPLIQUÉS AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host "Votre pipeline GitHub Actions est maintenant 100% opérationnel." -ForegroundColor Green
}
catch {
    Write-Host "❌ Une erreur est survenue lors de l'enregistrement des secrets : $_" -ForegroundColor Red
}
