# 🔧 Dépannage : L'agent ne répond pas aux messages

> **Guide de résolution** pour le problème courant où l'agent ElizaOS reçoit les messages mais ne génère aucune réponse

## 🎯 Symptômes

- ✅ L'interface web s'affiche correctement sur http://localhost:3000
- ✅ Les messages sont envoyés et apparaissent dans le chat
- ✅ L'indicateur "Agent is thinking..." s'affiche
- ❌ **Aucune réponse n'est générée par l'agent**
- ❌ Les logs montrent "MESSAGE_RECEIVED event" mais s'arrêtent là

## 📊 Logs typiques du problème

```
Info  [TestAgent] MessageBusService: All checks passed, proceeding to create agent memory and emit MESSAGE_RECEIVED event
Warn  #TestAgent  [AgentRuntime][TestAgent] No TEXT_EMBEDDING model registered. Skipping embedding dimension setup.
```

Puis... rien. Pas d'appel à l'API, pas de génération de réponse.

---

## ✅ Solution : Configuration correcte des plugins

### **Problème 1 : Plugin OpenAI manquant**

**Symptôme :**
```
Warn  #TestAgent  [AgentRuntime][TestAgent] No TEXT_EMBEDDING model registered.
```

**Solution :**

Ajoutez le plugin `@elizaos/plugin-openai` dans votre fichier `src/character.ts` :

```typescript
export const character: Character = {
  name: 'TestAgent',
  plugins: [
    '@elizaos/plugin-openai',  // ← REQUIS pour LLM + embedding
  ],
  settings: {
    model: 'gpt-4o-mini',
    modelProvider: 'openai',
  },
  // ... reste de la configuration
};
```

### **Problème 2 : Plugin Bootstrap manquant**

**Symptôme :**
```
Info  [TestAgent] MessageBusService: All checks passed, proceeding to create agent memory and emit MESSAGE_RECEIVED event
```
Puis rien ne se passe (pas de traitement du message).

**Solution :**

Ajoutez le plugin `@elizaos/plugin-bootstrap` qui contient les handlers de messages :

```typescript
export const character: Character = {
  name: 'TestAgent',
  plugins: [
    '@elizaos/plugin-openai',      // Fournit LLM + embedding
    '@elizaos/plugin-bootstrap',   // ← REQUIS pour traiter les messages
  ],
  // ... reste de la configuration
};
```

### **Problème 3 : Version de Zod incompatible**

**Symptôme :**
```
Error  Auto-install attempted for @elizaos/plugin-openai but import still failed:
       Cannot find module 'zod/v4'
```

**Solution :**

Mettez à jour `zod` vers la version 4 dans `package.json` :

```json
{
  "dependencies": {
    "zod": "^4.0.0"  // ← Changer de 3.24.2 vers 4.0.0
  }
}
```

Puis réinstallez :

```bash
cd /c/cursor-projects/eliza/test-agent
rm -rf node_modules bun.lock
bun install
bun run build
bunx elizaos start
```

---

## 🎯 Configuration finale fonctionnelle

### **src/character.ts**

```typescript
import { type Character } from '@elizaos/core';

export const character: Character = {
  name: 'TestAgent',
  plugins: [
    '@elizaos/plugin-openai',      // Fournit LLM + embedding
    '@elizaos/plugin-bootstrap',   // Traite les messages
  ],
  settings: {
    secrets: {},
    avatar: 'https://elizaos.github.io/eliza-avatars/Eliza/portrait.png',
    model: 'gpt-4o-mini',
    modelProvider: 'openai',
  },
  system: 'Respond to all messages in a helpful, conversational manner.',
  bio: [
    'Engages with all types of questions and conversations',
    'Provides helpful, concise responses',
  ],
  topics: [
    'general knowledge and information',
    'problem solving and troubleshooting',
  ],
  messageExamples: [
    // Vos exemples ici
  ],
  style: {
    all: [
      'Keep responses concise but informative',
      'Use clear and direct language',
    ],
    chat: [
      'Be conversational and natural',
    ],
  },
};
```

### **.env**

```env
# Clé API OpenAI (REQUIS)
OPENAI_API_KEY=sk-proj-votre-cle-ici

# Configuration serveur
NODE_ENV=development
PORT=3000
ELIZA_SERVER_PORT=3000
ELIZA_SERVER_HOST=localhost
ELIZA_SERVER_CORS_ORIGIN=http://localhost:3000

# Configuration WebSocket
ELIZA_SERVER_WEBSOCKET_ENABLED=true
ELIZA_SERVER_WEBSOCKET_PATH=/socket.io/

# Optimisations
IGNORE_BOOTSTRAP=true
ELIZA_DISABLE_UPDATE_CHECK=true
```

### **package.json**

```json
{
  "dependencies": {
    "@elizaos/cli": "1.6.1",
    "@elizaos/core": "1.6.1",
    "@elizaos/plugin-bootstrap": "1.6.1",
    "@elizaos/plugin-openai": "^1.5.15",
    "@elizaos/plugin-sql": "1.6.1",
    "@elizaos/server": "1.6.1",
    "zod": "^4.0.0"
  }
}
```

---

## 🔍 Vérification de la configuration

### **1. Tester la clé OpenAI**

```bash
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d '{
    "model": "gpt-4o-mini",
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'
```

Réponse attendue :
```json
{
  "choices": [{
    "message": {
      "content": "Hello! How can I assist you today?"
    }
  }]
}
```

### **2. Vérifier les logs au démarrage**

Logs attendus après `bunx elizaos start` :

```
✓ Project built successfully
Final plugins being loaded: {
  plugins: [ "openai", "@elizaos/plugin-sql", "internal-message-bus-connector" ]
}
AgentServer is listening on port 3000
Started agent: TestAgent (6a979d09-1ed2-0632-8092-624ba27761eb)
```

✅ **Bon signe** : Le plugin "openai" est dans la liste
❌ **Problème** : Pas de plugin "openai" → Vérifier character.ts

### **3. Vérifier qu'il n'y a pas d'erreur TEXT_EMBEDDING**

❌ **Si vous voyez :**
```
Warn  #TestAgent  [AgentRuntime][TestAgent] No TEXT_EMBEDDING model registered.
```

→ Le plugin OpenAI n'est pas chargé correctement. Retournez à l'étape 1.

✅ **Logs corrects :**
```
Info  Started agent: TestAgent
Info  All agent init functions completed
```
Sans warning sur TEXT_EMBEDDING.

---

## 🚀 Procédure complète de redémarrage

```bash
# 1. Arrêter tous les processus
taskkill //F //IM bun.exe
pm2 kill

# 2. Nettoyer et réinstaller
cd /c/cursor-projects/eliza/test-agent
rm -rf node_modules bun.lock
bun install

# 3. Rebuild
bun run build

# 4. Redémarrer
bunx elizaos start
```

---

## ✅ Test final

1. Ouvrez http://localhost:3000
2. Envoyez un message : **"Hello, can you hear me?"**
3. L'agent devrait répondre en quelques secondes

**Si ça ne fonctionne toujours pas**, vérifiez dans l'ordre :
1. La clé OpenAI est valide (testez avec curl)
2. Les plugins sont bien dans character.ts
3. Zod est en version 4.x
4. Les logs ne montrent pas d'erreur zod/v4
5. Le plugin "openai" apparaît dans "Final plugins being loaded"

---

## 📚 Ressources

- [Documentation ElizaOS officielle](https://docs.elizaos.ai/)
- [Guide de démarrage rapide](https://docs.elizaos.ai/quickstart)
- [Configuration des plugins](https://docs.elizaos.ai/plugins)

---

**✨ Une fois que ça marche, vous pouvez personnaliser votre agent en modifiant `src/character.ts` !**
