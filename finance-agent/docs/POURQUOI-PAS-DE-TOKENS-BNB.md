# Pourquoi les Tokens BNB N'Apparaissent Pas ?

## 📊 Résultat Actuel

D'après vos résultats :

```json
{
  "chainName": "BNB Smart Chain",
  "chainId": 56,
  "nativeCurrency": "BNB",
  "nativeBalance": "0.0013236391",  // ✅ BNB natif OK
  "tokens": []                       // ❌ Aucun token BEP-20
}
```

## 🔍 Analyse

### Problème 1 : Alchemy Ne Supporte Pas BSC

Dans [multi-chain-portfolio.service.ts:51-56](../src/services/multi-chain-portfolio.service.ts#L51-L56) :

```typescript
bsc: {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: 'BNB',
  etherscanApiUrl: 'https://api.etherscan.io/v2/api',
  supportsAlchemy: false,  // ❌ Alchemy ne supporte pas BSC
},
```

**Explication :** Alchemy ne propose **PAS** de support pour BNB Smart Chain (BSC).

Chaînes supportées par Alchemy :
- ✅ Ethereum
- ✅ Polygon
- ✅ Arbitrum
- ✅ Optimism
- ✅ Base
- ❌ **BSC** (Binance Smart Chain)
- ❌ Avalanche
- ❌ Fantom
- ❌ Cronos

Source : https://docs.alchemy.com/docs/supported-chains

### Problème 2 : Fallback Supprimé

Avant, il y avait un fallback Etherscan pour récupérer les tokens.
**Vous m'avez demandé de le supprimer** et de mettre un message d'erreur à la place.

Donc maintenant, le code affiche :

```
**Tokens**
⚠️ BNB Smart Chain n'est pas supporté par Alchemy.
   → Tokens non disponibles pour cette chaîne
   → Seule la balance native (BNB) est affichée
```

## 💡 Pourquoi la Balance Native (BNB) Fonctionne ?

La balance native (`0.0013236391 BNB`) est récupérée via **Etherscan API V2**, pas Alchemy.

```typescript
// Ligne 235-238 dans multi-chain-portfolio.service.ts
private async getNativeBalance(address: string, chainConfig: ChainConfig): Promise<string> {
  const url = `${chainConfig.etherscanApiUrl}?chainid=${chainConfig.id}&module=account&action=balance&address=${address}&tag=latest&apikey=${this.etherscanApiKey}`;
  // ... récupère le solde BNB
}
```

**Etherscan API V2 unifié** supporte toutes les chaînes EVM :
- Ethereum (chainid=1)
- BSC (chainid=56)
- Polygon (chainid=137)
- Arbitrum (chainid=42161)
- etc.

Source : https://docs.etherscan.io/etherscan-v2/getting-started

## 🎯 Solutions Disponibles

### Option 1 : Réactiver le Fallback Etherscan (pour BSC uniquement)

**Avantages :**
- ✅ Récupère les tokens BEP-20 via Etherscan
- ✅ Fonctionne avec votre clé Etherscan existante

**Inconvénients :**
- ⚠️ Limité à ~20 tokens maximum
- ⚠️ Plus lent (requêtes séquentielles)

**Implémentation :**
```typescript
// Dans multi-chain-portfolio.service.ts
if (chainConfig.supportsAlchemy && this.alchemyApiKey && this.alchemyApiKey !== 'demo') {
  tokens = await this.getTokensViaAlchemy(address, chainName);
} else if (!chainConfig.supportsAlchemy && this.etherscanApiKey) {
  // Fallback pour BSC, Avalanche, Fantom, Cronos
  tokens = await this.getTokensViaEtherscan(address, chainConfig);
}
```

### Option 2 : Utiliser l'API BscScan Directement

BscScan a sa propre API (compatible Etherscan) :

```typescript
// Modifier la config BSC
bsc: {
  id: 56,
  name: 'BNB Smart Chain',
  nativeCurrency: 'BNB',
  etherscanApiUrl: 'https://api.bscscan.com/api',  // API spécifique BSC
  supportsAlchemy: false,
},
```

Ensuite utiliser les endpoints BscScan :
- `tokentx` : Liste des transactions BEP-20
- `tokenbalance` : Solde d'un token spécifique

**Note :** Nécessite une clé API BscScan (gratuite) : https://bscscan.com/apis

### Option 3 : Utiliser Moralis (Alternative à Alchemy)

Moralis supporte BSC et offre un endpoint pour les tokens :

```typescript
// https://deep-index.moralis.io/api/v2/{address}/erc20?chain=bsc

const response = await fetch(
  `https://deep-index.moralis.io/api/v2/${address}/erc20?chain=bsc`,
  {
    headers: {
      'X-API-Key': MORALIS_API_KEY,
    }
  }
);
```

**Avantages :**
- ✅ Support BSC natif
- ✅ Gratuit (40k requêtes/mois)
- ✅ Métadonnées complètes

**Inconvénients :**
- ❌ Nécessite une nouvelle clé API

### Option 4 : Accepter la Limitation (Recommandé pour l'instant)

Simplement afficher un message clair :

```
## 🔗 BNB Smart Chain

**BNB**
Solde : 0.0013236391 BNB

**Tokens**
⚠️ BNB Smart Chain n'est pas supporté par Alchemy.
   → Pour voir vos tokens BEP-20, utilisez : https://bscscan.com/address/0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663#tokensholdings
   → Ou configurez une clé API BscScan/Moralis
```

## 📋 Tableau Récapitulatif

| Chaîne | Balance Native | Tokens | Pourquoi ? |
|--------|---------------|--------|-----------|
| **Ethereum** | ✅ OK | ⚠️ Erreur | Réseau pas activé sur Alchemy |
| **Base** | ✅ OK | ⚠️ Erreur | Réseau pas activé sur Alchemy |
| **Polygon** | ✅ 7.40 MATIC | ⚠️ Erreur | Réseau pas activé sur Alchemy |
| **Arbitrum** | ✅ 0.001 ETH | ⚠️ Erreur | Réseau pas activé sur Alchemy |
| **Optimism** | ✅ OK | ⚠️ Erreur | Réseau pas activé sur Alchemy |
| **BSC** | ✅ 0.001 BNB | ❌ Non supporté | Alchemy ne supporte pas BSC |
| **Avalanche** | ✅ 1.39 AVAX | ❌ Non supporté | Alchemy ne supporte pas Avalanche |
| **Fantom** | ✅ OK | ❌ Non supporté | Alchemy ne supporte pas Fantom |
| **Cronos** | ✅ OK | ❌ Non supporté | Alchemy ne supporte pas Cronos |

## 🎓 En Résumé

### Pourquoi BNB apparaît mais pas les tokens BEP-20 ?

1. **Balance BNB** : Récupérée via **Etherscan API V2** (fonctionne pour toutes les chaînes EVM)
2. **Tokens BEP-20** : Nécessitent **Alchemy** (qui ne supporte pas BSC) OU un fallback Etherscan

### Que faire ?

**Court terme :**
- ✅ Afficher un message clair expliquant pourquoi les tokens ne sont pas disponibles
- ✅ Donner le lien BscScan pour voir manuellement

**Moyen terme (si vous voulez les tokens BSC) :**
- Option A : Réimplémenter le fallback Etherscan pour BSC
- Option B : Intégrer l'API BscScan directement
- Option C : Ajouter Moralis pour BSC (et autres chaînes non supportées par Alchemy)

**Recommandation :** Pour l'instant, concentrez-vous sur **activer Ethereum, Base, Polygon, Arbitrum et Optimism sur votre dashboard Alchemy**. Ces 5 chaînes représentent >90% de l'activité DeFi.

BSC peut attendre ou être consulté manuellement sur BscScan.

---

**Voulez-vous que je réimplémente le fallback Etherscan uniquement pour les chaînes non supportées par Alchemy (BSC, Avalanche, Fantom, Cronos) ?**
