# Script de réparation et démarrage pour l'agent Eliza
Set-Location "C:\Cursor_Projects\eliza\test-agent"

Write-Host "🧹 Cleaning node_modules and cache..." -ForegroundColor Yellow
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Force bun.lock -ErrorAction SilentlyContinue

Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
bun install

Write-Host "🔨 Building project..." -ForegroundColor Cyan
bun run build

Write-Host "🚀 Starting agent..." -ForegroundColor Green
$env:ELIZA_DISABLE_UPDATE_CHECK = 'true'
$env:IGNORE_BOOTSTRAP = 'true'
bunx elizaos start

