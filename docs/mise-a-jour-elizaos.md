# 🔄 Guide de Mise à Jour ElizaOS

> **Guide complet** pour mettre à jour ElizaOS et ses agents vers les dernières versions

## 📋 Table des Matières

- [🎯 Vue d'ensemble](#-vue-densemble)
- [🔍 Vérification des Versions](#-vérification-des-versions)
- [🚀 Mise à Jour Globale](#-mise-à-jour-globale)
- [🤖 Mise à Jour des Agents](#-mise-à-jour-des-agents)
- [✅ Vérification Post-Mise à Jour](#-vérification-post-mise-à-jour)
- [🐛 Dépannage](#-dépannage)
- [📊 Scripts Automatisés](#-scripts-automatisés)

## 🎯 Vue d'ensemble

### **Architecture de Mise à Jour**

ElizaOS utilise une architecture **multi-niveaux** :

```
eliza/                          # CLI global (outil de développement)
├── test-agent/                 # Agent 1 avec ses dépendances
├── finance-agent/              # Agent 2 avec ses dépendances  
└── support-agent/              # Agent 3 avec ses dépendances
```

### **Types de Mise à Jour**

| Type | Description | Commande | Impact |
|------|-------------|----------|--------|
| **CLI Global** | Outil de développement | `bun i -g @elizaos/cli@latest` | Tous les agents |
| **Dépendances Locales** | Bibliothèques d'exécution | `bun update @elizaos/*@latest` | Agent spécifique |

### **⚠️ Prérequis Importants**

- **Git Bash en mode administrateur** (Windows)
- **Bun installé** et accessible
- **Projet sauvegardé** avant mise à jour
- **Tests fonctionnels** après mise à jour

## 🔍 Vérification des Versions

### **1. Vérifier la Version Globale**

```bash
# Vérifier le CLI global
bun pm ls -g | grep @elizaos

# Alternative avec npm
npm list -g @elizaos/cli
```

### **2. Vérifier les Versions des Agents**

```bash
# Dans chaque agent
cd test-agent
bun pm ls | grep @elizaos

cd ../finance-agent
bun pm ls | grep @elizaos

cd ../support-agent
bun pm ls | grep @elizaos
```

### **3. Script de Vérification Complète**

```bash
#!/bin/bash
# check-versions.sh

echo "🔍 Vérification des versions ElizaOS"
echo "===================================="

echo "🌍 CLI Global:"
bun pm ls -g | grep @elizaos || echo "CLI non installé globalement"

echo "🤖 test-agent:"
cd test-agent
bun pm ls | grep @elizaos
cd ..

echo "💰 finance-agent:"
cd finance-agent
bun pm ls | grep @elizaos
cd ..

echo "🛠️ support-agent:"
cd support-agent
bun pm ls | grep @elizaos
cd ..

echo "✅ Vérification terminée"
```

## 🚀 Mise à Jour Globale

### **1. Mise à Jour du CLI ElizaOS**

```bash
# Mise à jour globale du CLI
bun i -g @elizaos/cli@latest

# Vérifier la mise à jour
bun pm ls -g | grep @elizaos
```

### **2. Vérification Post-CLI**

```bash
# Tester les nouvelles fonctionnalités
elizaos --version

# Vérifier les commandes disponibles
elizaos --help
```

## 🤖 Mise à Jour des Agents

### **1. Mise à Jour Individuelle**

#### **test-agent**
```bash
cd test-agent
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
bun pm ls | grep @elizaos
cd ..
```

#### **finance-agent**
```bash
cd finance-agent
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
bun pm ls | grep @elizaos
cd ..
```

#### **support-agent**
```bash
cd support-agent
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
bun pm ls | grep @elizaos
cd ..
```

### **2. Mise à Jour en Lot**

```bash
#!/bin/bash
# update-all-agents.sh

echo "🚀 Mise à jour de tous les agents ElizaOS..."

# Mise à jour globale
echo "🌍 Mise à jour CLI global..."
bun i -g @elizaos/cli@latest

# Mise à jour test-agent
echo "🤖 Mise à jour test-agent..."
cd test-agent
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
echo "Versions dans test-agent:"
bun pm ls | grep @elizaos
cd ..

# Mise à jour finance-agent
echo "💰 Mise à jour finance-agent..."
cd finance-agent
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
echo "Versions dans finance-agent:"
bun pm ls | grep @elizaos
cd ..

# Mise à jour support-agent
echo "🛠️ Mise à jour support-agent..."
cd support-agent
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
echo "Versions dans support-agent:"
bun pm ls | grep @elizaos
cd ..

echo "✅ Tous les agents mis à jour !"
```

## ✅ Vérification Post-Mise à Jour

### **1. Tests de Fonctionnement**

```bash
# Test de build
cd test-agent
bun run build
cd ../finance-agent
bun run build
cd ../support-agent
bun run build
cd ..
```

### **2. Tests de Démarrage**

```bash
# Test de démarrage (arrêter avec Ctrl+C)
cd test-agent
bunx elizaos start
# Ctrl+C pour arrêter

cd ../finance-agent
bunx elizaos start
# Ctrl+C pour arrêter

cd ../support-agent
bunx elizaos start
# Ctrl+C pour arrêter
```

### **3. Script de Vérification Complète**

```bash
#!/bin/bash
# verify-update.sh

echo "🧪 Vérification post-mise à jour"
echo "==============================="

# Vérifier les versions
echo "📊 Versions installées:"
echo "CLI Global:"
bun pm ls -g | grep @elizaos

echo "test-agent:"
cd test-agent && bun pm ls | grep @elizaos && cd ..

echo "finance-agent:"
cd finance-agent && bun pm ls | grep @elizaos && cd ..

echo "support-agent:"
cd support-agent && bun pm ls | grep @elizaos && cd ..

# Tests de build
echo "🔨 Tests de build:"
for agent in test-agent finance-agent support-agent; do
    echo "Build $agent..."
    cd $agent
    if bun run build; then
        echo "✅ $agent build OK"
    else
        echo "❌ $agent build FAILED"
    fi
    cd ..
done

echo "✅ Vérification terminée"
```

## 🐛 Dépannage

### **Problèmes Courants**

#### **1. "bun n'est pas reconnu"**

**Cause :** Bun pas dans le PATH ou pas installé

**Solution :**
```bash
# Vérifier l'installation
which bun

# Réinstaller Bun si nécessaire
curl -fsSL https://bun.sh/install | bash
source ~/.bashrc
```

#### **2. Versions non mises à jour**

**Cause :** Cache Bun ou versions spécifiques

**Solution :**
```bash
# Nettoyer le cache
bun pm cache clean

# Forcer la mise à jour
bun update --force @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
```

#### **3. Conflits de dépendances**

**Cause :** Versions incompatibles entre agents

**Solution :**
```bash
# Nettoyer et réinstaller
rm -rf node_modules bun.lock
bun install
bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
```

#### **4. Build échoue après mise à jour**

**Cause :** Changements breaking dans la nouvelle version

**Solution :**
```bash
# Vérifier les changelogs
# Adapter le code si nécessaire
# Tester avec une version antérieure si problème critique
```

### **Script de Diagnostic**

```bash
#!/bin/bash
# diagnose-update.sh

echo "🔍 Diagnostic de mise à jour ElizaOS"
echo "===================================="

echo "📊 Environnement:"
echo "Bun version: $(bun --version)"
echo "Node version: $(node --version)"
echo "OS: $(uname -a)"

echo "📦 CLI Global:"
bun pm ls -g | grep @elizaos || echo "CLI non installé"

echo "🤖 Agents:"
for agent in test-agent finance-agent support-agent; do
    if [ -d "$agent" ]; then
        echo "Versions dans $agent:"
        cd $agent
        bun pm ls | grep @elizaos
        cd ..
    else
        echo "❌ $agent non trouvé"
    fi
done

echo "🔧 Tests de build:"
for agent in test-agent finance-agent support-agent; do
    if [ -d "$agent" ]; then
        echo "Test build $agent..."
        cd $agent
        if timeout 30 bun run build; then
            echo "✅ $agent build OK"
        else
            echo "❌ $agent build FAILED"
        fi
        cd ..
    fi
done

echo "✅ Diagnostic terminé"
```

## 📊 Scripts Automatisés

### **Script Principal de Mise à Jour**

```bash
#!/bin/bash
# update-elizaos.sh

set -e  # Arrêter en cas d'erreur

echo "🚀 Mise à jour ElizaOS - $(date)"
echo "================================"

# Sauvegarde
echo "💾 Sauvegarde du projet..."
BACKUP_DIR="backups/backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
cp -r test-agent finance-agent support-agent "$BACKUP_DIR/" 2>/dev/null || true

# Mise à jour CLI global
echo "🌍 Mise à jour CLI global..."
bun i -g @elizaos/cli@latest

# Mise à jour des agents
for agent in test-agent finance-agent support-agent; do
    if [ -d "$agent" ]; then
        echo "🤖 Mise à jour $agent..."
        cd $agent
        
        # Mise à jour des dépendances
        bun update @elizaos/cli@latest @elizaos/client@latest @elizaos/core@latest @elizaos/plugin-bootstrap@latest @elizaos/plugin-sql@latest @elizaos/server@latest
        
        # Test de build
        echo "🔨 Test build $agent..."
        if bun run build; then
            echo "✅ $agent build OK"
        else
            echo "❌ $agent build FAILED"
            echo "🔄 Restauration depuis la sauvegarde..."
            cd ..
            rm -rf $agent
            cp -r "$BACKUP_DIR/$agent" .
            echo "✅ $agent restauré"
            continue
        fi
        
        cd ..
    else
        echo "❌ $agent non trouvé"
    fi
done

echo "✅ Mise à jour terminée !"
echo "📊 Résumé:"
echo "CLI Global:"
bun pm ls -g | grep @elizaos

echo "Agents:"
for agent in test-agent finance-agent support-agent; do
    if [ -d "$agent" ]; then
        echo "$agent:"
        cd $agent && bun pm ls | grep @elizaos && cd ..
    fi
done
```

### **Script de Rollback**

```bash
#!/bin/bash
# rollback-elizaos.sh

echo "🔄 Rollback ElizaOS"
echo "=================="

# Lister les sauvegardes disponibles
echo "📁 Sauvegardes disponibles:"
ls -la backups/ | grep backup_

# Demander la sauvegarde à restaurer
read -p "Entrez le nom de la sauvegarde à restaurer: " BACKUP_NAME

if [ -d "backups/$BACKUP_NAME" ]; then
    echo "🔄 Restauration depuis $BACKUP_NAME..."
    
    # Arrêter les agents en cours
    pm2 stop all 2>/dev/null || true
    
    # Restaurer les agents
    rm -rf test-agent finance-agent support-agent
    cp -r "backups/$BACKUP_NAME"/* .
    
    echo "✅ Rollback terminé"
else
    echo "❌ Sauvegarde $BACKUP_NAME non trouvée"
fi
```

### **Script de Monitoring Post-Mise à Jour**

```bash
#!/bin/bash
# monitor-update.sh

echo "📊 Monitoring post-mise à jour"
echo "============================="

# Vérifier les processus
echo "🔄 Processus en cours:"
pm2 list 2>/dev/null || echo "PM2 non utilisé"

# Vérifier les ports
echo "🌐 Ports utilisés:"
netstat -tulpn | grep :300 || echo "Aucun port 300x utilisé"

# Vérifier les logs
echo "📝 Derniers logs:"
pm2 logs --lines 5 2>/dev/null || echo "Pas de logs PM2"

# Test de connectivité
echo "🔗 Test de connectivité:"
for port in 3000 3001 3002; do
    if curl -s http://localhost:$port > /dev/null; then
        echo "✅ Port $port accessible"
    else
        echo "❌ Port $port non accessible"
    fi
done
```

## 🎯 Bonnes Pratiques

### **Avant la Mise à Jour**

1. ✅ **Sauvegarder le projet** complet
2. ✅ **Tester les agents** en cours
3. ✅ **Vérifier les changelogs** de la nouvelle version
4. ✅ **Prévoir du temps** pour les tests post-mise à jour

### **Pendant la Mise à Jour**

1. ✅ **Mise à jour globale** d'abord
2. ✅ **Mise à jour agent par agent** pour isoler les problèmes
3. ✅ **Tests de build** après chaque agent
4. ✅ **Documentation** des changements

### **Après la Mise à Jour**

1. ✅ **Tests fonctionnels** complets
2. ✅ **Vérification des performances**
3. ✅ **Documentation** des nouvelles fonctionnalités
4. ✅ **Formation** de l'équipe si nécessaire

## 📚 Ressources Supplémentaires

### **Documentation ElizaOS**
- [Guide officiel](https://docs.elizaos.com)
- [Changelog](https://github.com/elizaos/eliza/releases)
- [Migration Guide](https://docs.elizaos.com/migration)

### **Guides Complémentaires**
- [Architecture Multi-Agents](architecture-multi-agents.md)
- [Guide Démarrage/Arrêt](demarrage-arret.md)
- [Guide Déploiement](deploiement.md)
- [Guide Git Bash](git-bash-guide.md)

---

**🎉 Mise à jour ElizaOS maîtrisée !** Suivez ce guide pour des mises à jour fluides et sans risque.
