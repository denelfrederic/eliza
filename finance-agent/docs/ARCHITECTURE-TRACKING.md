# 🏗️ Architecture du Système de Tracking OpenAI

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERACTION                         │
│              "Montre-moi mon portefeuille"                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ELIZA RUNTIME CORE                            │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  1. Parse user message                                  │    │
│  │  2. Determine action (SURVEILLANCE_PORTEFEUILLE)       │    │
│  │  3. Call OpenAI for NLU/generation                    │◄────┼─── TRACKED
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    FINANCE PLUGIN                                │
│  ┌────────────────────────────────────────────────────────┐    │
│  │  Action Handler: SURVEILLANCE_PORTEFEUILLE             │    │
│  │  ├─ Fetch wallet data (Etherscan/Alchemy)             │    │
│  │  ├─ Format response                                    │    │
│  │  ├─ ✨ Call openaiTracker.generateCompactSummary()    │◄────┼─── NEW
│  │  └─ Send response to user                              │    │
│  └────────────────────────────────────────────────────────┘    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    USER SEES RESPONSE                            │
│  📊 Your Portfolio...                                            │
│  [portfolio details]                                             │
│  ---                                                             │
│  💡 Session: 8 calls | 5,137 tokens | ~$0.0013       ◄───────┼─── NEW
└─────────────────────────────────────────────────────────────────┘
```

## Flux de Tracking

```
┌─────────────────────────────────────────────────────────────────┐
│                    OpenAI API Call Flow                          │
└─────────────────────────────────────────────────────────────────┘

User Message
     │
     ▼
ElizaOS Runtime
     │
     ├─── Calls OpenAI API ───────┐
     │                             │
     │                             ▼
     │                    ┌──────────────────┐
     │                    │  OpenAI API      │
     │                    │  (gpt-4o-mini)   │
     │                    └────────┬─────────┘
     │                             │
     │                    Response with tokens
     │                             │
     │◄────────────────────────────┘
     │
     ├─── After response received ───┐
     │                                │
     │                                ▼
     │                    ┌─────────────────────────┐
     │                    │ OpenAIInterceptorService│
     │                    │ ├─ estimateTokens()     │
     │                    │ └─ trackGeneration()    │
     │                    └────────┬────────────────┘
     │                             │
     │                             ▼
     │                    ┌─────────────────────────┐
     │                    │ OpenAITrackerService    │
     │                    │ ├─ trackCall()          │
     │                    │ ├─ Update counters      │
     │                    │ └─ Calculate costs      │
     │                    └─────────────────────────┘
     │
     ▼
Response with stats appended
```

## Architecture des Services

### OpenAITrackerService

```
┌─────────────────────────────────────────────────────────┐
│              OpenAITrackerService                        │
│                                                          │
│  State (In-Memory):                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │ Map<modelName, ModelStats>                      │    │
│  │   ├─ "gpt-4o-mini"                              │    │
│  │   │    ├─ totalCalls: 8                         │    │
│  │   │    ├─ totalPromptTokens: 3245               │    │
│  │   │    ├─ totalCompletionTokens: 1892           │    │
│  │   │    ├─ totalTokens: 5137                     │    │
│  │   │    ├─ estimatedCost: 0.001254               │    │
│  │   │    ├─ lastCallTimestamp: 1730311234         │    │
│  │   │    └─ errorCount: 0                         │    │
│  │   │                                              │    │
│  │   └─ "text-embedding-3-small"                   │    │
│  │        ├─ totalCalls: 12                        │    │
│  │        └─ ...                                    │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  Methods:                                                │
│  ├─ trackCall(model, promptTokens, completionTokens)   │
│  ├─ getAllStats() → Record<string, ModelStats>         │
│  ├─ getModelStats(model) → ModelStats                  │
│  ├─ generateReport() → string                          │
│  ├─ generateCompactSummary() → string                  │
│  ├─ checkThresholds() → AlertResult?                   │
│  └─ resetStats() → void                                │
└─────────────────────────────────────────────────────────┘
```

### OpenAIInterceptorService

```
┌─────────────────────────────────────────────────────────┐
│           OpenAIInterceptorService                       │
│                                                          │
│  Purpose: Bridge between calls and tracker              │
│                                                          │
│  Methods:                                                │
│  ├─ estimateTokens(text: string)                       │
│  │    └─ Returns: number (estimated tokens)            │
│  │                                                       │
│  ├─ trackGeneration(                                    │
│  │    modelName: string,                                │
│  │    prompt: string,                                   │
│  │    response: string,                                 │
│  │    actualTokens?: {prompt, completion}              │
│  │  )                                                   │
│  │    ├─ Estimate or use actual tokens                 │
│  │    └─ Call openaiTracker.trackCall()                │
│  │                                                       │
│  ├─ trackError(modelName, error)                       │
│  │    └─ Track failed API calls                        │
│  │                                                       │
│  └─ generateOptimizationRecommendations()              │
│       └─ Returns: string[] (suggestions)                │
└─────────────────────────────────────────────────────────┘
```

## Intégration dans le Plugin

### plugin.ts Structure

```typescript
// 1. Services enregistrés au démarrage
services: [
  StarterService,
  // ✨ NOUVEAU
  async (runtime) => {
    const { OpenAITrackerService } = await import('./services/openai-tracker.service');
    return new OpenAITrackerService();
  },
  async (runtime) => {
    const { OpenAIInterceptorService } = await import('./services/openai-interceptor.service');
    return new OpenAIInterceptorService();
  }
]

// 2. Actions exposées
actions: [
  surveillancePortefeuilleAction,    // Existant
  proposerRebalancingAction,         // Existant
  showApiStatsAction                 // ✨ NOUVEAU
]

// 3. Routes API
routes: [
  { path: '/portfolio/surveillance', ... },  // Existant
  { path: '/api/stats', method: 'GET' },     // ✨ NOUVEAU
  { path: '/api/stats/reset', method: 'POST' } // ✨ NOUVEAU
]
```

### Action SHOW_API_STATS

```
┌─────────────────────────────────────────────────────────┐
│              Action: SHOW_API_STATS                      │
│                                                          │
│  Triggers:                                               │
│  ├─ "Montre-moi les stats API"                         │
│  ├─ "Combien de tokens ?"                               │
│  ├─ "API usage"                                          │
│  └─ "Consommation"                                       │
│                                                          │
│  Handler Flow:                                           │
│  1. Import openaiTracker dynamically                    │
│  2. Call openaiTracker.generateReport()                 │
│  3. Call openaiTracker.checkThresholds()                │
│  4. If threshold exceeded, prepend alert                │
│  5. Call openaiInterceptor.generateOptimizationRecs()   │
│  6. Append recommendations                               │
│  7. Send complete report to user                        │
│                                                          │
│  Response Format:                                        │
│  ┌─────────────────────────────────────────────┐       │
│  │ 📊 **Statistiques d'utilisation OpenAI**    │       │
│  │                                              │       │
│  │ ⏱️ Durée : 15 minutes                        │       │
│  │                                              │       │
│  │ **gpt-4o-mini**                              │       │
│  │ ├─ Appels : 8                                │       │
│  │ ├─ Tokens : 5,137                            │       │
│  │ └─ Coût : $0.001254                          │       │
│  │                                              │       │
│  │ **📈 Totaux**                                │       │
│  │ └─ Coût total : $0.001254                    │       │
│  │                                              │       │
│  │ **💡 Recommandations**                       │       │
│  │ [si applicable]                              │       │
│  └─────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────┘
```

## Modification des Actions Existantes

### Avant (surveillancePortefeuilleAction)

```typescript
handler: async (...) => {
  // ... fetch portfolio data ...
  
  const responseContent = {
    text: portfolioText,
    actions: ['SURVEILLANCE_PORTEFEUILLE']
  };
  
  await callback(responseContent);
}
```

### Après (avec tracking)

```typescript
handler: async (...) => {
  // ... fetch portfolio data ...
  
  // ✨ NOUVEAU : Ajouter les stats
  try {
    const { openaiTracker } = await import('./services/openai-tracker.service');
    const compactSummary = openaiTracker.generateCompactSummary();
    if (compactSummary) {
      portfolioText += compactSummary;
    }
  } catch (err) {
    logger.warn('Could not fetch API stats:', err);
  }
  
  const responseContent = {
    text: portfolioText,
    actions: ['SURVEILLANCE_PORTEFEUILLE']
  };
  
  await callback(responseContent);
}
```

## Routes API REST

### GET /api/stats

```
┌─────────────────────────────────────────────────────────┐
│              GET /api/stats                              │
│                                                          │
│  Request:                                                │
│  curl http://localhost:3000/api/stats                   │
│                                                          │
│  Response (JSON):                                        │
│  {                                                       │
│    "success": true,                                      │
│    "timestamp": 1730311234567,                          │
│    "stats": {                                            │
│      "gpt-4o-mini": {                                    │
│        "totalCalls": 8,                                  │
│        "totalPromptTokens": 3245,                        │
│        "totalCompletionTokens": 1892,                    │
│        "totalTokens": 5137,                              │
│        "estimatedCost": 0.001254,                        │
│        "lastCallTimestamp": 1730311234000,               │
│        "errorCount": 0                                   │
│      }                                                   │
│    },                                                    │
│    "threshold": null,                                    │
│    "recommendations": [],                                │
│    "report": "[formatted text report]"                  │
│  }                                                       │
└─────────────────────────────────────────────────────────┘
```

### POST /api/stats/reset

```
┌─────────────────────────────────────────────────────────┐
│              POST /api/stats/reset                       │
│                                                          │
│  Request:                                                │
│  curl -X POST http://localhost:3000/api/stats/reset     │
│                                                          │
│  Response (JSON):                                        │
│  {                                                       │
│    "success": true,                                      │
│    "message": "Statistiques réinitialisées avec succès",│
│    "timestamp": 1730311234567                           │
│  }                                                       │
│                                                          │
│  Effect:                                                 │
│  ├─ Clears all stats in memory                          │
│  ├─ Resets session start time                           │
│  └─ Ready for fresh tracking                            │
└─────────────────────────────────────────────────────────┘
```

## Calcul des Coûts

### Pricing Table

```typescript
const OPENAI_PRICING = {
  'gpt-4o-mini': {
    prompt: 0.00015 / 1000,      // $0.15 per 1M tokens
    completion: 0.0006 / 1000,   // $0.60 per 1M tokens
  },
  'gpt-4o': {
    prompt: 0.0025 / 1000,       // $2.50 per 1M tokens
    completion: 0.01 / 1000,     // $10.00 per 1M tokens
  },
  'text-embedding-3-small': {
    prompt: 0.00002 / 1000,      // $0.02 per 1M tokens
    completion: 0,
  }
}
```

### Formule de Calcul

```
Total Cost = (promptTokens × promptPrice) + (completionTokens × completionPrice)

Example:
  Model: gpt-4o-mini
  Prompt: 3,245 tokens
  Completion: 1,892 tokens
  
  Cost = (3245 × 0.00015/1000) + (1892 × 0.0006/1000)
       = 0.00048675 + 0.00113520
       = $0.00162195
```

## Estimation des Tokens

```typescript
estimateTokens(text: string): number {
  // Détection de la langue
  const isFrench = /[àâäéèêëïîôùûüÿæœç]/i.test(text);
  
  // Approximation
  const avgCharsPerToken = isFrench ? 3 : 4;
  
  return Math.ceil(text.length / avgCharsPerToken);
}
```

### Précision

- **Anglais** : ~4 caractères/token (±10%)
- **Français** : ~3 caractères/token (±10%)
- **Code** : Variable selon syntaxe

**Note** : Pour avoir les vrais tokens, il faudrait parser les métadonnées de réponse OpenAI.

## Optimisation du Prompt Système

### Impact

```
┌───────────────────────────────────────────────────────┐
│         Prompt System Optimization                     │
│                                                        │
│  Before:                                               │
│  ┌────────────────────────────────────────────┐      │
│  │ "You are a specialized cryptocurrency..."  │      │
│  │ [32 lines of detailed instructions]        │      │
│  │ Total: ~1,200 tokens                        │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
│  After:                                                │
│  ┌────────────────────────────────────────────┐      │
│  │ "Agent de surveillance crypto READ-ONLY..."│      │
│  │ [9 lines of concise instructions]          │      │
│  │ Total: ~380 tokens                          │      │
│  └────────────────────────────────────────────┘      │
│                                                        │
│  Savings: 820 tokens per call                         │
│           × 100 calls = 82,000 tokens                 │
│           ≈ $0.012 saved per 100 calls                │
└───────────────────────────────────────────────────────┘
```

## Alertes et Seuils

```typescript
checkThresholds() {
  if (totalCalls > 100) {
    return {
      alert: true,
      message: `⚠️ Alerte : ${totalCalls} appels API...`
    };
  }
  
  if (totalCost > 1.0) {
    return {
      alert: true,
      message: `💰 Alerte : Coût de $${totalCost.toFixed(2)}...`
    };
  }
  
  return null;
}
```

### Seuils par Défaut

| Métrique | Seuil | Action |
|----------|-------|--------|
| Appels | 100 | Alerte utilisateur |
| Coût | $1.00 | Alerte utilisateur |
| Tokens/appel | 2,000 | Recommandation optimisation |
| Erreurs | 5 | Vérification API key |

## Cycle de Vie

```
┌─────────────────────────────────────────────────────────┐
│                  Session Lifecycle                       │
└─────────────────────────────────────────────────────────┘

1. Agent Start
   ├─ Initialize OpenAITrackerService
   ├─ Initialize OpenAIInterceptorService
   └─ Reset all counters
   
2. User Interactions
   ├─ Each OpenAI call tracked
   ├─ Stats updated in real-time
   └─ Compact summary in responses
   
3. User Requests Stats
   ├─ Generate full report
   ├─ Check thresholds
   └─ Add recommendations
   
4. Agent Restart
   └─ All stats lost (in-memory only)
   
Future Enhancement:
   └─ Persist to PostgreSQL for history
```

## Intégration Future

### Possible Extensions

1. **Persistence**
```typescript
// Save stats to database
await db.saveStats(openaiTracker.getAllStats());

// Retrieve historical stats
const history = await db.getStatsHistory(30); // last 30 days
```

2. **Webhooks**
```typescript
// Alert via webhook when threshold exceeded
if (threshold?.alert) {
  await fetch('https://your-webhook.com/alert', {
    method: 'POST',
    body: JSON.stringify(threshold)
  });
}
```

3. **Dashboard**
```typescript
// Real-time stats dashboard
app.get('/dashboard', (req, res) => {
  res.render('dashboard', { 
    stats: openaiTracker.getAllStats() 
  });
});
```

---

**Voir aussi** :
- `OPTIMISATIONS-OPENAI.md` : Guide rapide
- `docs/OPENAI-TRACKING.md` : Documentation complète
- `docs/OPTIMISATIONS-REALISEES.md` : Détails d'implémentation

