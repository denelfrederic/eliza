# 🚀 Guide de Démarrage - Finance Agent

> **Procédure complète** pour lancer l'agent Finance Agent (FinanceBot) étape par étape

## ⚡ Démarrage Rapide (Méthode Simplifiée)

Si vous voulez démarrer rapidement, utilisez le script automatisé :

```bash
# 1. Ouvrir Git Bash en mode administrateur
# 2. Naviguer vers finance-agent
cd /c/cursor-projects/eliza/finance-agent

# 3. Lancer le script (il fera tout automatiquement)
./start.sh
```

Le script va :
- ✅ Vérifier que Bun est installé
- ✅ Vérifier/créer le fichier `.env` si nécessaire
- ✅ Installer les dépendances si besoin
- ✅ Builder le projet
- ✅ Lancer FinanceBot

**⚠️ Important** : Vous devrez quand même configurer votre clé API dans `.env` avant de lancer.

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir :

- [x] **Bun installé** : Vérifiez avec `bun --version` (doit afficher une version)
- [x] **Git Bash en mode administrateur** : Important pour éviter les problèmes de PATH sous Windows
- [x] **Une clé API** : Au moins une des suivantes :
  - OpenAI API Key (recommandé) : https://platform.openai.com/api-keys
  - Anthropic API Key : https://console.anthropic.com/
  - Ollama (pour usage local) : https://ollama.ai/

## 🎯 Étape 1 : Naviguer vers le dossier finance-agent

Ouvrez **Git Bash en mode administrateur** et naviguez vers le dossier :

```bash
cd /c/cursor-projects/eliza/finance-agent
```

**Note** : Si votre projet est ailleurs, adaptez le chemin selon votre structure.

## 📦 Étape 2 : Installer les dépendances

Installez toutes les dépendances nécessaires :

```bash
bun install
```

Cette commande va télécharger et installer tous les packages requis :
- `@elizaos/core` - Framework ElizaOS
- `@elizaos/plugin-openai` - Plugin OpenAI
- `@elizaos/plugin-anthropic` - Plugin Anthropic
- `@elizaos/plugin-ollama` - Plugin Ollama
- `@elizaos/plugin-sql` - Plugin SQL
- `@elizaos/plugin-bootstrap` - Plugin Bootstrap (essentiel)
- Et d'autres dépendances...

**Durée estimée** : 1-2 minutes selon votre connexion internet.

## ⚙️ Étape 3 : Créer le fichier de configuration `.env`

Créez un fichier `.env` à la racine du dossier `finance-agent` :

```bash
# Créer le fichier .env
touch .env
```

Ensuite, éditez ce fichier avec votre éditeur préféré (ou utilisez `nano .env` ou `notepad .env`) :

```env
# ============================================
# Configuration Finance Agent
# ============================================

# Clé API OpenAI (recommandé pour les meilleures performances)
OPENAI_API_KEY=sk-proj-VOTRE-CLE-ICI

# OU Clé API Anthropic (alternative)
# ANTHROPIC_API_KEY=sk-ant-VOTRE-CLE-ICI

# OU Configuration Ollama (pour usage local)
# OLLAMA_API_ENDPOINT=http://localhost:11434

# ============================================
# Configuration du Serveur
# ============================================

# Port du serveur (par défaut : 3000)
PORT=3001

# Environnement (development ou production)
NODE_ENV=development

# ============================================
# Configuration ElizaOS
# ============================================

ELIZA_SERVER_PORT=3001
ELIZA_SERVER_HOST=localhost
ELIZA_SERVER_WEBSOCKET_ENABLED=true

# ============================================
# Configuration Base de Données (optionnel)
# ============================================

# DATABASE_URL=postgresql://user:pass@localhost:5432/eliza_finance

# ============================================
# Plugins Optionnels (décommentez si nécessaire)
# ============================================

# Discord (si vous souhaitez connecter Discord)
# DISCORD_API_TOKEN=VOTRE-TOKEN-DISCORD

# Telegram (si vous souhaitez connecter Telegram)
# TELEGRAM_BOT_TOKEN=VOTRE-TOKEN-TELEGRAM

# Twitter/X (si vous souhaitez connecter Twitter)
# TWITTER_API_KEY=VOTRE-CLE-TWITTER
# TWITTER_API_SECRET_KEY=VOTRE-SECRET-TWITTER
# TWITTER_ACCESS_TOKEN=VOTRE-TOKEN-ACCESS
# TWITTER_ACCESS_TOKEN_SECRET=VOTRE-TOKEN-SECRET
```

**⚠️ Important** :
- Remplacez `VOTRE-CLE-ICI` par votre vraie clé API
- Ne commitez JAMAIS le fichier `.env` dans Git (il est déjà dans `.gitignore`)
- Le port 3001 est utilisé pour éviter les conflits avec d'autres agents (test-agent utilise 3000)

## 🔍 Étape 4 : Vérifier la configuration du character

Vérifiez que le fichier `src/character.ts` contient les plugins nécessaires :

Le fichier devrait déjà contenir :
- `@elizaos/plugin-sql` - Plugin SQL de base
- `@elizaos/plugin-openai` - Plugin OpenAI (si OPENAI_API_KEY est défini)
- `@elizaos/plugin-anthropic` - Plugin Anthropic (si ANTHROPIC_API_KEY est défini)
- `@elizaos/plugin-ollama` - Plugin Ollama (si OLLAMA_API_ENDPOINT est défini)
- `@elizaos/plugin-bootstrap` - Plugin Bootstrap (essentiel pour le fonctionnement)

**Vérification** : Le fichier `src/character.ts` charge automatiquement les plugins selon les variables d'environnement disponibles. Assurez-vous d'avoir au moins une clé API configurée.

## 🏗️ Étape 5 : Builder le projet

Avant de lancer l'agent, vous devez compiler le code TypeScript :

```bash
bun run build
```

Cette commande va :
1. Nettoyer le dossier `dist` précédent
2. Compiler le TypeScript en JavaScript
3. Générer les fichiers de déclaration TypeScript
4. Créer les fichiers nécessaires dans `dist/`

**Durée estimée** : 30 secondes à 1 minute.

**Résultat attendu** :
```
🚀 Building project...
📦 Bundling with Bun...
✓ Built X file(s) - X.XXMB
📝 Generating TypeScript declarations...
✓ TypeScript declarations generated
✅ Build complete! (X.XXs)
```

## 🚀 Étape 6 : Lancer l'agent

Vous avez **trois options** pour lancer l'agent :

### **Option A : Mode développement (recommandé pour le développement)**

Le mode développement offre le hot-reload (rechargement automatique) :

```bash
bun run dev
```

Cette commande utilise `elizaos dev` qui :
- Recompile automatiquement à chaque modification
- Redémarre le serveur automatiquement
- Idéal pour le développement actif

### **Option B : Mode production**

Pour un démarrage en mode production :

```bash
bun run start
```

Cette commande utilise `elizaos start` qui :
- Lance l'agent avec les fichiers compilés
- Ne recharge pas automatiquement (besoin de rebuild après modifications)
- Plus stable pour la production

### **Option C : Commande directe**

Si vous préférez être explicite :

```bash
bun run build && bunx elizaos start
```

## ✅ Étape 7 : Vérifier que l'agent fonctionne

### **Vérification dans les logs**

Après le lancement, vous devriez voir dans les logs :

```
✓ Project built successfully
Final plugins being loaded: {
  plugins: [ "openai", "@elizaos/plugin-sql", "internal-message-bus-connector", "@elizaos/plugin-bootstrap" ]
}
AgentServer is listening on port 3001
Started agent: FinanceBot
```

**Points importants** :
- ✅ Le port 3001 doit être mentionné (ou celui que vous avez configuré)
- ✅ Le plugin `@elizaos/plugin-bootstrap` doit être présent
- ✅ Le plugin OpenAI (ou autre) doit être chargé
- ✅ Le message "Started agent: FinanceBot" doit apparaître

### **Vérification dans le navigateur**

1. Ouvrez votre navigateur
2. Allez sur : **http://localhost:3001**
3. Vous devriez voir l'interface de chat de FinanceBot

### **Test du chat**

1. Dans l'interface web, envoyez un message : "Bonjour, pouvez-vous m'aider avec mes finances ?"
2. FinanceBot devrait répondre en quelques secondes avec une réponse pertinente sur les finances

## 🛑 Étape 8 : Arrêter l'agent

Pour arrêter l'agent, dans le terminal Git Bash :

**Appuyez sur `Ctrl+C`**

L'agent devrait s'arrêter proprement. Si cela ne fonctionne pas :

```bash
# Trouver le processus Bun
netstat -ano | grep :3001

# Utiliser cette commande Windows via cmd.exe (Git Bash)
cmd.exe //c "taskkill /F /IM bun.exe"
```

## 🔧 Dépannage

### **Problème : "bun n'est pas reconnu"**

**Cause** : Git Bash n'est pas en mode administrateur ou Bun n'est pas dans le PATH.

**Solution** :
1. Fermez Git Bash
2. Relancez-le **en tant qu'administrateur** (clic droit → Exécuter en tant qu'administrateur)
3. Réessayez les commandes

### **Problème : "No TEXT_EMBEDDING model registered"**

**Cause** : Le plugin OpenAI (ou autre) n'est pas chargé correctement.

**Solution** :
1. Vérifiez que votre clé API est correcte dans `.env`
2. Vérifiez que `OPENAI_API_KEY` (ou autre) est bien défini sans espaces
3. Vérifiez dans `src/character.ts` que les plugins sont bien listés
4. Relancez `bun run build` puis `bun run start`

### **Problème : "Port already in use"**

**Cause** : Le port 3001 est déjà utilisé par un autre processus.

**Solution** :
```bash
# Trouver le processus utilisant le port
netstat -ano | grep :3001

# Tuer le processus (remplacez <PID> par le numéro trouvé)
cmd.exe //c "taskkill /F /PID <PID>"

# OU changer le port dans .env
PORT=3002
```

### **Problème : "Agent ne répond pas aux messages"**

**Cause** : Le plugin Bootstrap n'est pas chargé.

**Solution** :
1. Vérifiez que `@elizaos/plugin-bootstrap` est dans `src/character.ts`
2. Vérifiez que `IGNORE_BOOTSTRAP` n'est pas défini dans `.env`
3. Rebuild et relancez : `bun run build && bun run start`

### **Problème : "Invalid API Key"**

**Cause** : La clé API est incorrecte ou expirée.

**Solution** :
1. Vérifiez votre clé API sur le site du fournisseur
2. Testez votre clé avec curl :
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```
3. Si erreur 401, créez une nouvelle clé API

## 📚 Commandes Utiles

### **Développement**
```bash
# Mode développement (hot reload)
bun run dev

# Build de production
bun run build

# Démarrer en production
bun run start
```

### **Tests**
```bash
# Lancer tous les tests
bun run test

# Tests unitaires uniquement
bun run test:component

# Tests E2E uniquement
bun run test:e2e

# Tests en mode watch
bun run test:watch
```

### **Qualité de code**
```bash
# Vérification TypeScript
bun run type-check

# Formatage du code
bun run format

# Vérification du formatage
bun run format:check

# Tout vérifier
bun run check-all
```

### **Nettoyage**
```bash
# Nettoyer et réinstaller
rm -rf node_modules bun.lock dist
bun install
bun run build
```

## 🎯 Configuration Recommandée

### **Configuration minimale fonctionnelle**

Pour que FinanceBot fonctionne correctement, vous avez besoin au minimum :

1. **Une clé API** : OpenAI, Anthropic, ou Ollama
2. **Le plugin Bootstrap** : Chargé automatiquement sauf si `IGNORE_BOOTSTRAP=true`
3. **Le plugin SQL** : Toujours chargé

### **Fichier `.env` minimal**

```env
OPENAI_API_KEY=sk-proj-VOTRE-CLE-ICI
NODE_ENV=development
PORT=3001
ELIZA_SERVER_PORT=3001
ELIZA_SERVER_HOST=localhost
ELIZA_SERVER_WEBSOCKET_ENABLED=true
```

## 🎓 Comprendre FinanceBot

### **Caractéristiques de FinanceBot**

FinanceBot est spécialisé dans :
- ✅ Conseils financiers et analyse d'investissements
- ✅ Planification budgétaire
- ✅ Analyse de marché et tendances économiques
- ✅ Planification de retraite et épargne
- ✅ Optimisation fiscale et réglementations
- ✅ Cryptomonnaies et investissements alternatifs
- ✅ Immobilier et stratégies d'investissement
- ✅ Gestion des risques et assurance
- ✅ Finance d'entreprise et entrepreneuriat
- ✅ Éducation financière

### **Personnalité**

FinanceBot maintient :
- Un ton professionnel et analytique
- Une précision avec les chiffres
- Une approche pédagogique pour expliquer les concepts complexes
- Des avertissements appropriés sur les risques financiers
- Des disclaimers légaux pour les conseils financiers

## 📞 Support

Si vous rencontrez des problèmes :

1. Consultez le [README principal](../../README.md)
2. Consultez les [guides de dépannage](../../docs/troubleshooting-agent-no-response.md)
3. Vérifiez les [logs de l'agent](../../logs_dev/)
4. Consultez la [documentation ElizaOS](https://elizaos.github.io/eliza/)

---

**🎉 Félicitations ! Votre Finance Agent est maintenant opérationnel !**

Vous pouvez maintenant interagir avec FinanceBot sur http://localhost:3001 et bénéficier de ses conseils financiers experts.

