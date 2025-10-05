# ELIZA OS

Un agent IA autonome basé sur le framework ElizaOS, développé avec TypeScript, React et Bun.

## 🚀 Fonctionnalités

- **Agent IA intelligent** : Conversation naturelle avec l'utilisateur
- **Plugins modulaires** : Anthropic, OpenAI, Ollama, SQL
- **Interface web moderne** : Frontend React avec Tailwind CSS
- **Tests complets** : Tests unitaires et E2E avec Cypress
- **Architecture flexible** : TypeScript, Vite, configuration modulaire

## 🛠️ Pile technique

- **Runtime** : Bun (avec support Node.js)
- **Langage** : TypeScript
- **Frontend** : React 18, Tailwind CSS
- **Build** : Vite
- **Tests** : Cypress, Jest
- **Base de données** : PostgreSQL (SQLite en développement)

## 📁 Structure du projet

```
eliza/
├── test-agent/           # Agent de développement/test
├── finance-agent/        # Agent financier spécialisé
├── support-agent/        # Agent support client
├── docs/                # Documentation
└── .gitignore          # Configuration Git

# Chaque agent contient :
│   ├── src/             # Code source TypeScript
│   ├── src/frontend/    # Interface React
│   ├── src/__tests__/   # Tests Cypress
│   ├── package.json     # Dépendances
│   └── .env.example     # Variables d'environnement
```

## ⚡ Prérequis

- [Bun](https://bun.sh) (recommandé) ou Node.js 18+
- Git
- **Git Bash en mode administrateur** (recommandé pour éviter les problèmes de PATH)
- Clé API OpenAI ou Anthropic

## 🚀 Installation locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/denelfrederic/eliza.git
   cd eliza
   ```

2. **Choisir un agent**
   ```bash
   # Agent de développement/test
   cd test-agent
   
   # Agent financier spécialisé
   cd finance-agent
   
   # Agent support client
   cd support-agent
   ```

3. **Installer les dépendances**
   ```bash
   bun install
   ```

4. **Configuration**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos clés API
   ```

5. **Lancer en développement avec Git Bash**

   **⚠️ Important : Utilisez Git Bash en mode administrateur**

   ```bash
   cd test-agent

   # Méthode 1 : Script automatisé (Recommandé)
   ./start.sh

   # Méthode 2 : Démarrage direct
   bun run build && bunx elizaos start

   # Méthode 3 : Mode développement (hot reload)
   bunx elizaos dev

   # Pour arrêter : Ctrl+C (fonctionne directement !)
   ```

## 🔄 Gestion Multi-Agents

### **Développement Multi-Agents**

Ce projet supporte le développement de plusieurs agents spécialisés avec déploiement isolé :

```
eliza/
├── test-agent/          # Agent de développement/test (Port 3000)
├── finance-agent/       # Agent financier (Port 3001)  
├── support-agent/       # Agent support client (Port 3002)
└── docs/               # Documentation complète
```

### **Démarrage Isolé par Agent (Git Bash)**

**⚠️ Utilisez Git Bash en mode administrateur**

Chaque agent se lance indépendamment dans un terminal Git Bash séparé :

```bash
# Terminal 1 : Agent de test (port 3000)
cd /c/cursor-projects/eliza/test-agent
./start.sh

# Terminal 2 : Agent financier (port 3001)
cd /c/cursor-projects/eliza/finance-agent
PORT=3001 ./start.sh

# Terminal 3 : Agent support (port 3002)
cd /c/cursor-projects/eliza/support-agent
PORT=3002 ./start.sh
```

**Arrêt :** `Ctrl+C` dans chaque terminal respectif

### **Déploiement Isolé**

Chaque agent peut être déployé indépendamment :

- **Ports différents** : 3000, 3001, 3002... (configurés via `.env`)
- **Configurations séparées** : Chaque agent a son propre `src/character.ts`
- **Environnements isolés** : Variables d'environnement spécifiques dans chaque `.env`
- **Développement simple** : Un terminal Git Bash par agent

## 🤖 Agents spécialisés

### **test-agent** - Agent de développement
- **Rôle** : Développement, tests, et expérimentation
- **Personnalité** : Polyvalent et adaptable
- **Usage** : Tests de nouvelles fonctionnalités, développement

### **finance-agent** - Agent financier
- **Rôle** : Conseils financiers, analyse d'investissements, planification budgétaire
- **Personnalité** : Professionnel, analytique, précis avec les chiffres
- **Usage** : Assistance financière, conseils d'investissement, éducation financière

### **support-agent** - Agent support client
- **Rôle** : Assistance technique, résolution de problèmes, support client
- **Personnalité** : Patient, empathique, orienté solutions
- **Usage** : Support client, assistance technique, formation utilisateurs

## 🔧 Configuration

Variables d'environnement essentielles dans `.env` :

```env
# API Keys (au moins une requise)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Base de données
DATABASE_URL=postgresql://user:pass@localhost:5432/eliza

# Port (optionnel)
PORT=3000
```

## 📋 Commandes utiles

```bash
# Développement
bun run dev              # Mode développement
bun run build           # Build de production
bun run start           # Démarrer l'agent

# Tests
bun run test            # Tests unitaires
bun run cy:open         # Tests Cypress (interface)
bun run cy:run          # Tests Cypress (CLI)

# Qualité de code
bun run type-check      # Vérification TypeScript
bun run format          # Formatage Prettier
bun run lint            # Linting
```

## 📚 Documentation

### **🚀 Démarrage rapide**
- **[⚡ Configuration Rapide](docs/quick-setup.md)** - Lancez votre premier agent en 5 minutes

### **📖 Guides complets**
- **[Guide de Déploiement](docs/deploiement.md)** - Déploiement en production
- **[Guide Démarrage/Arrêt](docs/demarrage-arret.md)** - Gestion des agents
- **[Architecture Multi-Agents](docs/architecture-multi-agents.md)** - Organisation du projet
- **[Guide Git Bash](docs/git-bash-guide.md)** - Utilisation de Git Bash en mode administrateur

### **🔧 Dépannage**
- **[Agent ne répond pas](docs/troubleshooting-agent-no-response.md)** - Solution complète au problème de non-réponse

## 🚀 Déploiement

Pour déployer en production, consultez le [Guide de déploiement](docs/deploiement.md).

## 🔧 Dépannage

### Erreurs courantes

**"Ctrl+C ne fonctionne pas pour arrêter le serveur"**
- **Cause** : Configuration PM2 avec `autorestart: true`
- **Solution** : Utiliser la configuration corrigée dans `ecosystem.config.js`
- **Alternative** : Démarrage direct avec `bunx elizaos start`

**"Too many active changes" (Git)**
- Solution : Le `.gitignore` est configuré pour ignorer `node_modules/`

**"API key missing"**
- Vérifiez que votre clé API est correctement définie dans `.env`

**"Port already in use"**
- Changez le port dans `.env` ou arrêtez le processus qui utilise le port

**"Agent reste en 'thinking' sans répondre"**
- **Solution complète** : Consultez le [Guide de dépannage détaillé](docs/troubleshooting-agent-no-response.md)
- Vérifiez que les plugins `@elizaos/plugin-openai` et `@elizaos/plugin-bootstrap` sont dans `character.ts`
- Vérifiez que `zod` est en version 4.x dans `package.json`
- Utilisez `modelProvider: 'openai'` dans `character.ts`

### Scripts de diagnostic

```powershell
# Diagnostic complet
.\diagnostic.ps1

# Test de la configuration PM2
.\test-ctrl-c.ps1

# Gestion multi-agents
.\manage-agents.ps1 -Action status -Agent all
```

## 📄 Licence

Ce projet utilise le framework [ElizaOS](https://github.com/elizaos/eliza) sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Dépôt** : [denelfrederic/eliza](https://github.com/denelfrederic/eliza)
