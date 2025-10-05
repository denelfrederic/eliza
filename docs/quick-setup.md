# ⚡ Guide de Configuration Rapide - ElizaOS

> **Guide express** pour configurer et lancer votre premier agent ElizaOS en 5 minutes

## 📋 Checklist de prérequis

- [ ] **Bun installé** : `bun --version` devrait afficher une version
- [ ] **Git Bash en mode administrateur** ouvert
- [ ] **Clé API OpenAI** obtenue sur https://platform.openai.com/api-keys
- [ ] **Dépôt cloné** : `git clone https://github.com/denelfrederic/eliza.git`

## 🚀 Configuration en 5 étapes

### **1️⃣ Naviguer vers l'agent**

```bash
cd /c/cursor-projects/eliza/test-agent
```

### **2️⃣ Installer les dépendances**

```bash
bun install
```

### **3️⃣ Configurer l'environnement**

Créez le fichier `.env` :

```bash
cp .env.example .env
```

Éditez `.env` et ajoutez votre clé OpenAI :

```env
OPENAI_API_KEY=sk-proj-VOTRE-CLE-ICI
NODE_ENV=development
PORT=3000
```

### **4️⃣ Vérifier la configuration du character**

Ouvrez `src/character.ts` et vérifiez que ces plugins sont présents :

```typescript
export const character: Character = {
  name: 'TestAgent',
  plugins: [
    '@elizaos/plugin-openai',      // ← REQUIS
    '@elizaos/plugin-bootstrap',   // ← REQUIS
  ],
  settings: {
    model: 'gpt-4o-mini',
    modelProvider: 'openai',
  },
  // ... reste de la configuration
};
```

### **5️⃣ Lancer l'agent avec Git Bash**

**⚠️ Important : Utilisez Git Bash en mode administrateur**

```bash
# Méthode 1 : Avec le script (recommandé)
./start.sh

# Méthode 2 : Commande directe
bun run build && bunx elizaos start

# Méthode 3 : Mode développement (hot reload)
bunx elizaos dev
```

✅ **Accédez à http://localhost:3000**

✅ **Pour arrêter : Ctrl+C** (fonctionne directement avec Git Bash)

---

## ✅ Vérification rapide

### **Les logs doivent afficher :**

```
✓ Project built successfully
Final plugins being loaded: {
  plugins: [ "openai", "@elizaos/plugin-sql", "internal-message-bus-connector" ]
}
AgentServer is listening on port 3000
Started agent: TestAgent
```

### **Test du chat :**

1. Allez sur http://localhost:3000
2. Envoyez : "Hello"
3. L'agent doit répondre en quelques secondes

---

## ❌ Problèmes courants

### **"No TEXT_EMBEDDING model registered"**

→ Le plugin OpenAI n'est pas chargé. Vérifiez `src/character.ts` :

```typescript
plugins: [
  '@elizaos/plugin-openai',  // ← Doit être présent
]
```

### **"Cannot find module 'zod/v4'"**

→ Mettez à jour zod dans `package.json` :

```json
"zod": "^4.0.0"
```

Puis :

```bash
rm -rf node_modules bun.lock
bun install
bun run build
```

### **"Agent ne répond pas aux messages"**

→ Il manque le plugin Bootstrap. Vérifiez `src/character.ts` :

```typescript
plugins: [
  '@elizaos/plugin-openai',
  '@elizaos/plugin-bootstrap',  // ← Doit être présent
]
```

### **"Invalid API Key"**

→ Testez votre clé OpenAI :

```bash
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

Si erreur 401, la clé est invalide. Créez-en une nouvelle sur https://platform.openai.com/api-keys

---

## 🎯 Configuration minimale fonctionnelle

### **package.json**

```json
{
  "dependencies": {
    "@elizaos/plugin-openai": "^1.5.15",
    "@elizaos/plugin-bootstrap": "1.6.1",
    "@elizaos/plugin-sql": "1.6.1",
    "@elizaos/core": "1.6.1",
    "@elizaos/server": "1.6.1",
    "zod": "^4.0.0"
  }
}
```

### **src/character.ts**

```typescript
import { type Character } from '@elizaos/core';

export const character: Character = {
  name: 'TestAgent',
  plugins: [
    '@elizaos/plugin-openai',
    '@elizaos/plugin-bootstrap',
  ],
  settings: {
    model: 'gpt-4o-mini',
    modelProvider: 'openai',
  },
  system: 'You are a helpful AI assistant.',
  bio: ['Helpful', 'Friendly', 'Knowledgeable'],
  topics: ['general knowledge', 'technology'],
  messageExamples: [],
  style: {
    all: ['Be concise', 'Be helpful'],
    chat: ['Be conversational'],
  },
};
```

### **.env**

```env
OPENAI_API_KEY=sk-proj-VOTRE-CLE-ICI
NODE_ENV=development
PORT=3000
ELIZA_SERVER_PORT=3000
ELIZA_SERVER_HOST=localhost
ELIZA_SERVER_WEBSOCKET_ENABLED=true
```

---

## 🔄 Commandes utiles (Git Bash)

```bash
# Démarrer l'agent (méthode recommandée)
./start.sh

# Démarrage direct
bun run build && bunx elizaos start

# Mode développement (hot reload)
bunx elizaos dev

# Arrêter l'agent
Ctrl+C  # ← Simple et efficace !

# En dernier recours si Ctrl+C ne fonctionne pas
taskkill //F //IM bun.exe

# Nettoyer et réinstaller
rm -rf node_modules bun.lock
bun install
bun run build
```

---

## 📚 Pour aller plus loin

- **[Guide complet de dépannage](troubleshooting-agent-no-response.md)** - Résoudre les problèmes
- **[Guide de démarrage/arrêt](demarrage-arret.md)** - Gestion avancée des agents
- **[Architecture multi-agents](architecture-multi-agents.md)** - Déployer plusieurs agents

---

**🎉 Félicitations ! Votre agent ElizaOS est configuré et fonctionnel !**
