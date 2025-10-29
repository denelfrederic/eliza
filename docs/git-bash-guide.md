# 🐚 Guide Git Bash - ElizaOS

> **Guide complet** pour utiliser Git Bash en mode administrateur avec ElizaOS

## 🎯 Pourquoi Git Bash en Mode Administrateur ?

### **Problèmes Résolus**

| Problème | Cause | Solution Git Bash |
|----------|-------|-------------------|
| `bun n'est pas reconnu` | PATH Windows incomplet | ✅ PATH Unix complet |
| Permissions insuffisantes | Restrictions Windows | ✅ Mode administrateur |
| Commandes incompatibles | Syntaxe PowerShell | ✅ Syntaxe Unix native |
| Installation échouée | Droits limités | ✅ Droits complets |

### **Avantages de Git Bash**

- ✅ **PATH complet** : Accès à tous les outils (Bun, Node.js, Git, npm)
- ✅ **Permissions élevées** : Installation et configuration sans restrictions
- ✅ **Compatibilité Unix** : Commandes Linux/Unix natives
- ✅ **Environnement cohérent** : Même syntaxe que Linux/Mac
- ✅ **Évite les erreurs** : Pas de problèmes de reconnaissance d'outils

## 🚀 Installation et Configuration

### **1. Ouvrir Git Bash en Mode Administrateur**

#### **Méthode 1 : Menu Démarrer**
1. Clic droit sur **Git Bash**
2. Sélectionner **"Exécuter en tant qu'administrateur"**

#### **Méthode 2 : Recherche**
1. Appuyer sur `Windows + R`
2. Taper `git-bash`
3. Appuyer sur `Ctrl + Shift + Enter`

#### **Méthode 3 : Invite de commandes**
```cmd
# Ouvrir PowerShell en administrateur
Start-Process powershell -Verb RunAs

# Puis lancer Git Bash
& "C:\Program Files\Git\bin\bash.exe"
```

### **2. Vérification de l'Environnement**

```bash
# Vérifier les outils disponibles
which bun
which node
which npm
which git

# Vérifier les versions
bun --version
node --version
npm --version
git --version

# Vérifier les permissions
whoami
id
```

### **3. Configuration du PATH (si nécessaire)**

```bash
# Ajouter Bun au PATH (si pas automatique)
export PATH="$PATH:/c/Users/$USER/.bun/bin"

# Ajouter Node.js au PATH (si nécessaire)
export PATH="$PATH:/c/Program Files/nodejs"

# Vérifier le PATH
echo $PATH
```

## 🔧 Utilisation avec ElizaOS

### **Navigation dans le Projet**

```bash
# Aller dans le projet ElizaOS
cd /c/cursor-projects/eliza

# Voir la structure
ls -la

# Aller dans un agent spécifique
cd test-agent
# ou
cd finance-agent
# ou
cd support-agent
```

### **Commandes ElizaOS**

#### **Installation des Dépendances**
```bash
# Installer les dépendances
bun install

# Nettoyer et réinstaller (si problème)
rm -rf node_modules bun.lock
bun install --force
```

#### **Build du Projet**
```bash
# Build standard
bun run build

# Build avec watch (développement)
bun run build:watch
```

#### **Démarrage des Agents**

**Agent Test (Port 3000)**
```bash
cd test-agent
bun run build
bunx elizaos start
```

**Agent Finance (Port 3001)**
```bash
cd finance-agent
bun run build
bunx elizaos start
```

**Agent Support (Port 3002)**
```bash
cd support-agent
bun run build
bunx elizaos start
```

### **Gestion Multi-Agents**

#### **Script de Gestion**
```bash
# Démarrer tous les agents
./manage-agents.ps1 -Action start -Agent all

# Démarrer un agent spécifique
./manage-agents.ps1 -Action start -Agent test

# Arrêter un agent
./manage-agents.ps1 -Action stop -Agent finance

# Voir les logs
./manage-agents.ps1 -Action logs -Agent support
```

#### **Commandes PM2**
```bash
# Démarrer tous les agents
pm2 start ecosystem-multi.config.js

# Démarrer un agent spécifique
pm2 start ecosystem-multi.config.js --only eliza-test-agent

# Voir le statut
pm2 list

# Logs d'un agent
pm2 logs eliza-test-agent

# Arrêter un agent
pm2 stop eliza-test-agent
```

## 🐛 Dépannage Git Bash

### **Problèmes Courants**

#### **1. "bun n'est pas reconnu"**
```bash
# Vérifier l'installation
ls -la ~/.bun/bin/

# Ajouter au PATH
export PATH="$PATH:$HOME/.bun/bin"

# Redémarrer Git Bash
```

#### **2. Permissions insuffisantes**
```bash
# Vérifier les permissions
ls -la /c/cursor-projects/eliza/

# Changer les permissions (si nécessaire)
chmod -R 755 /c/cursor-projects/eliza/
```

#### **3. Chemin Windows vs Unix**
```bash
# Chemin Windows
C:\cursor-projects\eliza\test-agent

# Chemin Git Bash (Unix)
/c/cursor-projects/eliza/test-agent

# Conversion automatique
cd /c/cursor-projects/eliza/test-agent
```

#### **4. Variables d'environnement**
```bash
# Variables d'environnement Unix
export OPENAI_API_KEY="sk-proj-your-key"
export NODE_ENV="development"

# Vérifier les variables
env | grep OPENAI
```

#### **5. Ctrl+C ne fonctionne pas pour arrêter l'agent**

**Symptôme :** Appuyer sur Ctrl+C ne ferme pas le processus Bun.

**Solution :** Utiliser la commande Windows via `cmd.exe` :

```bash
# Arrêter tous les processus Bun (COMMANDE CORRECTE)
cmd.exe //c "taskkill /F /IM bun.exe"

# Vérifier que les processus sont arrêtés
ps aux | grep bun
```

**Note importante :** 
- ❌ Ne pas utiliser `taskkill //F //IM bun.exe` directement (ne fonctionne pas dans Git Bash)
- ✅ Utiliser `cmd.exe //c "taskkill /F /IM bun.exe"` (syntaxe correcte)

#### **6. Arrêt d'un processus spécifique par PID**

```bash
# Trouver le PID du processus
ps aux | grep bun

# Arrêter avec cmd.exe (méthode recommandée)
cmd.exe //c "taskkill /F /PID <PID_NUMBER>"

# Ou utiliser kill si disponible
kill -9 <PID_NUMBER>
```

### **Scripts de Diagnostic**

#### **Script de Vérification**
```bash
#!/bin/bash
# check-environment.sh

echo "🔍 Diagnostic ElizaOS - Git Bash"
echo "================================="

echo "📊 Outils disponibles:"
which bun && bun --version || echo "❌ Bun non trouvé"
which node && node --version || echo "❌ Node.js non trouvé"
which npm && npm --version || echo "❌ npm non trouvé"
which git && git --version || echo "❌ Git non trouvé"

echo "📁 Répertoire actuel:"
pwd

echo "🔑 Variables d'environnement:"
echo "NODE_ENV: $NODE_ENV"
echo "PATH: $PATH"

echo "📂 Structure du projet:"
ls -la /c/cursor-projects/eliza/ 2>/dev/null || echo "❌ Projet non trouvé"
```

## 🎯 Bonnes Pratiques

### **1. Organisation des Sessions**
```bash
# Créer des alias pour les agents
alias eliza-test="cd /c/cursor-projects/eliza/test-agent"
alias eliza-finance="cd /c/cursor-projects/eliza/finance-agent"
alias eliza-support="cd /c/cursor-projects/eliza/support-agent"

# Ajouter aux alias permanents
echo 'alias eliza-test="cd /c/cursor-projects/eliza/test-agent"' >> ~/.bashrc
```

### **2. Scripts de Démarrage**
```bash
#!/bin/bash
# start-agent.sh

AGENT=$1
if [ -z "$AGENT" ]; then
    echo "Usage: ./start-agent.sh [test|finance|support]"
    exit 1
fi

cd /c/cursor-projects/eliza/$AGENT-agent
echo "🚀 Démarrage de l'agent $AGENT..."
bun run build
bunx elizaos start
```

### **3. Gestion des Variables d'Environnement**
```bash
# Créer un fichier .env.local
cat > .env.local << EOF
OPENAI_API_KEY=sk-proj-your-key
NODE_ENV=development
PORT=3000
EOF

# Charger les variables
source .env.local
```

## 📚 Ressources Supplémentaires

### **Documentation ElizaOS**
- [Guide officiel](https://docs.elizaos.com)
- [Architecture Multi-Agents](docs/architecture-multi-agents.md)
- [Guide Démarrage/Arrêt](docs/demarrage-arret.md)
- [Guide Déploiement](docs/deploiement.md)

### **Commandes Git Bash Utiles**

#### **Arrêt des Processus**
```bash
# Arrêt normal (devrait fonctionner)
Ctrl+C

# Si Ctrl+C ne fonctionne pas (COMMANDE CORRECTE)
cmd.exe //c "taskkill /F /IM bun.exe"

# Arrêter tous les processus Bun et Node
cmd.exe //c "taskkill /F /IM bun.exe"
cmd.exe //c "taskkill /F /IM node.exe"

# Trouver et arrêter un processus spécifique
ps aux | grep bun
cmd.exe //c "taskkill /F /PID <PID_NUMBER>"
```

#### **Autres Commandes Utiles**
```bash
# Historique des commandes
history

# Recherche dans l'historique
history | grep bun

# Édition de fichiers
nano .env
# ou
vim .env

# Surveillance des logs
tail -f logs/agent.log

# Processus en cours
ps aux | grep bun
```

---

**🎉 Git Bash en mode administrateur = Développement ElizaOS sans problèmes !**
