# Script de démarrage pour l'agent Eliza
Set-Location "C:\Cursor_Projects\eliza\test-agent"

Write-Host "🔨 Building project..." -ForegroundColor Cyan
bun run build

Write-Host "🚀 Starting agent..." -ForegroundColor Green
$env:ELIZA_DISABLE_UPDATE_CHECK = "true"
$env:IGNORE_BOOTSTRAP = "true"
bunx elizaos start

