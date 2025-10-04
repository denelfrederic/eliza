# Script de démarrage amélioré avec PM2 (Solution 1 implémentée)
Set-Location "C:\Cursor_Projects\eliza\test-agent"

Write-Host "🚀 Démarrage ElizaOS avec PM2 (Configuration corrigée)" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Nettoyage préalable
Write-Host "`n🧹 Nettoyage des processus existants..." -ForegroundColor Yellow
pm2 delete eliza-test-agent 2>$null

# Build du projet
Write-Host "`n🔨 Building project..." -ForegroundColor Cyan
bun run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

# Démarrage avec PM2
Write-Host "`n🚀 Starting agent with PM2..." -ForegroundColor Green
pm2 start ecosystem.config.js

# Affichage du statut
Write-Host "`n📊 Statut des processus PM2:" -ForegroundColor Cyan
pm2 list

Write-Host "`n📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   • Voir les logs: pm2 logs eliza-test-agent" -ForegroundColor White
Write-Host "   • Arrêter: pm2 stop eliza-test-agent" -ForegroundColor White
Write-Host "   • Redémarrer: pm2 restart eliza-test-agent" -ForegroundColor White
Write-Host "   • Supprimer: pm2 delete eliza-test-agent" -ForegroundColor White
Write-Host "   • Ctrl+C dans les logs pour arrêter l'affichage" -ForegroundColor White

Write-Host "`n🎯 Test de Ctrl+C:" -ForegroundColor Yellow
Write-Host "   Maintenant, lancez 'pm2 logs eliza-test-agent' et testez Ctrl+C" -ForegroundColor White
Write-Host "   Le serveur devrait s'arrêter proprement !" -ForegroundColor Green
