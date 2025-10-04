# 🚀 Guide de Démarrage et Arrêt - ElizaOS Agents

> **Guide complet** pour démarrer, arrêter et gérer les agents ElizaOS en développement et production

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🔧 Méthodes de Démarrage](#-méthodes-de-démarrage)
- [⏹️ Méthodes d'Arrêt](#️-méthodes-darrêt)
- [🔄 Gestion Multi-Agents](#-gestion-multi-agents)
- [🐛 Dépannage](#-dépannage)
- [📊 Monitoring](#-monitoring)

## 🎯 Vue d'ensemble

### **Problème Résolu : Ctrl+C ne fonctionnait pas**

**Cause** : Configuration PM2 avec `autorestart: true` qui interceptait les signaux SIGINT

**Solution** : Configuration PM2 optimisée avec gestion propre des signaux

### **Méthodes Disponibles**

| Méthode | Usage | Avantages | Inconvénients |
|---------|-------|-----------|---------------|
| **Direct (Bun)** | Développement | Simple, Ctrl+C fonctionne | Pas de supervision |
| **PM2** | Production | Supervision, redémarrage | Configuration requise |
| **Docker** | Isolation | Environnement propre | Plus complexe |

## 🔧 Méthodes de Démarrage

### **1. Démarrage Direct (Développement)**

#### **Script PowerShell Recommandé**
```powershell
# start-dev.ps1
Set-Location "C:\Cursor_Projects\eliza\test-agent"

Write-Host "🔨 Building project..." -ForegroundColor Cyan
bun run build

Write-Host "🚀 Starting agent directly..." -ForegroundColor Green
$env:ELIZA_DISABLE_UPDATE_CHECK = "true"
$env:IGNORE_BOOTSTRAP = "true"
bunx elizaos start
```

#### **Commandes Directes**
```bash
# Build + Start
bun run build && bunx elizaos start

# Mode développement avec hot reload
bunx elizaos dev

# Avec variables d'environnement
$env:LOG_LEVEL="debug"; bunx elizaos start
```

### **2. Démarrage avec PM2 (Production)**

#### **Configuration Optimisée**
```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'eliza-test-agent',
    script: 'bun',
    args: 'run start',
    cwd: process.cwd(),
    env: {
      NODE_ENV: 'development',
      PORT: 3000,
      ELIZA_SERVER_AUTH_TOKEN: '',
      ELIZA_SERVER_PORT: 3000,
      ELIZA_SERVER_HOST: 'localhost',
      ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3000',
      ELIZA_SERVER_WEBSOCKET_ENABLED: 'true',
      ELIZA_SERVER_WEBSOCKET_PATH: '/socket.io/',
      IGNORE_BOOTSTRAP: 'true',
      ELIZA_DISABLE_UPDATE_CHECK: 'true'
    },
    instances: 1,
    autorestart: false,  // ← SOLUTION : Désactivé pour Ctrl+C
    watch: false,
    max_memory_restart: '1G',
    kill_timeout: 5000,  // ← AJOUT : Timeout d'arrêt
    wait_ready: true,    // ← AJOUT : Attendre que l'app soit prête
    listen_timeout: 10000, // ← AJOUT : Timeout d'écoute
    shutdown_with_message: true, // ← AJOUT : Arrêt propre
    force: false         // ← AJOUT : Éviter l'arrêt forcé
  }]
}
```

#### **Scripts de Démarrage PM2**
```powershell
# start-with-pm2.ps1
Set-Location "C:\Cursor_Projects\eliza\test-agent"

Write-Host "🧹 Nettoyage des processus existants..." -ForegroundColor Yellow
pm2 delete eliza-test-agent 2>$null

Write-Host "🔨 Building project..." -ForegroundColor Cyan
bun run build

Write-Host "🚀 Starting agent with PM2..." -ForegroundColor Green
pm2 start ecosystem.config.js

Write-Host "📊 Statut des processus PM2:" -ForegroundColor Cyan
pm2 list
```

### **3. Démarrage avec Docker**

#### **Docker Compose**
```yaml
# docker-compose.yaml
version: '3.8'
services:
  elizaos:
    build: .
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./data:/app/data
    restart: unless-stopped
```

#### **Commandes Docker**
```bash
# Build et démarrage
docker-compose up --build

# En arrière-plan
docker-compose up -d

# Logs
docker-compose logs -f
```

## ⏹️ Méthodes d'Arrêt

### **1. Arrêt Direct (Ctrl+C)**

#### **✅ Maintenant Fonctionnel**
```bash
# Dans le terminal où l'agent tourne
Ctrl+C  # ← Fonctionne maintenant !
```

**Pourquoi ça marche maintenant** :
- Configuration PM2 avec `autorestart: false`
- Gestion propre des signaux SIGINT
- Timeout d'arrêt de 5 secondes

### **2. Arrêt avec PM2**

#### **Commandes PM2**
```bash
# Arrêt propre
pm2 stop eliza-test-agent

# Arrêt et suppression
pm2 delete eliza-test-agent

# Arrêt de tous les processus
pm2 kill

# Redémarrage
pm2 restart eliza-test-agent
```

#### **Script d'Arrêt**
```powershell
# stop-agent.ps1
Write-Host "⏹️ Arrêt de l'agent ElizaOS..." -ForegroundColor Yellow

# Arrêt PM2
pm2 stop eliza-test-agent
pm2 delete eliza-test-agent

# Arrêt forcé si nécessaire
taskkill /F /IM bun.exe 2>$null
taskkill /F /IM node.exe 2>$null

Write-Host "✅ Agent arrêté" -ForegroundColor Green
```

### **3. Arrêt avec Docker**

```bash
# Arrêt propre
docker-compose down

# Arrêt forcé
docker-compose kill

# Suppression des volumes
docker-compose down -v
```

### **4. Arrêt d'Urgence**

#### **Si Ctrl+C ne fonctionne toujours pas**
```powershell
# Arrêt forcé de tous les processus
taskkill /F /IM bun.exe
taskkill /F /IM node.exe

# Vérifier les processus sur le port 3000
netstat -ano | findstr :3000

# Arrêter un processus spécifique par PID
taskkill /F /PID <PID_NUMBER>
```

## 🔄 Gestion Multi-Agents

### **Architecture Multi-Agents**

```
eliza/
├── test-agent/          # Agent de développement
├── finance-agent/       # Agent financier
├── support-agent/       # Agent support
└── docs/               # Documentation
```

### **Démarrage Isolé par Agent**

#### **Script de Sélection d'Agent**
```powershell
# start-agent.ps1
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("test", "finance", "support")]
    [string]$Agent
)

$agentPath = "C:\Cursor_Projects\eliza\$Agent-agent"

if (Test-Path $agentPath) {
    Set-Location $agentPath
    
    Write-Host "🚀 Démarrage de l'agent $Agent" -ForegroundColor Green
    
    # Build
    bun run build
    
    # Start avec PM2
    pm2 start ecosystem.config.js --name "eliza-$Agent-agent"
    
    Write-Host "✅ Agent $Agent démarré" -ForegroundColor Green
    pm2 list
} else {
    Write-Host "❌ Agent $Agent non trouvé" -ForegroundColor Red
}
```

#### **Usage**
```powershell
# Démarrer l'agent test
.\start-agent.ps1 -Agent test

# Démarrer l'agent finance
.\start-agent.ps1 -Agent finance

# Démarrer l'agent support
.\start-agent.ps1 -Agent support
```

### **Configuration PM2 Multi-Agents**

#### **ecosystem-multi.config.js**
```javascript
module.exports = {
  apps: [
    {
      name: 'eliza-test-agent',
      script: 'bun',
      args: 'run start',
      cwd: './test-agent',
      env: { NODE_ENV: 'development', PORT: 3000 },
      autorestart: false,
      kill_timeout: 5000
    },
    {
      name: 'eliza-finance-agent',
      script: 'bun',
      args: 'run start',
      cwd: './finance-agent',
      env: { NODE_ENV: 'development', PORT: 3001 },
      autorestart: false,
      kill_timeout: 5000
    },
    {
      name: 'eliza-support-agent',
      script: 'bun',
      args: 'run start',
      cwd: './support-agent',
      env: { NODE_ENV: 'development', PORT: 3002 },
      autorestart: false,
      kill_timeout: 5000
    }
  ]
}
```

### **Commandes Multi-Agents**

```bash
# Démarrer tous les agents
pm2 start ecosystem-multi.config.js

# Démarrer un agent spécifique
pm2 start ecosystem-multi.config.js --only eliza-test-agent

# Arrêter un agent spécifique
pm2 stop eliza-test-agent

# Voir tous les agents
pm2 list

# Logs d'un agent spécifique
pm2 logs eliza-test-agent

# Logs de tous les agents
pm2 logs
```

## 🐛 Dépannage

### **Problèmes Courants**

#### **1. Port déjà utilisé**
```bash
# Vérifier le port
netstat -ano | findstr :3000

# Arrêter le processus
taskkill /F /PID <PID>

# Ou changer le port dans .env
PORT=3001
```

#### **2. Agent ne répond pas**
```bash
# Vérifier les logs
pm2 logs eliza-test-agent

# Redémarrer
pm2 restart eliza-test-agent

# Nettoyage complet
pm2 delete eliza-test-agent
bun run build
pm2 start ecosystem.config.js
```

#### **3. Ctrl+C ne fonctionne toujours pas**
```bash
# Vérifier la configuration PM2
pm2 show eliza-test-agent

# Forcer l'arrêt
pm2 kill
taskkill /F /IM bun.exe
```

### **Scripts de Diagnostic**

#### **diagnostic.ps1**
```powershell
Write-Host "🔍 Diagnostic ElizaOS" -ForegroundColor Cyan

# Vérifier les processus
Write-Host "`n📊 Processus en cours:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*bun*" -or $_.ProcessName -like "*node*"}

# Vérifier les ports
Write-Host "`n🌐 Ports utilisés:" -ForegroundColor Yellow
netstat -ano | findstr ":300"

# Vérifier PM2
Write-Host "`n🔄 Statut PM2:" -ForegroundColor Yellow
pm2 list

# Vérifier les logs
Write-Host "`n📝 Derniers logs:" -ForegroundColor Yellow
pm2 logs --lines 10
```

## 📊 Monitoring

### **Surveillance en Temps Réel**

```bash
# Logs en temps réel
pm2 logs eliza-test-agent

# Monitoring complet
pm2 monit

# Statut détaillé
pm2 show eliza-test-agent
```

### **Métriques Importantes**

- **CPU Usage** : `pm2 show <app>` → CPU
- **Memory Usage** : `pm2 show <app>` → Memory
- **Uptime** : `pm2 show <app>` → Uptime
- **Restarts** : `pm2 show <app>` → Restarts

### **Alertes et Notifications**

```javascript
// ecosystem.config.js - Configuration avancée
module.exports = {
  apps: [{
    // ... configuration de base
    max_memory_restart: '1G',
    min_uptime: '10s',
    max_restarts: 10,
    // Notifications (optionnel)
    notify: true
  }]
}
```

## 🎯 Résumé des Bonnes Pratiques

### **Développement**
1. ✅ Utiliser le démarrage direct avec `bunx elizaos start`
2. ✅ Ctrl+C fonctionne maintenant pour l'arrêt
3. ✅ Utiliser des ports différents pour chaque agent
4. ✅ Tester régulièrement avec `pm2 logs`

### **Production**
1. ✅ Utiliser PM2 avec `autorestart: false`
2. ✅ Configurer les timeouts appropriés
3. ✅ Surveiller les métriques
4. ✅ Prévoir des scripts de sauvegarde

### **Multi-Agents**
1. ✅ Isoler chaque agent dans son dossier
2. ✅ Utiliser des ports différents (3000, 3001, 3002...)
3. ✅ Configurer PM2 pour chaque agent
4. ✅ Documenter les spécificités de chaque agent

---

**🎉 Votre problème de Ctrl+C est résolu !** Utilisez ce guide pour gérer efficacement vos agents ElizaOS.
