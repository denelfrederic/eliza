# Finance Agent - Crypto Portfolio Surveillance

Agent de surveillance de portefeuille crypto Ethereum/EVM en mode **lecture seule**. Aucune transaction n'est exécutée.

## 🎯 Fonctionnalités

- 📊 Surveillance de portefeuille crypto (Ethereum & multi-chain)
- 💡 Propositions de rebalancing (seuil 10% de déviation)
- 🔍 Analyse d'allocation d'actifs
- 📈 **Tracking des appels OpenAI et consommation de tokens**
- ⚡ Mode lecture seule sécurisé (pas de clé privée requise)

## 🆕 Système de tracking OpenAI

L'agent inclut un système complet de suivi de la consommation API :

- ✅ Comptage automatique des appels par modèle
- ✅ Suivi des tokens (prompt + completion)
- ✅ Estimation des coûts en temps réel
- ✅ Alertes automatiques (>100 appels ou >$1.00)
- ✅ Recommandations d'optimisation
- ✅ Affichage dans chaque réponse
- ✅ API REST `/api/stats` pour monitoring

**Voir** : `docs/OPENAI-TRACKING.md` pour le guide complet

## 🚀 Démarrage rapide

### Prérequis

- Node.js 18+ ou Bun
- Une clé API OpenAI ou Anthropic
- (Optionnel) Clé API Etherscan/Alchemy pour meilleures performances

### Installation

```bash
# Cloner et installer
cd finance-agent
bun install

# Configurer l'environnement
cp .env.example .env
# Éditer .env avec vos clés API

# Démarrer l'agent
bun run dev
```

### Configuration minimale (.env)

```bash
# Adresse à surveiller (OBLIGATOIRE)
EVM_PUBLIC_KEY=0xVotreAdresseEthereum

# Chaînes à surveiller (OBLIGATOIRE)
EVM_CHAINS=ethereum  # ou ethereum,arbitrum,optimism

# Fournisseur LLM (au moins un requis)
OPENAI_API_KEY=sk-votre-cle-openai

# Base de données (OBLIGATOIRE)
DATABASE_URL=sqlite://./data/eliza.db

# APIs publiques (optionnel mais recommandé)
ETHERSCAN_API_KEY=votre-cle-etherscan
```

**Voir** : `CONFIGURATION-SURVEILLANCE.md` pour plus de détails

## 💬 Utilisation

### Commandes disponibles

#### Voir son portefeuille
```
> Montre-moi mon portefeuille
> Affiche mon portfolio
> Quel est l'état de mon wallet ?
```

#### Propositions de rebalancing
```
> Mon portefeuille a-t-il besoin de rebalancing ?
> Propose un rebalancing
```

#### Statistiques d'utilisation API
```
> Montre-moi les stats API
> Combien de tokens j'ai consommé ?
```

### Affichage automatique

Chaque réponse inclut un résumé de consommation :
```
---
💡 **Session actuelle** : 8 appels | 5,137 tokens | ~$0.0013
```

## 📊 Monitoring API

### Via le chat
```
> Montre-moi les stats API
```

### Via l'API REST
```bash
# Consulter les statistiques
curl http://localhost:3000/api/stats

# Réinitialiser les compteurs
curl -X POST http://localhost:3000/api/stats/reset
```

## 🛠️ Développement

```bash
# Démarrage en mode dev (hot-reload)
bun run dev

# Build pour production
bun run build

# Tests
bun test
```

## Testing

ElizaOS employs a dual testing strategy:

1. **Component Tests** (`src/__tests__/*.test.ts`)

   - Run with Bun's native test runner
   - Fast, isolated tests using mocks
   - Perfect for TDD and component logic

2. **E2E Tests** (`src/__tests__/e2e/*.e2e.ts`)
   - Run with ElizaOS custom test runner
   - Real runtime with actual database (PGLite)
   - Test complete user scenarios

### Test Structure

```
src/
  __tests__/              # All tests live inside src
    *.test.ts            # Component tests (use Bun test runner)
    e2e/                 # E2E tests (use ElizaOS test runner)
      project-starter.e2e.ts  # E2E test suite
      README.md          # E2E testing documentation
  index.ts               # Export tests here: tests: [ProjectStarterTestSuite]
```

### Running Tests

- `elizaos test` - Run all tests (component + e2e)
- `elizaos test component` - Run only component tests
- `elizaos test e2e` - Run only E2E tests

### Writing Tests

Component tests use bun:test:

```typescript
// Unit test example (__tests__/config.test.ts)
describe('Configuration', () => {
  it('should load configuration correctly', () => {
    expect(config.debug).toBeDefined();
  });
});

// Integration test example (__tests__/integration.test.ts)
describe('Integration: Plugin with Character', () => {
  it('should initialize character with plugins', async () => {
    // Test interactions between components
  });
});
```

E2E tests use ElizaOS test interface:

```typescript
// E2E test example (e2e/project.test.ts)
export class ProjectTestSuite implements TestSuite {
  name = 'project_test_suite';
  tests = [
    {
      name: 'project_initialization',
      fn: async (runtime) => {
        // Test project in a real runtime
      },
    },
  ];
}

export default new ProjectTestSuite();
```

The test utilities in `__tests__/utils/` provide helper functions to simplify writing tests.

## Configuration

Customize your project by modifying:

- `src/index.ts` - Main entry point
- `src/character.ts` - Character definition
