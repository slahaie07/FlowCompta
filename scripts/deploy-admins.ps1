# ComptaFlow — Script de déploiement des administrateurs
# Ce script appelle l'API sécurisée de production pour provisionner/mettre à jour les comptes.

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "Initialisation du déploiement des administrateurs sur compta-flow.net..." -ForegroundColor Cyan
Write-Host "=========================================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Demander le mot de passe s'il n'est pas fourni
$password = Read-Host "Entrez le mot de passe à attribuer à TOUS les administrateurs (Samuel, Eya, Sylvie, Stéphanie)"

if ([string]::IsNullOrWhiteSpace($password)) {
    Write-Host "Erreur : Le mot de passe ne peut pas être vide." -ForegroundColor Red
    exit 1
}

if ($password.Length -lt 8) {
    Write-Host "Erreur : Le mot de passe doit contenir au moins 8 caractères." -ForegroundColor Red
    exit 1
}

# 2. Configurer les requêtes API
$uri = "https://compta-flow.net/api/bootstrap-admins"
$headers = @{
    "X-ComptaFlow-Internal" = "e96ac8b28aa28bbad44dd3cd1ace4d64cccf017637cf9cd6d88bb8265c87fc1d"
    "Content-Type" = "application/json"
}
$body = @{
    "password" = $password
} | ConvertTo-Json -Compress

Write-Host "Envoi de la requête de provisionnement à compta-flow.net..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $uri -Method Post -Headers $headers -Body $body
    
    if ($response.success) {
        Write-Host ""
        Write-Host "✅ Déploiement réussi avec succès !" -ForegroundColor Green
        Write-Host "Comptes provisionnés :" -ForegroundColor Green
        foreach ($account in $response.accounts) {
            Write-Host "  - $($account.email) ($($account.role)) -> $($account.action)" -ForegroundColor Green
        }
        Write-Host ""
        Write-Host "URL de connexion : https://compta-flow.net/login" -ForegroundColor Cyan
    } else {
        Write-Host "Erreur lors du déploiement : $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Échec de l'appel API : $_" -ForegroundColor Red
    Write-Host "Assurez-vous que le nouveau déploiement Vercel est bien en ligne (READY)." -ForegroundColor Yellow
}
Write-Host ""
