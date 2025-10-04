# Script de diagnostic ElizaOS Multi-Agents
Write-Host "🔍 Diagnostic ElizaOS Multi-Agents" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# Vérifier les processus
Write-Host "`n📊 Processus en cours:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*bun*" -or $_.ProcessName -like "*node*"} | 
    Select-Object ProcessName, Id, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}} | 
    Format-Table -AutoSize

# Vérifier les ports
Write-Host "`n🌐 Ports utilisés (3000-3002):" -ForegroundColor Yellow
netstat -ano | findstr ":300" | ForEach-Object {
    $parts = $_ -split '\s+'
    $port = $parts[1] -replace '.*:', ''
    $pid = $parts[-1]
    if ($pid -and $pid -ne "0") {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "  Port $port : PID $pid ($($process.ProcessName))" -ForegroundColor White
        } else {
            Write-Host "  Port $port : PID $pid (Processus inconnu)" -ForegroundColor Gray
        }
    }
}

# Vérifier PM2
Write-Host "`n🔄 Statut PM2:" -ForegroundColor Yellow
pm2 list

# Vérifier les dossiers d'agents
Write-Host "`n📁 Structure des agents:" -ForegroundColor Yellow
$agents = @("test-agent", "finance-agent", "support-agent")
foreach ($agent in $agents) {
    if (Test-Path $agent) {
        $packageJson = Join-Path $agent "package.json"
        $ecosystem = Join-Path $agent "ecosystem.config.js"
        $src = Join-Path $agent "src"
        
        Write-Host "  ✅ $agent" -ForegroundColor Green
        Write-Host "    📄 package.json: $(if (Test-Path $packageJson) { '✅' } else { '❌' })" -ForegroundColor Gray
        Write-Host "    ⚙️  ecosystem.config.js: $(if (Test-Path $ecosystem) { '✅' } else { '❌' })" -ForegroundColor Gray
        Write-Host "    📂 src/: $(if (Test-Path $src) { '✅' } else { '❌' })" -ForegroundColor Gray
    } else {
        Write-Host "  ❌ $agent (dossier manquant)" -ForegroundColor Red
    }
}

# Vérifier les logs récents
Write-Host "`n📝 Logs récents PM2:" -ForegroundColor Yellow
pm2 logs --lines 5

# Vérifier l'espace disque
Write-Host "`n💾 Espace disque:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_LogicalDisk | Where-Object {$_.DriveType -eq 3} | 
    Select-Object DeviceID, @{Name="Size(GB)";Expression={[math]::Round($_.Size/1GB,2)}}, 
    @{Name="Free(GB)";Expression={[math]::Round($_.FreeSpace/1GB,2)}} | 
    Format-Table -AutoSize

# Vérifier les variables d'environnement
Write-Host "`n🔑 Variables d'environnement importantes:" -ForegroundColor Yellow
$envVars = @("OPENAI_API_KEY", "ANTHROPIC_API_KEY", "NODE_ENV", "PORT")
foreach ($var in $envVars) {
    $value = [Environment]::GetEnvironmentVariable($var)
    if ($value) {
        if ($var -like "*KEY*") {
            Write-Host "  $var : ✅ (définie)" -ForegroundColor Green
        } else {
            Write-Host "  $var : $value" -ForegroundColor White
        }
    } else {
        Write-Host "  $var : ❌ (non définie)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Recommandations:" -ForegroundColor Cyan
Write-Host "  • Utilisez '.\manage-agents.ps1 -Action status -Agent all' pour voir le statut détaillé" -ForegroundColor White
Write-Host "  • Utilisez '.\manage-agents.ps1 -Action logs -Agent <nom>' pour voir les logs d'un agent" -ForegroundColor White
Write-Host "  • Utilisez 'pm2 monit' pour le monitoring en temps réel" -ForegroundColor White
