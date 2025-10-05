# Guide de déploiement ELIZA OS

Ce guide explique comment déployer ELIZA OS en production sur un serveur Linux ou Windows.

## 🎯 Prérequis

- **Serveur** : Linux (Ubuntu 20.04+) ou Windows Server
- **Runtime** : Bun installé globalement
- **Git** : Pour cloner le dépôt
- **Terminal** : **Git Bash en mode administrateur** (Windows) ou Terminal standard (Linux)
- **Accès réseau** : Port ouvert (par défaut 3000)
- **Clés API** : OpenAI ou Anthropic configurées

### **⚠️ Windows : Utilisation de Git Bash en Mode Administrateur**

**Pourquoi Git Bash en mode administrateur ?**
- ✅ **PATH complet** : Accès à Bun, Node.js, Git sans configuration
- ✅ **Permissions** : Installation et configuration sans restrictions
- ✅ **Compatibilité** : Commandes Unix/Linux natives
- ✅ **Évite les erreurs** : "bun n'est pas reconnu", problèmes de permissions

## 🔐 Sécurité

⚠️ **Important** : Ne jamais commiter le fichier `.env` qui contient vos clés API.

```bash
# Vérifier que .env est dans .gitignore
echo ".env" >> .gitignore
```

## 🚀 Déploiement étape par étape

### 1. Cloner le dépôt

```bash
git clone https://github.com/denelfrederic/eliza.git
cd eliza/test-agent
```

### 2. Configuration des variables d'environnement

```bash
# Copier le fichier d'exemple
cp .env.example .env

# Éditer avec vos clés API
nano .env
```

Variables essentielles :
```env
# Au moins une clé API requise
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/eliza

# Production
NODE_ENV=production
PORT=3000
```

### 3. Installation des dépendances

```bash
bun install
```

### 4. Build de production

```bash
bun run build
```

### 5. Lancement en production

```bash
NODE_ENV=production bun run start
```

## 🔄 Supervision avec PM2

### Installation de PM2

```bash
# Installer PM2 globalement
bun install -g pm2
```

### Configuration PM2

Créer `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [{
    name: 'eliza-os',
    script: 'bun',
    args: 'run start',
    cwd: '/path/to/eliza/test-agent',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
```

### Commandes PM2

```bash
# Démarrer l'application
pm2 start ecosystem.config.js

# Voir les logs
pm2 logs eliza-os

# Redémarrer
pm2 restart eliza-os

# Arrêter
pm2 stop eliza-os

# Sauvegarder la configuration
pm2 save
pm2 startup
```

## 💾 Gestion des données

### Sauvegarde des données

```bash
# Créer un script de sauvegarde
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
tar -czf "eliza_backup_$DATE.tar.gz" data/ .eliza/
```

### Restauration

```bash
# Extraire la sauvegarde
tar -xzf eliza_backup_20240101_120000.tar.gz
```

## 📊 Logs et monitoring

### Localisation des logs

```bash
# Logs PM2
pm2 logs eliza-os

# Logs système (si systemd)
journalctl -u eliza-os -f
```

### Rotation des logs

```bash
# Configuration logrotate
sudo nano /etc/logrotate.d/eliza-os
```

Contenu :
```
/var/log/eliza-os/*.log {
    daily
    missingok
    rotate 7
    compress
    notifempty
    create 644 www-data www-data
}
```

## 🔄 Mise à jour et rollback

### Mise à jour

```bash
# Sauvegarder avant mise à jour
pm2 stop eliza-os
cp -r data/ data_backup_$(date +%Y%m%d)/

# Mettre à jour
git pull origin main
bun install
bun run build

# Redémarrer
pm2 start eliza-os
```

### Rollback

```bash
# Revenir à une version précédente
git checkout <commit-hash>
bun install
bun run build
pm2 restart eliza-os
```

### Tags de release (recommandé)

```bash
# Créer un tag
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# Déployer un tag spécifique
git checkout v1.0.0
bun install && bun run build
pm2 restart eliza-os
```

## 🛡️ Sécurité de base

### Firewall

```bash
# Ubuntu/Debian
sudo ufw allow 3000
sudo ufw enable

# CentOS/RHEL
sudo firewall-cmd --permanent --add-port=3000/tcp
sudo firewall-cmd --reload
```

### Utilisateur dédié

```bash
# Créer un utilisateur pour l'application
sudo useradd -m -s /bin/bash eliza
sudo chown -R eliza:eliza /path/to/eliza
```

## ⚠️ Problèmes courants et solutions

### 🚨 Problème : Ctrl+C ne permet pas d'arrêter le serveur

**Symptômes :**
- Ctrl+C ne fonctionne pas pour arrêter le serveur
- Le serveur redémarre automatiquement après Ctrl+C
- Besoin d'utiliser `taskkill` ou `pm2 stop` pour arrêter

**Cause principale :**
Configuration PM2 avec `autorestart: true` qui intercepte les signaux SIGINT

**Solutions :**

#### Solution 1 : Configuration PM2 corrigée (Recommandée)
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
      // ... autres variables
    },
    instances: 1,
    autorestart: false,  // ← SOLUTION : Désactiver l'auto-restart
    watch: false,
    max_memory_restart: '1G',
    kill_timeout: 5000,  // ← AJOUT : Timeout pour l'arrêt
    wait_ready: true,    // ← AJOUT : Attendre que l'app soit prête
    listen_timeout: 10000, // ← AJOUT : Timeout d'écoute
    shutdown_with_message: true, // ← AJOUT : Arrêt propre
    force: false         // ← AJOUT : Éviter l'arrêt forcé
  }]
}
```

#### Solution 2 : Démarrage direct sans PM2
```bash
# Pour le développement
bun run build
bunx elizaos start

# Avec variables d'environnement
$env:ELIZA_DISABLE_UPDATE_CHECK="true"; bunx elizaos start
```

#### Solution 3 : Commandes PM2 appropriées
```bash
# Arrêter proprement
pm2 stop eliza-test-agent

# Arrêter et supprimer
pm2 delete eliza-test-agent

# Voir les logs
pm2 logs eliza-test-agent
```

#### Solution 4 : Arrêt d'urgence
```powershell
# Arrêter tous les processus Bun
taskkill /F /IM bun.exe

# Arrêter tous les processus Node
taskkill /F /IM node.exe

# Vérifier les processus sur le port 3000
netstat -ano | findstr :3000
```

### 🔥 Problème : Agent reste en "thinking" sans répondre

**Symptômes :**
- Interface se lance correctement
- Agent affiche "Eliza is thinking..." indéfiniment
- Logs montrent "xhr poll error" dans le navigateur

**Causes possibles :**
1. **Double agent créé automatiquement** (cause principale)
2. **Plugins qui ne se chargent pas correctement**
3. **Conflit de modèles AI**

**Solutions :**

#### Solution 1 : Forcer un seul modèle (recommandé)
Dans `src/character.ts`, ajouter :
```typescript
settings: {
  model: 'gpt-4o-mini',
  embeddingModel: 'text-embedding-3-small',
  // Force l'utilisation exclusive d'OpenAI
  modelProvider: 'openai',
}
```

#### Solution 2 : Désactiver une clé API
Dans `.env`, commenter une des clés :
```env
# ANTHROPIC_API_KEY=sk-ant-...
# ou
# OPENAI_API_KEY=sk-proj-...
```

#### Solution 3 : Nettoyage complet
```bash
# Arrêter tous les processus
taskkill /F /IM bun.exe
taskkill /F /IM node.exe

# Nettoyer et réinstaller
rm -rf node_modules dist bun.lock
bun install
bun run build
```

### 🔧 Problème : Port déjà utilisé
**A:** Changez le port dans `.env` ou arrêtez le processus : `sudo lsof -i :3000`

### 🔧 Problème : Erreur de base de données
**A:** Vérifiez que PostgreSQL est démarré et que `DATABASE_URL` est correct.

### 🔧 Problème : Clés API manquantes
**A:** Vérifiez que `.env` contient au moins `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY`.

### 🔧 Problème : Mémoire insuffisante
**A:** Augmentez `max_memory_restart` dans `ecosystem.config.js` ou ajoutez de la RAM.

### 🔧 Problème : Double agent créé automatiquement
**Cause :** ElizaOS détecte plusieurs clés API et crée automatiquement des agents pour chaque modèle.

**Logs typiques :**
```
Info Final plugins being loaded: { plugins: [ "openai", "bootstrap" ] }  ← Agent 1
Info Final plugins being loaded: { plugins: [ "anthropic", "openai" ] }  ← Agent 2
```

**Solution :** Utiliser `modelProvider: 'openai'` dans `character.ts` pour forcer un seul modèle.

## 🔄 Gestion Multi-Agents

### Architecture Multi-Agents

```
eliza/
├── test-agent/          # Agent de développement/test
├── finance-agent/        # Agent financier spécialisé  
├── support-agent/        # Agent support client
└── docs/                # Documentation
```

### Déploiement Isolé par Agent

#### Configuration PM2 Multi-Agents

```javascript
// ecosystem-multi.config.js
module.exports = {
  apps: [
    {
      name: 'eliza-test-agent',
      script: 'bun',
      args: 'run start',
      cwd: './test-agent',
      env: { 
        NODE_ENV: 'production', 
        PORT: 3000,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      autorestart: false,
      kill_timeout: 5000
    },
    {
      name: 'eliza-finance-agent',
      script: 'bun',
      args: 'run start',
      cwd: './finance-agent',
      env: { 
        NODE_ENV: 'production', 
        PORT: 3001,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      autorestart: false,
      kill_timeout: 5000
    },
    {
      name: 'eliza-support-agent',
      script: 'bun',
      args: 'run start',
      cwd: './support-agent',
      env: { 
        NODE_ENV: 'production', 
        PORT: 3002,
        OPENAI_API_KEY: process.env.OPENAI_API_KEY
      },
      autorestart: false,
      kill_timeout: 5000
    }
  ]
}
```

#### Commandes Multi-Agents

```bash
# Démarrer tous les agents
pm2 start ecosystem-multi.config.js

# Démarrer un agent spécifique
pm2 start ecosystem-multi.config.js --only eliza-test-agent

# Arrêter un agent spécifique
pm2 stop eliza-test-agent

# Redémarrer un agent spécifique
pm2 restart eliza-finance-agent

# Voir tous les agents
pm2 list

# Logs d'un agent spécifique
pm2 logs eliza-test-agent

# Logs de tous les agents
pm2 logs
```

### Déploiement Docker Multi-Agents

#### Docker Compose Multi-Services

```yaml
# docker-compose.multi.yml
version: '3.8'
services:
  test-agent:
    build: ./test-agent
    ports:
      - "3000:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./test-agent/data:/app/data
    restart: unless-stopped

  finance-agent:
    build: ./finance-agent
    ports:
      - "3001:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./finance-agent/data:/app/data
    restart: unless-stopped

  support-agent:
    build: ./support-agent
    ports:
      - "3002:3000"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - NODE_ENV=production
    volumes:
      - ./support-agent/data:/app/data
    restart: unless-stopped
```

#### Commandes Docker Multi-Agents

```bash
# Démarrer tous les agents
docker-compose -f docker-compose.multi.yml up -d

# Démarrer un agent spécifique
docker-compose -f docker-compose.multi.yml up -d test-agent

# Arrêter un agent spécifique
docker-compose -f docker-compose.multi.yml stop test-agent

# Voir les logs d'un agent
docker-compose -f docker-compose.multi.yml logs -f test-agent

# Redémarrer un agent
docker-compose -f docker-compose.multi.yml restart test-agent
```

### Scripts de Gestion Multi-Agents

#### Script PowerShell de Sélection

```powershell
# manage-agents.ps1
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("start", "stop", "restart", "logs", "status")]
    [string]$Action,
    
    [Parameter(Mandatory=$false)]
    [ValidateSet("test", "finance", "support", "all")]
    [string]$Agent = "all"
)

$agents = @{
    "test" = @{ path = "test-agent"; port = 3000 }
    "finance" = @{ path = "finance-agent"; port = 3001 }
    "support" = @{ path = "support-agent"; port = 3002 }
}

function Execute-Action {
    param($agentName, $agentConfig)
    
    $agentPath = "C:\Cursor_Projects\eliza\$($agentConfig.path)"
    
    if (Test-Path $agentPath) {
        Set-Location $agentPath
        
        switch ($Action) {
            "start" {
                Write-Host "🚀 Démarrage de l'agent $agentName" -ForegroundColor Green
                pm2 start ecosystem.config.js --name "eliza-$agentName-agent"
            }
            "stop" {
                Write-Host "⏹️ Arrêt de l'agent $agentName" -ForegroundColor Yellow
                pm2 stop "eliza-$agentName-agent"
            }
            "restart" {
                Write-Host "🔄 Redémarrage de l'agent $agentName" -ForegroundColor Cyan
                pm2 restart "eliza-$agentName-agent"
            }
            "logs" {
                Write-Host "📝 Logs de l'agent $agentName" -ForegroundColor Blue
                pm2 logs "eliza-$agentName-agent"
            }
            "status" {
                Write-Host "📊 Statut de l'agent $agentName" -ForegroundColor Magenta
                pm2 show "eliza-$agentName-agent"
            }
        }
    } else {
        Write-Host "❌ Agent $agentName non trouvé" -ForegroundColor Red
    }
}

if ($Agent -eq "all") {
    foreach ($agentName in $agents.Keys) {
        Execute-Action $agentName $agents[$agentName]
    }
} else {
    Execute-Action $Agent $agents[$Agent]
}

# Afficher le statut global
pm2 list
```

#### Usage du Script

```powershell
# Démarrer tous les agents
.\manage-agents.ps1 -Action start -Agent all

# Démarrer l'agent test
.\manage-agents.ps1 -Action start -Agent test

# Arrêter l'agent finance
.\manage-agents.ps1 -Action stop -Agent finance

# Voir les logs de l'agent support
.\manage-agents.ps1 -Action logs -Agent support

# Statut de tous les agents
.\manage-agents.ps1 -Action status -Agent all
```

## 📞 Support

- **Issues** : [GitHub Issues](https://github.com/denelfrederic/eliza/issues)
- **Documentation ElizaOS** : [ElizaOS Docs](https://docs.elizaos.com)
- **Communauté** : [ElizaOS Discord](https://discord.gg/elizaos)
- **Guide Démarrage/Arrêt** : [docs/demarrage-arret.md](demarrage-arret.md)
- **Guide Git Bash** : [docs/git-bash-guide.md](git-bash-guide.md)

---

**Dépôt** : [denelfrederic/eliza](https://github.com/denelfrederic/eliza)
