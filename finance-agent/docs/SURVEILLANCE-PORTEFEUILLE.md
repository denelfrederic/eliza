# Configuration Agent Surveillance Portefeuille Crypto

## Vue d'ensemble

Ce guide explique comment configurer le `finance-agent` d'ElizaOS pour surveiller un portefeuille de cryptoactifs sur Ethereum/EVM et recevoir des propositions de rebalancing. L'agent fonctionne en **mode surveillance uniquement** - aucune transaction n'est jamais exécutée automatiquement.

## Fonctionnalités

- **Surveillance en temps réel** : Analyse continue de la composition du portefeuille
- **Détection de déviations** : Alertes automatiques quand l'allocation d'un actif dévie de plus de 10% de la cible
- **Propositions de rebalancing** : Recommandations détaillées pour rééquilibrer le portefeuille
- **Mode lecture seule** : Aucune transaction n'est exécutée - toutes les actions sont des propositions uniquement
- **Support multi-chaînes EVM** : Surveillance sur Ethereum, Arbitrum, Polygon, Base, Optimism, etc.
- **Architecture sécurisée** : Utilisation d'APIs publiques uniquement, aucune clé privée requise

## Installation

### 1. Installer les dépendances

```bash
cd finance-agent
bun install
```

**Note importante** : Le plugin `@elizaos/plugin-evm` n'est PAS installé car il nécessite une clé privée. À la place, l'agent utilise des APIs publiques pour la surveillance.

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du dossier `finance-agent` :

```bash
# ================================
# BLOCKCHAIN - EVM SURVEILLANCE
# ================================
# Mode surveillance uniquement : utiliser uniquement la clé publique
# ⚠️ NE JAMAIS configurer EVM_PRIVATE_KEY - le plugin EVM n'est pas utilisé

# Adresse Ethereum à surveiller (clé publique uniquement - REQUIS)
EVM_PUBLIC_KEY=0xVotreAdresseEthereum

# Chaînes EVM à surveiller (séparées par des virgules)
# Exemples: ethereum, arbitrum, polygon, base, optimism
EVM_CHAINS=ethereum

# ⚠️ IMPORTANT : NE PAS configurer EVM_PRIVATE_KEY
# Le plugin EVM officiel n'est PAS utilisé car il nécessite une clé privée
# L'agent utilise des APIs publiques (Etherscan/Alchemy) à la place

# ================================
# CORE AI PROVIDERS (au moins un requis)
# ================================
OPENAI_API_KEY=votre-cle-openai
# OU
ANTHROPIC_API_KEY=votre-cle-anthropic

# ================================
# DATABASE (requis)
# ================================
DATABASE_URL=sqlite://./data/eliza.db
# OU pour PostgreSQL
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eliza

# ================================
# APIs PUBLIQUES (optionnel mais recommandé)
# ================================
# Etherscan API (gratuit) - https://etherscan.io/apis
ETHERSCAN_API_KEY=votre-cle-etherscan
# OU Alchemy API (gratuit jusqu'à 300M requêtes/mois) - https://www.alchemy.com/
ALCHEMY_API_KEY=votre-cle-alchemy
```

### 3. Variables importantes

| Variable | Description | Requis | Exemple |
|----------|-------------|--------|---------|
| `EVM_PUBLIC_KEY` | Adresse Ethereum publique à surveiller | ✅ Oui | `0x1234...abcd` |
| `EVM_CHAINS` | Chaînes EVM à surveiller (virgule séparée) | ✅ Oui | `ethereum` ou `ethereum,arbitrum` |
| `EVM_PRIVATE_KEY` | ❌ **NE JAMAIS CONFIGURER** | ⛔ Non | Le plugin EVM n'est pas utilisé |
| `ETHERSCAN_API_KEY` | Clé API Etherscan (optionnel mais recommandé) | ⚠️ Optionnel | Gratuit sur etherscan.io/apis |
| `ALCHEMY_API_KEY` | Clé API Alchemy (optionnel mais recommandé) | ⚠️ Optionnel | Gratuit sur alchemy.com |
| `OPENAI_API_KEY` ou `ANTHROPIC_API_KEY` | Fournisseur LLM | ✅ Oui | `sk-...` |
| `DATABASE_URL` | URL de la base de données | ✅ Oui | `sqlite://./data/eliza.db` |

## Utilisation

### Démarrer l'agent

```bash
cd finance-agent
bun run dev
# OU pour la production
bun run start
```

### Actions disponibles

L'agent expose deux actions principales :

#### 1. Surveillance du portefeuille (`SURVEILLANCE_PORTEFEUILLE`)

Demandez à l'agent de surveiller votre portefeuille :

```
"Peux-tu vérifier l'état de mon portefeuille ?"
"Analyse mon allocation d'actifs crypto"
"Quelle est la composition actuelle de mon portefeuille ?"
```

L'agent va :
- Analyser tous les actifs dans le portefeuille
- Calculer les proportions de chaque cryptoactif
- Comparer avec les allocations cibles
- Générer un rapport détaillé

#### 2. Propositions de rebalancing (`PROPOSER_REBALANCING`)

Demandez des propositions de rebalancing :

```
"Mon portefeuille a-t-il besoin d'être rééquilibré ?"
"Que proposes-tu comme ajustements pour mon portefeuille ?"
"Y a-t-il des déséquilibres à corriger ?"
```

L'agent va :
- Détecter les déviations supérieures à 10%
- Proposer des actions spécifiques (vente/achat)
- Indiquer les quantités recommandées
- Expliquer la justification de chaque ajustement

**⚠️ IMPORTANT** : Toutes les propositions sont informatives uniquement. Vous devez exécuter manuellement toute transaction.

## Sécurité

### ⚠️ Pourquoi le plugin EVM n'est pas utilisé

Le plugin `@elizaos/plugin-evm` officiel a une limitation de sécurité importante :

**Problème** : Le plugin nécessite `EVM_PRIVATE_KEY` pour s'initialiser, même pour la lecture seule. Sans cette clé, le plugin échoue avec l'erreur :
```
Error: EVM_PRIVATE_KEY is missing
```

**Solution adoptée** : 
- ✅ Le plugin EVM a été **retiré** du projet
- ✅ L'agent utilise des **APIs publiques** (Etherscan, Alchemy) à la place
- ✅ **Aucune clé privée nécessaire** - seule l'adresse publique est requise
- ✅ **Sécurité maximale** - impossible d'exécuter des transactions même par erreur

### Mode surveillance uniquement

- ✅ **Utilise uniquement la clé publique** : L'adresse Ethereum publique suffit pour lire les données du portefeuille via APIs publiques
- ✅ **Aucune clé privée requise** : Ne configurez jamais `EVM_PRIVATE_KEY` - le plugin EVM n'est pas utilisé
- ✅ **Aucune transaction automatique** : L'agent ne peut pas et ne doit pas exécuter de transactions
- ✅ **Propositions uniquement** : Toutes les suggestions de rebalancing sont des recommandations informatives
- ✅ **Architecture sécurisée** : Utilisation exclusive d'APIs publiques en lecture seule

### Bonnes pratiques

1. **Ne jamais partager votre clé privée** avec l'agent (ou personne d'autre)
2. **Ne jamais configurer `EVM_PRIVATE_KEY`** dans le fichier `.env`
3. **Utiliser des APIs publiques** : Etherscan ou Alchemy pour la surveillance
4. **Vérifier indépendamment** toutes les propositions de rebalancing
5. **Double-vérifier** les adresses et montants avant toute transaction manuelle
6. **Garder les clés API sécurisées** et ne pas les commiter dans Git

## Configuration du seuil de rebalancing

Par défaut, le seuil de détection est fixé à **10%** de déviation. Vous pouvez le modifier via la variable d'environnement :

```bash
REBALANCING_THRESHOLD=10  # Pourcentage de déviation avant alerte
```

## Endpoint API

Le plugin expose un endpoint REST pour vérifier la configuration :

```bash
GET http://localhost:3000/portfolio/surveillance
```

Réponse :
```json
{
  "mode": "read-only",
  "publicKey": "0x...",
  "chains": ["ethereum"],
  "rebalancingThreshold": "10",
  "message": "Surveillance mode active - no transactions will be executed"
}
```

## Dépannage

### Erreur : "EVM_PRIVATE_KEY is missing"

**Cause** : Cette erreur apparaît si le plugin `@elizaos/plugin-evm` est utilisé. 

**Solution** : 
- Vérifiez que le plugin EVM n'est pas dans `src/character.ts`
- Vérifiez que `@elizaos/plugin-evm` n'est pas dans `package.json`
- L'agent doit utiliser uniquement les APIs publiques

### L'agent ne détecte pas le portefeuille

1. Vérifiez que `EVM_PUBLIC_KEY` est correctement configuré dans `.env`
2. Vérifiez que `EVM_CHAINS` correspond à la chaîne où se trouve votre portefeuille
3. Vérifiez que vous avez configuré `ETHERSCAN_API_KEY` ou `ALCHEMY_API_KEY` (recommandé)
4. Vérifiez les logs pour des erreurs de connexion API

### Les propositions de rebalancing ne s'affichent pas

1. Vérifiez que le seuil de rebalancing est correctement configuré
2. Assurez-vous que l'agent a accès aux données de prix en temps réel via les APIs
3. Vérifiez que votre fournisseur LLM est correctement configuré

### Erreurs de plugin EVM

Si vous voyez des erreurs liées au plugin EVM :

1. **Ne configurez PAS `EVM_PRIVATE_KEY`** - c'est intentionnel
2. Vérifiez que `@elizaos/plugin-evm` n'est pas installé : `bun list | grep plugin-evm`
3. Si le plugin est installé, désinstallez-le : `bun remove @elizaos/plugin-evm`
4. Vérifiez que `src/character.ts` ne référence pas `@elizaos/plugin-evm`
5. Consultez les logs pour plus de détails sur l'erreur

## Architecture

### Fichiers modifiés

- `src/character.ts` : Configuration du character **SANS plugin EVM** (utilise APIs publiques)
- `src/plugin.ts` : Actions personnalisées pour surveillance et rebalancing via APIs publiques
- `src/index.ts` : Activation du plugin personnalisé
- `package.json` : **SANS** dépendance `@elizaos/plugin-evm` (intentionnel)

### Structure du plugin

```
src/plugin.ts
├── surveillancePortefeuilleAction  # Action de surveillance via APIs publiques
├── proposerRebalancingAction       # Action de proposition de rebalancing
└── plugin                           # Configuration du plugin (sans EVM)
```

### Flux de données

1. **Lecture** : APIs publiques (Etherscan/Alchemy) → Données du portefeuille
2. **Analyse** : LLM analyse les données et détecte les déviations
3. **Proposition** : Génération de recommandations de rebalancing
4. **Aucune action** : Aucune transaction n'est jamais exécutée

## Support

Pour des questions ou problèmes :
1. Consultez les logs de l'agent : `LOG_LEVEL=debug bun run dev`
2. Vérifiez la documentation ElizaOS : https://elizaos.github.io/elizaos/
3. Pour obtenir une clé API Etherscan : https://etherscan.io/apis
4. Pour obtenir une clé API Alchemy : https://www.alchemy.com/

## Résumé

Cet agent vous permet de :
- ✅ Surveiller votre portefeuille crypto en temps réel via APIs publiques
- ✅ Recevoir des alertes automatiques de déviations
- ✅ Obtenir des propositions détaillées de rebalancing
- ✅ Maintenir une sécurité maximale (pas de clé privée, pas de plugin EVM, mode lecture seule uniquement)

**Rappel critique** : 
- ⚠️ L'agent fonctionne en mode surveillance uniquement
- ⚠️ Toutes les transactions doivent être exécutées manuellement après vérification
- ⚠️ Ne configurez JAMAIS `EVM_PRIVATE_KEY` - le plugin EVM n'est pas utilisé pour des raisons de sécurité
- ✅ Utilisez des APIs publiques (Etherscan/Alchemy) qui fonctionnent avec uniquement votre adresse publique

