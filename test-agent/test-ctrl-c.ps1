# Script de test pour vérifier que Ctrl+C fonctionne avec la nouvelle configuration PM2
Set-Location "C:\Cursor_Projects\eliza\test-agent"

Write-Host "🧪 Test de la configuration PM2 corrigée" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Arrêter tous les processus existants
Write-Host "`n1️⃣ Nettoyage des processus existants..." -ForegroundColor Yellow
pm2 delete eliza-test-agent 2>$null
pm2 kill 2>$null

# 2. Vérifier que le port 3000 est libre
Write-Host "`n2️⃣ Vérification du port 3000..." -ForegroundColor Yellow
$portCheck = netstat -ano | findstr :3000
if ($portCheck) {
    Write-Host "⚠️  Port 3000 occupé. Arrêt des processus..." -ForegroundColor Red
    $processes = netstat -ano | findstr :3000 | ForEach-Object { ($_ -split '\s+')[-1] } | Sort-Object -Unique
    foreach ($pid in $processes) {
        if ($pid -and $pid -ne "0") {
            taskkill /F /PID $pid 2>$null
        }
    }
    Start-Sleep -Seconds 2
}

# 3. Build du projet
Write-Host "`n3️⃣ Build du projet..." -ForegroundColor Yellow
bun run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

# 4. Démarrer avec PM2
Write-Host "`n4️⃣ Démarrage avec PM2 (nouvelle configuration)..." -ForegroundColor Green
pm2 start ecosystem.config.js

# 5. Vérifier le statut
Write-Host "`n5️⃣ Statut PM2:" -ForegroundColor Cyan
pm2 list

# 6. Afficher les logs
Write-Host "`n6️⃣ Logs en temps réel (Ctrl+C pour arrêter):" -ForegroundColor Cyan
Write-Host "💡 Maintenant, appuyez sur Ctrl+C pour tester l'arrêt propre..." -ForegroundColor Yellow
Write-Host "   Si cela fonctionne, vous devriez voir l'arrêt du serveur." -ForegroundColor Yellow
Write-Host ""

pm2 logs eliza-test-agent --lines 20
