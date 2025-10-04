# Script de gestion multi-agents ElizaOS
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "status", "build", "test", "clean")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("test", "finance", "support", "all")]
    [string]$Agent = "all"
)

$agents = @{
    "test" = @{ 
        path = "test-agent"; 
        port = 3000; 
        name = "eliza-test-agent";
        description = "Agent de développement et test"
    }
    "finance" = @{ 
        path = "finance-agent"; 
        port = 3001; 
        name = "eliza-finance-agent";
        description = "Agent financier spécialisé"
    }
    "support" = @{ 
        path = "support-agent"; 
        port = 3002; 
        name = "eliza-support-agent";
        description = "Agent support client"
    }
}

function Execute-Action {
    param($agentName, $agentConfig)
    
    $agentPath = "C:\Cursor_Projects\eliza\$($agentConfig.path)"
    
    if (Test-Path $agentPath) {
        Set-Location $agentPath
        
        Write-Host "🔧 Agent: $agentName ($($agentConfig.description))" -ForegroundColor Cyan
        Write-Host "📁 Path: $agentPath" -ForegroundColor Gray
        Write-Host "🌐 Port: $($agentConfig.port)" -ForegroundColor Gray
        
        switch ($Action) {
            "start" {
                Write-Host "🚀 Démarrage de l'agent $agentName..." -ForegroundColor Green
                bun run build
                pm2 start ecosystem.config.js --name $agentConfig.name
            }
            "stop" {
                Write-Host "⏹️ Arrêt de l'agent $agentName..." -ForegroundColor Yellow
                pm2 stop $agentConfig.name
            }
            "restart" {
                Write-Host "🔄 Redémarrage de l'agent $agentName..." -ForegroundColor Cyan
                pm2 restart $agentConfig.name
            }
            "logs" {
                Write-Host "📝 Logs de l'agent $agentName..." -ForegroundColor Blue
                pm2 logs $agentConfig.name
            }
            "status" {
                Write-Host "📊 Statut de l'agent $agentName..." -ForegroundColor Magenta
                pm2 show $agentConfig.name
            }
            "build" {
                Write-Host "🔨 Build de l'agent $agentName..." -ForegroundColor Yellow
                bun run build
            }
            "test" {
                Write-Host "🧪 Tests de l'agent $agentName..." -ForegroundColor Green
                bun run test
            }
            "clean" {
                Write-Host "🧹 Nettoyage de l'agent $agentName..." -ForegroundColor Red
                pm2 delete $agentConfig.name 2>$null
                Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
                Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
                Remove-Item -Force bun.lock -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "❌ Agent $agentName non trouvé dans $agentPath" -ForegroundColor Red
    }
}

# Exécution
if ($Agent -eq "all") {
    Write-Host "🔄 Exécution sur tous les agents..." -ForegroundColor Cyan
    foreach ($agentName in $agents.Keys) {
        Execute-Action $agentName $agents[$agentName]
        Write-Host "---" -ForegroundColor Gray
    }
} else {
    Execute-Action $Agent $agents[$Agent]
}

# Affichage du statut global
Write-Host "`n📊 Statut global PM2:" -ForegroundColor Cyan
pm2 list
