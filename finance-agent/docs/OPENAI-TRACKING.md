# 📊 Système de Tracking OpenAI - Guide Complet

## Vue d'ensemble

Le système de tracking OpenAI permet de surveiller et d'optimiser l'utilisation de l'API OpenAI dans l'agent Finance. Il comptabilise automatiquement les appels, les tokens consommés, et estime les coûts en temps réel.

## 🎯 Fonctionnalités

### Tracking automatique
- ✅ Comptage des appels API (par modèle)
- ✅ Suivi des tokens prompt et completion
- ✅ Estimation des coûts en USD
- ✅ Détection d'erreurs API
- ✅ Statistiques de session

### Affichage intégré
- ✅ Résumé compact dans chaque réponse de l'agent
- ✅ Commande dédiée pour voir les stats détaillées
- ✅ Endpoint API REST pour monitoring externe
- ✅ Recommandations d'optimisation automatiques

## 🚀 Utilisation

### Dans le chat avec l'agent

#### Voir les statistiques complètes
```
Montre-moi les stats API
```
ou
```
Combien de tokens j'ai consommé ?
```

L'agent affichera :
```
📊 **Statistiques d'utilisation OpenAI**

⏱️ Durée de la session : 15 minutes

**gpt-4o-mini**
├─ Appels : 8
├─ Tokens prompt : 3,245
├─ Tokens completion : 1,892
├─ Total tokens : 5,137
├─ Erreurs : 0
└─ Coût estimé : $0.001254

**text-embedding-3-small**
├─ Appels : 12
├─ Tokens prompt : 450
├─ Tokens completion : 0
├─ Total tokens : 450
├─ Erreurs : 0
└─ Coût estimé : $0.000009

**📈 Totaux de la session**
├─ Appels totaux : 20
├─ Tokens totaux : 5,587
└─ Coût total estimé : $0.001263
```

#### Résumé automatique
Chaque réponse de l'agent inclut automatiquement un résumé compact :
```
---
💡 **Session actuelle** : 8 appels | 5,137 tokens | ~$0.0013
```

### Via l'API REST

#### Obtenir les statistiques
```bash
curl http://localhost:3000/api/stats
```

Réponse :
```json
{
  "success": true,
  "timestamp": 1730311234567,
  "stats": {
    "gpt-4o-mini": {
      "totalCalls": 8,
      "totalPromptTokens": 3245,
      "totalCompletionTokens": 1892,
      "totalTokens": 5137,
      "estimatedCost": 0.001254,
      "lastCallTimestamp": 1730311234000,
      "errorCount": 0
    }
  },
  "threshold": null,
  "recommendations": [],
  "report": "..."
}
```

#### Réinitialiser les statistiques
```bash
curl -X POST http://localhost:3000/api/stats/reset
```

## 🔧 Architecture Technique

### Services créés

#### 1. `OpenAITrackerService`
**Localisation** : `src/services/openai-tracker.service.ts`

**Responsabilités** :
- Stockage des statistiques en mémoire
- Calcul des coûts estimés
- Génération de rapports
- Vérification de seuils d'alerte

**Méthodes principales** :
```typescript
trackCall(modelName, promptTokens, completionTokens, isError)
getAllStats()
generateReport()
generateCompactSummary()
checkThresholds()
resetStats()
```

#### 2. `OpenAIInterceptorService`
**Localisation** : `src/services/openai-interceptor.service.ts`

**Responsabilités** :
- Interception des appels de génération
- Estimation des tokens si non fournis
- Tracking automatique via le tracker
- Génération de recommandations d'optimisation

**Méthodes principales** :
```typescript
estimateTokens(text)
trackGeneration(modelName, prompt, response, actualTokens?)
trackError(modelName, error)
generateOptimizationRecommendations()
```

### Action ajoutée

#### `SHOW_API_STATS`
**Localisation** : `src/plugin.ts` (ligne ~911)

**Déclencheurs** :
- "montre-moi les stats API"
- "combien de tokens"
- "API usage"
- "consommation"

**Comportement** :
1. Récupère les statistiques du tracker
2. Génère un rapport complet
3. Vérifie les seuils d'alerte
4. Ajoute des recommandations si nécessaire

### Routes API ajoutées

#### `GET /api/stats`
Récupère les statistiques complètes en JSON

#### `POST /api/stats/reset`
Réinitialise toutes les statistiques

## 💰 Tarification OpenAI (Octobre 2024)

### Modèles de génération

| Modèle | Prompt ($/1M tokens) | Completion ($/1M tokens) |
|--------|---------------------|-------------------------|
| gpt-4o-mini | $0.15 | $0.60 |
| gpt-4o | $2.50 | $10.00 |
| gpt-4-turbo | $10.00 | $30.00 |

### Modèles d'embedding

| Modèle | Prix ($/1M tokens) |
|--------|-------------------|
| text-embedding-3-small | $0.02 |
| text-embedding-3-large | $0.13 |

## 🎨 Optimisations appliquées

### 1. Réduction du prompt système (~70% de tokens économisés)

**Avant** (1,200 tokens) :
```
You are a specialized cryptocurrency portfolio surveillance agent...
[32 lignes de texte détaillé]
```

**Après** (380 tokens) :
```
Agent de surveillance crypto READ-ONLY. Aucune transaction exécutée.

RÈGLES:
- Mode lecture seule (adresses publiques uniquement)
- Actions: SURVEILLANCE_PORTEFEUILLE | PROPOSER_REBALANCING | SHOW_API_STATS
- Wallet auto-configuré via EVM_PUBLIC_KEY

RÉPONSES:
- Précis avec chiffres/pourcentages
- Professionnel et informatif
- Rappeler que c'est conseil uniquement
```

**Impact** :
- 820 tokens économisés **par appel**
- Sur 100 appels : 82,000 tokens économisés
- Économie estimée : ~$0.012 pour 100 appels

### 2. Tracking automatique

Le système détecte automatiquement les patterns de surutilisation :

**Alertes automatiques** :
- ⚠️ Plus de 100 appels dans une session
- 💰 Coût dépassant $1.00
- 🔧 Moyenne de tokens élevée (>2000 par appel)

**Recommandations générées** :
```
🔧 Le modèle gpt-4o-mini utilise 2,450 tokens par appel en moyenne. 
   Considérez réduire la longueur du prompt système.

💰 Coût moyen de $0.0125 par appel pour gpt-4o-mini. 
   Envisagez un modèle moins cher comme gpt-3.5-turbo.

⚠️ 15 erreurs détectées avec gpt-4o-mini. 
   Vérifiez votre clé API et les limites de rate limit.
```

## 📈 Métriques de performance

### Scénario typique : Consultation de portfolio

**Sans optimisations** :
- Appels par consultation : ~4-6 (décision d'action + génération de réponse + embeddings)
- Tokens moyens par appel : ~1,800
- Coût par consultation : ~$0.0025

**Avec optimisations** :
- Appels par consultation : ~4-6 (identique)
- Tokens moyens par appel : ~900
- Coût par consultation : ~$0.0012

**Économie** : ~52% de réduction de coût

## 🛠️ Configuration avancée

### Modifier les seuils d'alerte

Éditez `src/services/openai-tracker.service.ts` :

```typescript
// Ligne ~200
if (totalCalls > 100) {  // Modifier le seuil ici
  return {
    alert: true,
    message: `⚠️ Alerte : ${totalCalls} appels API...`
  };
}
```

### Ajouter des tarifs personnalisés

Si vous utilisez des modèles différents, ajoutez-les dans `OPENAI_PRICING` :

```typescript
const OPENAI_PRICING: Record<string, { prompt: number; completion: number }> = {
  'votre-modele': {
    prompt: 0.001 / 1000,     // Prix par token
    completion: 0.002 / 1000,
  },
  // ... autres modèles
};
```

### Désactiver le résumé automatique

Commentez l'ajout du résumé dans les actions (lignes ~241, ~681, ~853 de `plugin.ts`) :

```typescript
// Désactiver le résumé compact
/*
try {
  const { openaiTracker } = await import('./services/openai-tracker.service');
  const compactSummary = openaiTracker.generateCompactSummary();
  if (compactSummary) {
    portfolioText += compactSummary;
  }
} catch (err) {
  logger.warn('Could not fetch API stats:', err);
}
*/
```

## 🧪 Tests et validation

### Tester le tracking

1. Démarrer l'agent :
```bash
cd finance-agent
bun run dev
```

2. Faire quelques requêtes dans le chat

3. Consulter les statistiques :
```
Montre-moi les stats API
```

4. Vérifier via l'API :
```bash
curl http://localhost:3000/api/stats | jq
```

### Réinitialiser pour un nouveau test

Via le chat :
```
[Les stats se réinitialisent automatiquement au redémarrage]
```

Via l'API :
```bash
curl -X POST http://localhost:3000/api/stats/reset
```

## 🚨 Troubleshooting

### Les stats n'apparaissent pas

**Vérifications** :
1. Le service est bien chargé ? → Vérifier les logs au démarrage
2. Les imports fonctionnent ? → Vérifier `src/services/index.ts`
3. L'action est disponible ? → Dire "SHOW_API_STATS" dans le chat

### Les estimations de coût semblent incorrectes

**Causes possibles** :
1. Tarifs OpenAI obsolètes → Vérifier sur https://openai.com/pricing
2. Estimation de tokens imprécise → Les tokens réels viennent de l'API OpenAI si disponibles
3. Modèle non reconnu → Ajouter le modèle dans `OPENAI_PRICING`

### Les appels ne sont pas trackés

**Solution** :
Le tracking automatique repose sur l'interception. Si vous utilisez directement l'API OpenAI sans passer par le runtime ElizaOS, le tracking ne fonctionnera pas.

## 📚 Ressources

- [Documentation OpenAI Pricing](https://openai.com/pricing)
- [ElizaOS Documentation](https://github.com/elizaos/eliza)
- [Guide d'optimisation des prompts](https://platform.openai.com/docs/guides/prompt-engineering)

## 🎯 Prochaines améliorations possibles

- [ ] Persistence des statistiques dans PostgreSQL
- [ ] Dashboard web dédié avec graphiques
- [ ] Alertes par email/Discord quand seuils dépassés
- [ ] Tracking des embeddings séparément
- [ ] Export CSV des statistiques
- [ ] Comparaison de coûts entre sessions
- [ ] Budgets quotidiens/mensuels configurables

