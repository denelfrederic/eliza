# 📋 Configuration du Modèle LLM dans ElizaOS

## Vue d'ensemble

ElizaOS utilise une hiérarchie de configuration pour déterminer quel modèle LLM utiliser. Cette hiérarchie peut expliquer pourquoi vous voyez `gpt-5-nano` et `gpt-5-mini` dans les logs alors que votre configuration spécifie `gpt-4o-mini`.

---

## 🔄 Hiérarchie de Configuration (Priorité décroissante)

### 1. **Variables d'Environnement** (Priorité la plus haute)
```bash
# Dans votre fichier .env ou variables système
OPENAI_MODEL=gpt-4o-mini          # Modèle principal
OPENAI_MODEL_SMALL=gpt-4o-mini    # Pour TEXT_SMALL (si spécifique)
OPENAI_MODEL_LARGE=gpt-4o-mini    # Pour TEXT_LARGE (si spécifique)
```

**Où vérifier** :
- Fichier `.env` à la racine du projet
- Variables d'environnement système
- Docker Compose (section `environment`)

### 2. **Configuration du Character** (`src/character.ts`)
```typescript
export const character: Character = {
  settings: {
    model: 'gpt-4o-mini',              // Modèle principal
    modelProvider: 'openai',           // Fournisseur (obligatoire)
    embeddingModel: 'text-embedding-3-small',  // Pour les embeddings
  },
}
```

**Localisation** : `finance-agent/src/character.ts` (lignes 43-48)

### 3. **Configuration du Plugin** (`src/plugin.ts`)
```typescript
const plugin: Plugin = {
  models: {
    [ModelType.TEXT_SMALL]: async (_runtime, { prompt }) => {
      // Modèle personnalisé pour TEXT_SMALL
      // Si non défini, utilise le modèle du character
    },
    [ModelType.TEXT_LARGE]: async (_runtime, { prompt }) => {
      // Modèle personnalisé pour TEXT_LARGE
    },
  },
}
```

**Localisation** : `finance-agent/src/plugin.ts` (lignes 1227-1239)

**Note** : Actuellement, les modèles du plugin retournent des réponses mockées et ne sont pas utilisés pour les vraies générations.

### 4. **Configuration par Défaut d'ElizaOS**
ElizaOS peut avoir des modèles par défaut selon le contexte :
- **Titres de conversation** : Peut utiliser `gpt-5-nano` (modèle spécifique pour tâches courtes)
- **Génération de dialogue** : Peut utiliser `gpt-5-mini` (modèle spécifique pour tâches moyennes)
- **Réponses principales** : Utilise votre configuration

**Source** : Plugin `@elizaos/plugin-bootstrap` ou autres plugins système

---

## 🔍 Pourquoi Plusieurs Modèles ?

### Modèles Spécialisés par Tâche

ElizaOS peut utiliser différents modèles selon le type de tâche :

1. **Titres de Conversation** (`gpt-5-nano`)
   - Tâche : Générer un titre court
   - Modèle : Léger et rapide
   - Coût : Très faible
   - Source : Plugin bootstrap ou interface web

2. **Génération de Dialogue** (`gpt-5-mini`)
   - Tâche : Générer des exemples de dialogue
   - Modèle : Léger mais plus performant que nano
   - Coût : Faible
   - Source : Plugin bootstrap ou initialisation

3. **Réponses Principales** (`gpt-4o-mini` de votre config)
   - Tâche : Répondre aux messages utilisateur
   - Modèle : Votre configuration
   - Coût : Normal
   - Source : Votre `character.ts`

---

## 📍 Où Vérifier la Configuration Actuelle

### 1. Vérifier les Variables d'Environnement

```bash
# Dans le terminal
cd finance-agent
cat .env | grep OPENAI_MODEL

# Ou via PowerShell
Get-Content .env | Select-String "OPENAI"
```

### 2. Vérifier la Configuration du Character

```typescript
// Fichier: src/character.ts
settings: {
  model: 'gpt-4o-mini',  // ← Votre modèle configuré
  modelProvider: 'openai',
}
```

### 3. Vérifier la Configuration du Plugin

```typescript
// Fichier: src/plugin.ts
// Lignes 245, 706, 897 : Utilisation de process.env.OPENAI_MODEL
const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';
```

### 4. Vérifier Docker Compose (si utilisé)

```yaml
# Fichier: docker-compose.yaml
environment:
  - OPENAI_MODEL=gpt-4o-mini  # ← Vérifier ici
```

---

## ⚙️ Comment Forcer un Modèle Unique

### Option 1 : Variable d'Environnement Globale

Ajoutez dans votre `.env` :
```bash
# Forcer le modèle pour toutes les tâches
OPENAI_MODEL=gpt-4o-mini
OPENAI_MODEL_SMALL=gpt-4o-mini
OPENAI_MODEL_LARGE=gpt-4o-mini

# Si ces variables existent dans ElizaOS
DISABLE_AUTO_TITLE_GENERATION=true  # Désactiver génération auto de titres
```

### Option 2 : Modifier le Plugin Bootstrap

Le plugin `@elizaos/plugin-bootstrap` peut être configuré. Vérifiez s'il accepte des options de modèle.

### Option 3 : Désactiver les Fonctionnalités Automatiques

```bash
# Dans .env
IGNORE_BOOTSTRAP=true  # Désactive le plugin bootstrap (peut casser d'autres fonctionnalités)
```

---

## 🐛 Diagnostic : Modèles Dans les Logs

Si vous voyez `gpt-5-nano` ou `gpt-5-mini` dans les logs :

### 1. C'est Normal Pour :
- ✅ Génération automatique de titres de conversation
- ✅ Génération d'exemples de dialogue au démarrage
- ✅ Tâches système non critiques

### 2. C'est Anormal Pour :
- ❌ Réponses aux messages utilisateur (devrait être `gpt-4o-mini`)
- ❌ Génération de contenu dans vos actions (devrait être `gpt-4o-mini`)

### 3. Pour Vérifier :

Dans les logs, recherchez :
```bash
# Rechercher les appels avec votre modèle
grep "gpt-4o-mini" logs.txt

# Rechercher les appels avec d'autres modèles
grep "gpt-5" logs.txt
```

---

## 💡 Recommandations

### Pour Réduire les Coûts

1. **Garder `gpt-4o-mini` comme modèle principal** ✅ (déjà fait)
2. **Accepter les modèles légers pour les tâches système** (génération de titres) ✅
3. **Intercepter tous les appels** pour voir réellement ce qui est utilisé ✅ (fait dans ce document)

### Pour Uniformiser les Modèles

Si vous voulez forcer `gpt-4o-mini` partout :

1. Vérifiez que `OPENAI_MODEL=gpt-4o-mini` est dans votre `.env`
2. Vérifiez que `character.ts` spécifie bien `model: 'gpt-4o-mini'`
3. Notez que certains appels système peuvent toujours utiliser des modèles spécifiques

---

## 📊 Tracking des Modèles Utilisés

Le système de tracking que nous avons implémenté capture maintenant tous les appels via l'événement `RESPONSE_GENERATED`. Vous pouvez voir quels modèles sont réellement utilisés via :

```bash
# Dans le chat
Montre-moi les stats API

# Ou via l'API
curl http://localhost:3000/api/stats | jq '.stats'
```

---

## 🔗 Fichiers de Configuration

| Fichier | Description | Ligne |
|---------|-------------|-------|
| `src/character.ts` | Configuration principale du modèle | 46 |
| `src/plugin.ts` | Usage du modèle dans les actions | 245, 706, 897 |
| `.env` | Variables d'environnement | (à vérifier) |
| `docker-compose.yaml` | Configuration Docker | (si utilisé) |

---

## 📝 Notes Importantes

1. **Les modèles `gpt-5-*`** dans les logs peuvent être des noms internes d'ElizaOS qui correspondent en réalité à `gpt-4o-mini` selon votre configuration
2. **Les appels automatiques** (titres, dialogue) sont normaux et représentent une faible consommation
3. **Le tracking global** capture maintenant tous les appels, vous verrez exactement ce qui est utilisé

---

**Dernière mise à jour** : Décembre 2024  
**Version** : 1.0.0

