# 🔄 Migration vers Git Bash Uniquement

## 📅 Date : 2025-10-05

## 🎯 Objectif

Simplifier le workflow de développement en utilisant **uniquement Git Bash** et en supprimant les dépendances PM2 et PowerShell.

## ✅ Changements appliqués

### **1. Nettoyage des scripts obsolètes**

**Fichiers supprimés :**
- ❌ `test-agent/ecosystem.config.js` (remplacé par démarrage direct)
- ❌ `test-agent/ecosystem.config.cjs` (contenait la clé API exposée)
- ❌ `test-agent/fix-and-start.ps1`
- ❌ `test-agent/start.bat`
- ❌ `test-agent/start.ps1`
- ❌ `test-agent/start-agent.ps1`
- ❌ `test-agent/start-with-pm2.ps1`
- ❌ `test-agent/test-ctrl-c.ps1`

**Raison :** Ces scripts ne sont plus nécessaires avec Git Bash + démarrage direct.

### **2. Script Git Bash simplifié**

**Fichier créé/conservé :**
- ✅ `test-agent/start.sh` - Script unique de démarrage

```bash
#!/bin/bash
cd /c/cursor-projects/eliza/test-agent
echo "🔨 Building project..."
bun run build
echo "🚀 Starting ElizaOS agent..."
bunx elizaos start
```

### **3. Mise à jour de .gitignore**

**Ajouts pour sécurité :**
```gitignore
# Scripts PM2/PowerShell (utilisation Git Bash uniquement)
ecosystem.config.js
ecosystem.config.cjs
ecosystem-multi.config.js
*.ps1
*.bat

# Fichiers de sauvegarde
*.backup
*.bak
*.sauv
```

**Raison :** Empêcher les scripts avec clés API exposées d'être committés.

### **4. Documentation mise à jour**

**Fichiers modifiés :**

1. **README.md**
   - ✅ Section "Lancer en développement" simplifiée (Git Bash uniquement)
   - ✅ Section "Gestion Multi-Agents" adaptée pour terminaux Git Bash multiples
   - ✅ Section "Dépannage" mise à jour (commandes Git Bash)
   - ❌ Suppression des références à PM2 et PowerShell

2. **docs/quick-setup.md**
   - ✅ Méthode de démarrage simplifiée avec `./start.sh`
   - ✅ Commandes utiles adaptées pour Git Bash
   - ❌ Suppression des références PM2

3. **.gitignore**
   - ✅ Ajout d'exclusions pour scripts PM2/PowerShell
   - ✅ Protection contre commit de fichiers de config sensibles

## 📋 Nouveaux workflows

### **Démarrage simple (1 agent)**

```bash
# Terminal Git Bash (en mode administrateur)
cd /c/cursor-projects/eliza/test-agent
./start.sh

# Arrêt : Ctrl+C
```

### **Multi-agents (plusieurs terminaux)**

```bash
# Terminal 1 : test-agent
cd /c/cursor-projects/eliza/test-agent
./start.sh

# Terminal 2 : finance-agent
cd /c/cursor-projects/eliza/finance-agent
PORT=3001 ./start.sh

# Terminal 3 : support-agent
cd /c/cursor-projects/eliza/support-agent
PORT=3002 ./start.sh
```

### **Développement avec hot reload**

```bash
cd /c/cursor-projects/eliza/test-agent
bunx elizaos dev
```

## 🔒 Sécurité améliorée

### **Avant**
- ❌ Clés API hardcodées dans `ecosystem.config.cjs`
- ❌ Risque de commit de clés exposées
- ❌ GitHub bloque les pushs

### **Après**
- ✅ Clés API uniquement dans `.env` (ignoré par git)
- ✅ `.gitignore` bloque tous les fichiers de config potentiellement sensibles
- ✅ Scripts PM2/PowerShell ignorés par défaut

## 📊 Avantages

### **Simplicité**
- 1 seul outil : Git Bash
- 1 commande pour démarrer : `./start.sh` ou `bunx elizaos start`
- 1 commande pour arrêter : `Ctrl+C`

### **Sécurité**
- Pas de clés API en dur dans les fichiers de config
- Protection automatique via `.gitignore`
- Détection précoce d'exposition avec `grep -r "sk-"`

### **Performance**
- Démarrage plus rapide (pas de PM2 overhead)
- Logs en temps réel dans le terminal
- Hot reload natif avec `bunx elizaos dev`

## 🚫 Ce qui n'est plus supporté

- ❌ Scripts PowerShell (`.ps1`)
- ❌ Scripts Batch (`.bat`)
- ❌ PM2 pour le développement local
- ❌ Fichiers `ecosystem.config.*`

**Note :** PM2 peut toujours être utilisé en production si nécessaire, mais n'est plus documenté pour le développement local.

## 🔄 Migration pour les utilisateurs existants

### **Si vous utilisez encore PM2 :**

```bash
# 1. Arrêter tous les processus PM2
pm2 kill

# 2. Supprimer les fichiers de config PM2
rm ecosystem.config.js ecosystem.config.cjs

# 3. Passer au démarrage Git Bash
cd /c/cursor-projects/eliza/test-agent
./start.sh
```

### **Si vous avez des scripts PowerShell :**

```bash
# Ils seront ignorés par git
# Utilisez uniquement start.sh à la place
```

## ✅ Vérification post-migration

### **1. Vérifier qu'aucune clé n'est exposée**

```bash
grep -r "sk-" . --exclude-dir=node_modules --exclude-dir=.git
```

**Résultat attendu :** Aucune occurrence (ou uniquement dans `.env` qui est ignoré)

### **2. Tester le démarrage**

```bash
cd /c/cursor-projects/eliza/test-agent
./start.sh
```

**Résultat attendu :** Agent démarre et accessible sur http://localhost:3000

### **3. Tester l'arrêt**

```
Ctrl+C dans le terminal
```

**Résultat attendu :** Agent s'arrête proprement

### **4. Vérifier git status**

```bash
git status
```

**Résultat attendu :** Aucun fichier `.ps1`, `.bat`, ou `ecosystem.config.*` dans les changements

## 📚 Documentation de référence

- **[README.md](README.md)** - Guide principal mis à jour
- **[docs/quick-setup.md](docs/quick-setup.md)** - Configuration rapide Git Bash
- **[docs/troubleshooting-agent-no-response.md](docs/troubleshooting-agent-no-response.md)** - Dépannage
- **[.gitignore](.gitignore)** - Fichiers ignorés par git

## 🎯 Prochaines étapes recommandées

1. ✅ Tester le démarrage avec `./start.sh`
2. ✅ Vérifier que l'agent répond aux messages
3. ✅ Commit des changements (sans clés API !)
4. ✅ Push vers GitHub (devrait passer sans bloquer)

---

**🎉 Migration terminée ! Développez simplement avec Git Bash.**
