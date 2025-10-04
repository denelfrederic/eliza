# 🏗️ Architecture Multi-Agents - ElizaOS

> **Guide complet** pour développer et déployer plusieurs agents ElizaOS de manière isolée

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🏗️ Architecture du Projet](#️-architecture-du-projet)
- [🔧 Développement Multi-Agents](#-développement-multi-agents)
- [🚀 Déploiement Isolé](#-déploiement-isolé)
- [📊 Monitoring et Gestion](#-monitoring-et-gestion)
- [🔄 Workflow de Développement](#-workflow-de-développement)

## 🎯 Vue d'ensemble

### **Principe de l'Architecture Multi-Agents**

Cette architecture permet de :
- ✅ **Développer plusieurs agents spécialisés** en parallèle
- ✅ **Déployer chaque agent indépendamment** 
- ✅ **Isoler les environnements** de chaque agent
- ✅ **Scaler horizontalement** selon les besoins
- ✅ **Maintenir la cohérence** du code partagé

### **Avantages de cette Approche**

| Avantage | Description | Bénéfice |
|----------|-------------|----------|
| **Isolation** | Chaque agent est indépendant | Évite les conflits entre agents |
| **Spécialisation** | Chaque agent a un rôle précis | Performance optimisée |
| **Scalabilité** | Déploiement sélectif | Ressources adaptées aux besoins |
| **Maintenance** | Mise à jour indépendante | Évite les régressions |
| **Développement** | Équipes parallèles | Productivité accrue |

## 🏗️ Architecture du Projet

### **Structure Globale**

```
eliza/                           # Projet principal
├── 📂 test-agent/               # Agent de développement/test
│   ├── 📂 src/                    # Code source TypeScript
│   ├── 📂 src/frontend/          # Interface React
│   ├── 📂 src/__tests__/         # Tests Cypress
│   ├── 📄 package.json           # Dépendances spécifiques
│   ├── 📄 ecosystem.config.js    # Configuration PM2
│   ├── 📄 Dockerfile             # Image Docker
│   └── 📄 .env.example           # Variables d'environnement
├── 📂 finance-agent/             # Agent financier spécialisé
│   ├── 📂 src/                    # Code source TypeScript
│   ├── 📂 src/frontend/          # Interface React
│   ├── 📂 src/__tests__/         # Tests Cypress
│   ├── 📄 package.json           # Dépendances spécifiques
│   ├── 📄 ecosystem.config.js    # Configuration PM2
│   ├── 📄 Dockerfile             # Image Docker
│   └── 📄 .env.example           # Variables d'environnement
├── 📂 support-agent/             # Agent support client
│   ├── 📂 src/                    # Code source TypeScript
│   ├── 📂 src/frontend/          # Interface React
│   ├── 📂 src/__tests__/         # Tests Cypress
│   ├── 📄 package.json           # Dépendances spécifiques
│   ├── 📄 ecosystem.config.js    # Configuration PM2
│   ├── 📄 Dockerfile             # Image Docker
│   └── 📄 .env.example           # Variables d'environnement
├── 📂 docs/                      # Documentation
│   ├── 📄 deploiement.md         # Guide de déploiement
│   ├── 📄 demarrage-arret.md     # Guide démarrage/arrêt
│   └── 📄 architecture-multi-agents.md # Ce guide
├── 📄 README.md                  # Documentation principale
└── 📄 .gitignore                # Configuration Git
```

### **Isolation par Agent**

Chaque agent est **complètement isolé** :

```
test-agent/                      # Agent de développement
├── 📂 src/
│   ├── 📄 character.ts          # Personnalité spécifique
│   ├── 📄 index.ts             # Point d'entrée
│   └── 📄 plugin.ts            # Plugins spécifiques
├── 📂 src/frontend/             # Interface dédiée
├── 📄 package.json             # Dépendances isolées
├── 📄 ecosystem.config.js      # Configuration PM2
├── 📄 Dockerfile               # Image Docker
└── 📄 .env                     # Variables d'environnement
```

## 🔧 Développement Multi-Agents

### **1. Configuration par Agent**

#### **Character.ts - Personnalité Spécifique**

```typescript
// test-agent/src/character.ts
export const character: Character = {
  name: 'TestAgent',
  bio: 'Agent de développement et test pour ElizaOS',
  system: 'Tu es un agent de test spécialisé dans le développement...',
  plugins: [
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-sql',
    '@elizaos/plugin-openai'
  ],
  settings: {
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    modelProvider: 'openai'
  }
};
```

```typescript
// finance-agent/src/character.ts
export const character: Character = {
  name: 'FinanceAgent',
  bio: 'Agent financier spécialisé dans les conseils d\'investissement',
  system: 'Tu es un expert financier avec une connaissance approfondie...',
  plugins: [
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-sql',
    '@elizaos/plugin-openai',
    '@elizaos/plugin-web-search'  // ← Plugin spécifique
  ],
  settings: {
    model: 'gpt-4',  // ← Modèle plus puissant
    embeddingModel: 'text-embedding-3-small',
    modelProvider: 'openai'
  }
};
```

#### **Package.json - Dépendances Spécifiques**

```json
// test-agent/package.json
{
  "name": "test-agent",
  "dependencies": {
    "@elizaos/core": "1.5.12",
    "@elizaos/plugin-bootstrap": "1.5.12",
    "@elizaos/plugin-sql": "1.5.12",
    "@elizaos/plugin-openai": "1.5.15"
  }
}
```

```json
// finance-agent/package.json
{
  "name": "finance-agent",
  "dependencies": {
    "@elizaos/core": "1.5.12",
    "@elizaos/plugin-bootstrap": "1.5.12",
    "@elizaos/plugin-sql": "1.5.12",
    "@elizaos/plugin-openai": "1.5.15",
    "@elizaos/plugin-web-search": "1.0.0"  // ← Dépendance spécifique
  }
}
```

### **2. Configuration PM2 Multi-Agents**

#### **ecosystem-multi.config.js**

```javascript
// ecosystem-multi.config.js (racine du projet)
module.exports = {
  apps: [
    {
      name: 'eliza-test-agent',
      script: 'bun',
      args: 'run start',
      cwd: './test-agent',
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ELIZA_SERVER_HOST: 'localhost',
        ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3000'
      },
      autorestart: false,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'eliza-finance-agent',
      script: 'bun',
      args: 'run start',
      cwd: './finance-agent',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,  // ← Port différent
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ELIZA_SERVER_HOST: 'localhost',
        ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3001'
      },
      autorestart: false,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    },
    {
      name: 'eliza-support-agent',
      script: 'bun',
      args: 'run start',
      cwd: './support-agent',
      env: {
        NODE_ENV: 'development',
        PORT: 3002,  // ← Port différent
        OPENAI_API_KEY: process.env.OPENAI_API_KEY,
        ELIZA_SERVER_HOST: 'localhost',
        ELIZA_SERVER_CORS_ORIGIN: 'http://localhost:3002'
      },
      autorestart: false,
      kill_timeout: 5000,
      wait_ready: true,
      listen_timeout: 10000
    }
  ]
}
```

### **3. Scripts de Gestion Multi-Agents**

#### **manage-agents.ps1 - Script Principal**

```powershell
# manage-agents.ps1
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "status", "build", "test")]
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
```

#### **Usage du Script**

```powershell
# Démarrer tous les agents
.\manage-agents.ps1 -Action start -Agent all

# Démarrer l'agent test
.\manage-agents.ps1 -Action start -Agent test

# Build de l'agent finance
.\manage-agents.ps1 -Action build -Agent finance

# Tests de l'agent support
.\manage-agents.ps1 -Action test -Agent support

# Logs de tous les agents
.\manage-agents.ps1 -Action logs -Agent all

# Statut de tous les agents
.\manage-agents.ps1 -Action status -Agent all
```

## 🚀 Déploiement Isolé

### **1. Déploiement PM2 Multi-Agents**

#### **Démarrage Sélectif**

```bash
# Démarrer tous les agents
pm2 start ecosystem-multi.config.js

# Démarrer un agent spécifique
pm2 start ecosystem-multi.config.js --only eliza-test-agent

# Démarrer plusieurs agents
pm2 start ecosystem-multi.config.js --only "eliza-test-agent,eliza-finance-agent"
```

#### **Gestion Individuelle**

```bash
# Arrêter un agent
pm2 stop eliza-test-agent

# Redémarrer un agent
pm2 restart eliza-finance-agent

# Supprimer un agent
pm2 delete eliza-support-agent

# Logs d'un agent
pm2 logs eliza-test-agent

# Monitoring
pm2 monit
```

### **2. Déploiement Docker Multi-Agents**

#### **Docker Compose Multi-Services**

```yaml
# docker-compose.multi.yml
version: '3.8'
services:
  test-agent:
    build: 
      context: ./test-agent
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./test-agent/data:/app/data
      - ./test-agent/logs:/app/logs
    restart: unless-stopped
    networks:
      - eliza-network

  finance-agent:
    build: 
      context: ./finance-agent
      dockerfile: Dockerfile
    ports:
      - "3001:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./finance-agent/data:/app/data
      - ./finance-agent/logs:/app/logs
    restart: unless-stopped
    networks:
      - eliza-network

  support-agent:
    build: 
      context: ./support-agent
      dockerfile: Dockerfile
    ports:
      - "3002:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - ./support-agent/data:/app/data
      - ./support-agent/logs:/app/logs
    restart: unless-stopped
    networks:
      - eliza-network

networks:
  eliza-network:
    driver: bridge
```

#### **Commandes Docker Multi-Agents**

```bash
# Démarrer tous les agents
docker-compose -f docker-compose.multi.yml up -d

# Démarrer un agent spécifique
docker-compose -f docker-compose.multi.yml up -d test-agent

# Arrêter un agent
docker-compose -f docker-compose.multi.yml stop finance-agent

# Redémarrer un agent
docker-compose -f docker-compose.multi.yml restart support-agent

# Logs d'un agent
docker-compose -f docker-compose.multi.yml logs -f test-agent

# Logs de tous les agents
docker-compose -f docker-compose.multi.yml logs -f
```

### **3. Déploiement par Environnement**

#### **Environnements Séparés**

```bash
# Développement
NODE_ENV=development pm2 start ecosystem-multi.config.js

# Staging
NODE_ENV=staging pm2 start ecosystem-multi.config.js

# Production
NODE_ENV=production pm2 start ecosystem-multi.config.js
```

#### **Configuration par Environnement**

```javascript
// ecosystem-multi.config.js
const config = {
  development: {
    instances: 1,
    autorestart: false,
    watch: true,
    max_memory_restart: '500M'
  },
  staging: {
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  },
  production: {
    instances: 2,
    autorestart: true,
    watch: false,
    max_memory_restart: '2G'
  }
};

module.exports = {
  apps: [
    {
      name: 'eliza-test-agent',
      script: 'bun',
      args: 'run start',
      cwd: './test-agent',
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: 3000
      },
      ...config[process.env.NODE_ENV || 'development']
    }
    // ... autres agents
  ]
};
```

## 📊 Monitoring et Gestion

### **1. Surveillance Multi-Agents**

#### **Script de Monitoring**

```powershell
# monitor-agents.ps1
Write-Host "📊 Monitoring ElizaOS Multi-Agents" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Statut PM2
Write-Host "`n🔄 Statut PM2:" -ForegroundColor Yellow
pm2 list

# Utilisation des ports
Write-Host "`n🌐 Ports utilisés:" -ForegroundColor Yellow
netstat -ano | findstr ":300"

# Utilisation mémoire
Write-Host "`n💾 Utilisation mémoire:" -ForegroundColor Yellow
Get-Process | Where-Object {$_.ProcessName -like "*bun*" -or $_.ProcessName -like "*node*"} | 
    Select-Object ProcessName, @{Name="Memory(MB)";Expression={[math]::Round($_.WorkingSet/1MB,2)}}

# Logs récents
Write-Host "`n📝 Logs récents:" -ForegroundColor Yellow
pm2 logs --lines 5
```

#### **Métriques par Agent**

```bash
# Métriques détaillées
pm2 show eliza-test-agent
pm2 show eliza-finance-agent
pm2 show eliza-support-agent

# Monitoring en temps réel
pm2 monit

# Logs centralisés
pm2 logs
```

### **2. Gestion des Données**

#### **Isolation des Données**

```
eliza/
├── test-agent/
│   ├── data/                    # Données spécifiques
│   ├── logs/                    # Logs spécifiques
│   └── .env                     # Configuration spécifique
├── finance-agent/
│   ├── data/                    # Données spécifiques
│   ├── logs/                    # Logs spécifiques
│   └── .env                     # Configuration spécifique
└── support-agent/
    ├── data/                    # Données spécifiques
    ├── logs/                    # Logs spécifiques
    └── .env                     # Configuration spécifique
```

#### **Sauvegarde Multi-Agents**

```powershell
# backup-agents.ps1
$date = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups/backup_$date"

Write-Host "💾 Sauvegarde des agents ElizaOS..." -ForegroundColor Cyan

# Créer le dossier de sauvegarde
New-Item -ItemType Directory -Path $backupDir -Force

# Sauvegarder chaque agent
$agents = @("test-agent", "finance-agent", "support-agent")

foreach ($agent in $agents) {
    Write-Host "📦 Sauvegarde de $agent..." -ForegroundColor Yellow
    
    # Données
    if (Test-Path "$agent/data") {
        Copy-Item "$agent/data" "$backupDir/$agent-data" -Recurse
    }
    
    # Logs
    if (Test-Path "$agent/logs") {
        Copy-Item "$agent/logs" "$backupDir/$agent-logs" -Recurse
    }
    
    # Configuration
    if (Test-Path "$agent/.env") {
        Copy-Item "$agent/.env" "$backupDir/$agent.env"
    }
}

Write-Host "✅ Sauvegarde terminée: $backupDir" -ForegroundColor Green
```

## 🔄 Workflow de Développement

### **1. Développement d'un Nouvel Agent**

#### **Étapes de Création**

```bash
# 1. Créer le dossier de l'agent
mkdir new-agent
cd new-agent

# 2. Initialiser le projet
bun init
bun add @elizaos/core @elizaos/plugin-bootstrap @elizaos/plugin-sql @elizaos/plugin-openai

# 3. Créer la structure
mkdir src src/frontend src/__tests__
touch src/character.ts src/index.ts src/plugin.ts
touch ecosystem.config.js Dockerfile .env.example

# 4. Configurer l'agent
# Éditer src/character.ts avec la personnalité
# Éditer ecosystem.config.js avec le port unique
# Éditer .env.example avec les variables
```

#### **Configuration de Base**

```typescript
// new-agent/src/character.ts
export const character: Character = {
  name: 'NewAgent',
  bio: 'Description de l\'agent',
  system: 'Instructions système spécifiques',
  plugins: [
    '@elizaos/plugin-bootstrap',
    '@elizaos/plugin-sql',
    '@elizaos/plugin-openai'
  ],
  settings: {
    model: 'gpt-4o-mini',
    embeddingModel: 'text-embedding-3-small',
    modelProvider: 'openai'
  }
};
```

### **2. Intégration dans l'Architecture Multi-Agents**

#### **Mise à Jour des Scripts**

```powershell
# Ajouter le nouvel agent dans manage-agents.ps1
$agents = @{
    "test" = @{ path = "test-agent"; port = 3000; name = "eliza-test-agent" }
    "finance" = @{ path = "finance-agent"; port = 3001; name = "eliza-finance-agent" }
    "support" = @{ path = "support-agent"; port = 3002; name = "eliza-support-agent" }
    "new" = @{ path = "new-agent"; port = 3003; name = "eliza-new-agent" }  # ← AJOUT
}
```

#### **Mise à Jour de la Configuration PM2**

```javascript
// Ajouter dans ecosystem-multi.config.js
{
  name: 'eliza-new-agent',
  script: 'bun',
  args: 'run start',
  cwd: './new-agent',
  env: {
    NODE_ENV: 'development',
    PORT: 3003,  // ← Port unique
    OPENAI_API_KEY: process.env.OPENAI_API_KEY
  },
  autorestart: false,
  kill_timeout: 5000
}
```

### **3. Tests Multi-Agents**

#### **Tests d'Intégration**

```powershell
# test-all-agents.ps1
Write-Host "🧪 Tests Multi-Agents ElizaOS" -ForegroundColor Cyan

$agents = @("test-agent", "finance-agent", "support-agent")

foreach ($agent in $agents) {
    Write-Host "`n🔬 Test de $agent..." -ForegroundColor Yellow
    
    Set-Location $agent
    
    # Build
    Write-Host "  🔨 Build..." -ForegroundColor Gray
    bun run build
    
    # Tests unitaires
    Write-Host "  🧪 Tests unitaires..." -ForegroundColor Gray
    bun run test
    
    # Tests E2E
    Write-Host "  🎭 Tests E2E..." -ForegroundColor Gray
    bun run cy:run
    
    Set-Location ..
}

Write-Host "`n✅ Tous les tests terminés" -ForegroundColor Green
```

## 🎯 Résumé des Bonnes Pratiques

### **Développement**
1. ✅ **Un agent = un dossier** isolé
2. ✅ **Port unique** par agent (3000, 3001, 3002...)
3. ✅ **Configuration PM2** avec `autorestart: false`
4. ✅ **Tests isolés** par agent
5. ✅ **Documentation** spécifique par agent

### **Déploiement**
1. ✅ **Déploiement sélectif** possible
2. ✅ **Environnements isolés** (dev, staging, prod)
3. ✅ **Monitoring centralisé** avec PM2
4. ✅ **Sauvegarde** par agent
5. ✅ **Scalabilité** horizontale

### **Maintenance**
1. ✅ **Mise à jour indépendante** des agents
2. ✅ **Logs centralisés** et séparés
3. ✅ **Monitoring** par agent
4. ✅ **Rollback** sélectif possible
5. ✅ **Documentation** à jour

---

**🎉 Architecture Multi-Agents ElizaOS prête !** Développez et déployez vos agents de manière isolée et efficace.
