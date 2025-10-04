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
├── test-agent/           # Agent principal
│   ├── src/             # Code source TypeScript
│   ├── src/frontend/    # Interface React
│   ├── src/__tests__/   # Tests Cypress
│   ├── package.json     # Dépendances
│   └── .env.example     # Variables d'environnement
├── docs/                # Documentation
└── .gitignore          # Configuration Git
```

## ⚡ Prérequis

- [Bun](https://bun.sh) (recommandé) ou Node.js 18+
- Git
- Clé API OpenAI ou Anthropic

## 🚀 Installation locale

1. **Cloner le projet**
   ```bash
   git clone https://github.com/denelfrederic/eliza.git
   cd eliza/test-agent
   ```

2. **Installer les dépendances**
   ```bash
   bun install
   ```

3. **Configuration**
   ```bash
   cp .env.example .env
   # Éditer .env avec vos clés API
   ```

4. **Lancer en développement**
   ```bash
   bun run dev
   ```

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

## 🚀 Déploiement

Pour déployer en production, consultez le [Guide de déploiement](docs/deploiement.md).

## 🔧 Dépannage

### Erreurs courantes

**"Too many active changes" (Git)**
- Solution : Le `.gitignore` est configuré pour ignorer `node_modules/`

**"API key missing"**
- Vérifiez que votre clé API est correctement définie dans `.env`

**"Port already in use"**
- Changez le port dans `.env` ou arrêtez le processus qui utilise le port

## 📄 Licence

Ce projet utilise le framework [ElizaOS](https://github.com/elizaos/eliza) sous licence MIT.

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou une pull request.

---

**Dépôt** : [denelfrederic/eliza](https://github.com/denelfrederic/eliza)
