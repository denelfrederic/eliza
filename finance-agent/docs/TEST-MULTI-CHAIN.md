# Test Multi-Chain Portfolio - Guide Rapide

## ✅ Configuration Actuelle

D'après votre `.env` :
- ✅ `EVM_PUBLIC_KEY=0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663`
- ✅ `EVM_CHAINS=all` (9 chaînes)
- ✅ `ETHERSCAN_API_KEY` configurée
- ✅ `ALCHEMY_API_KEY` configurée

**Votre configuration est prête pour le test multi-chain !**

## 🧪 Test 1 : Mode Multi-Chain (ALL)

### Lancer l'Agent

```bash
cd finance-agent
bun run dev
# Ou : npm start
```

### Commande à Tester

Dans le chat :
```
montre moi mon portfolio
```

### Résultat Attendu

```
🔄 Récupération des données de portefeuille en cours...

Analyse multi-chain sur 9 réseaux (ethereum, base, polygon, arbitrum, optimism, bsc, avalanche, fantom, cronos)...
```

Puis après 10-30 secondes :

```
📊 **Votre Portefeuille Multi-Chain**

Adresse : `0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663`
Chaînes scannées : 9
Chaînes avec actifs : X

---

## 🔗 Ethereum

**ETH**
Solde : X.XXX ETH

**Tokens (N)**

1. **WBTC** (Wrapped Bitcoin)
   Solde : 0.00022424 WBTC
   Adresse : `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`

2. **[AUTRE TOKEN]** (...)
   Solde : X.XXX TOKEN
   Adresse : `0x...`

---

## 🔗 Base

**ETH**
Solde : X.XXX ETH

**Tokens (N)**

1. **[TOKEN BASE]** (...)
   ...

---

[... autres chaînes avec actifs ...]

---

📈 **Résumé Global**

Total d'actifs : X
Réseaux actifs : X/9

💡 **Note :** Pour voir uniquement une chaîne, configurez `EVM_CHAINS=ethereum` dans votre .env
```

### Logs à Surveiller

Dans le terminal, vous devriez voir :

```
[INFO] Multi-chain mode enabled: scanning all 9 supported chains
[INFO] Configuration: chains=ethereum,base,bsc,polygon,arbitrum,optimism,avalanche,fantom,cronos
[INFO] Using multi-chain portfolio service...
[INFO] Fetching portfolio for 0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663 on 9 chains
[INFO] Fetching portfolio on Ethereum (chainid: 1)...
[INFO] Fetching portfolio on Base (chainid: 8453)...
[INFO] Fetching portfolio on Polygon (chainid: 137)...
[INFO] ...
[INFO] AlchemyService initialized for chain: ethereum, endpoint: https://eth-mainnet
[INFO] AlchemyService initialized for chain: base, endpoint: https://base-mainnet
[INFO] Calling Alchemy API: alchemy_getTokenBalances for 0x...
[INFO] Alchemy returned 100 token balances
[INFO] Found 2 tokens with balance > 0
[INFO] Portfolio on Ethereum: X.XXX ETH, 2 tokens
[INFO] Portfolio on Base: X.XXX ETH, 1 tokens
[INFO] ...
[INFO] Multi-chain portfolio retrieved: 3 chains with assets out of 9
```

## 🧪 Test 2 : Mode Multi-Chain Spécifique

### Modifier la Configuration

Éditez `.env` :
```bash
# Tester seulement 3 chaînes
EVM_CHAINS=ethereum,base,polygon
```

### Relancer et Tester

```bash
# Redémarrer l'agent
bun run dev
```

Puis dans le chat :
```
montre moi mon portfolio
```

**Résultat attendu :** Seulement Ethereum, Base et Polygon scannées.

## 🧪 Test 3 : Mode Single-Chain (Rétrocompatibilité)

### Modifier la Configuration

Éditez `.env` :
```bash
# Revenir au mode single-chain
EVM_CHAINS=ethereum
```

### Relancer et Tester

```bash
# Redémarrer l'agent
bun run dev
```

Puis dans le chat :
```
montre moi mon portfolio
```

**Résultat attendu :** Format original (une seule chaîne, Ethereum).

### Logs Attendus

```
[INFO] Multi-chain mode: scanning 1 chain(s): ethereum
[INFO] Single-chain mode: ethereum (chainid: 1)
[INFO] Testing Etherscan PRO endpoint: addresstokenbalance...
[WARN] Etherscan PRO endpoint not available...
[INFO] Using Alchemy API as fallback for token balances...
[INFO] Successfully retrieved 2 tokens with balance > 0 via Alchemy
```

## ⚙️ Comparaison des Modes

| Configuration | Chaînes Scannées | Temps Estimé | Format Sortie |
|---------------|------------------|--------------|---------------|
| `EVM_CHAINS=ethereum` | 1 | 5-10s | Single-chain (original) |
| `EVM_CHAINS=ethereum,base,polygon` | 3 | 10-20s | Multi-chain consolidé |
| `EVM_CHAINS=all` | 9 | 20-40s | Multi-chain complet |

## ✅ Checklist de Validation

### Test Multi-Chain (ALL)

- [ ] L'agent démarre sans erreur de compilation
- [ ] Message "Analyse multi-chain sur 9 réseaux..."
- [ ] Logs montrent les 9 chaînes en cours de scan
- [ ] Résultat affiche "Chaînes scannées : 9"
- [ ] Au moins 1 chaîne avec actifs détectée
- [ ] Tokens Ethereum (WBTC) affichés correctement
- [ ] Temps de réponse < 60 secondes
- [ ] Aucune erreur dans les logs

### Test Multi-Chain (Spécifique)

- [ ] Configuration `EVM_CHAINS=ethereum,base,polygon` prise en compte
- [ ] Message "Analyse multi-chain sur 3 réseaux..."
- [ ] Résultat affiche seulement les 3 chaînes demandées
- [ ] Temps de réponse < 30 secondes

### Test Single-Chain

- [ ] Configuration `EVM_CHAINS=ethereum` prise en compte
- [ ] Logs montrent "Single-chain mode: ethereum"
- [ ] Format de sortie identique à l'original
- [ ] Alchemy fallback fonctionne
- [ ] Temps de réponse < 15 secondes

## 🐛 Troubleshooting

### Erreur : "Cannot import module 'multi-chain-portfolio.service'"

**Cause :** Le fichier n'existe pas ou chemin incorrect

**Solution :**
```bash
ls -la finance-agent/src/services/multi-chain-portfolio.service.ts
```

Devrait afficher le fichier créé.

### Erreur : "Chain X not supported"

**Cause :** Nom de chaîne incorrect dans `EVM_CHAINS`

**Solution :** Vérifier l'orthographe. Noms valides :
```
ethereum, base, polygon, arbitrum, optimism, bsc, avalanche, fantom, cronos
```

### Timeout après 60 secondes

**Cause :** Trop de chaînes scannées ou APIs lentes

**Solution :**
1. Réduire le nombre de chaînes : `EVM_CHAINS=ethereum,base,polygon`
2. Vérifier votre connexion internet
3. Augmenter le timeout dans le code (ligne 230 du service)

### Aucun token détecté sur certaines chaînes

**Cause possible :** Chaîne ne supporte pas Alchemy

**Explications :**
- ✅ **Alchemy supporté** : Ethereum, Base, Polygon, Arbitrum, Optimism
- ⚠️ **Etherscan seulement** : BSC, Avalanche, Fantom, Cronos

Les chaînes sans Alchemy peuvent avoir une détection de tokens limitée.

### Erreur : "Alchemy API error: Invalid API key"

**Cause :** Clé Alchemy incorrecte ou expirée

**Solution :**
1. Vérifier `ALCHEMY_API_KEY` dans `.env`
2. Tester la clé manuellement :
```bash
curl https://eth-mainnet.g.alchemy.com/v2/VOTRE_CLE \
-X POST \
-H "Content-Type: application/json" \
-d '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'
```

Devrait retourner un numéro de bloc.

## 📊 Exemple de Résultat Multi-Chain Complet

```
📊 **Votre Portefeuille Multi-Chain**

Adresse : `0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663`
Chaînes scannées : 9
Chaînes avec actifs : 4
Mode : Lecture seule (surveillance uniquement)

---

## 🔗 Ethereum

**ETH**
Solde : 0.5 ETH

**Tokens (3)**

1. **WBTC** (Wrapped Bitcoin)
   Solde : 0.00022424 WBTC
   Adresse : `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`

2. **USDC** (USD Coin)
   Solde : 1,000.5 USDC
   Adresse : `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`

3. **LINK** (Chainlink)
   Solde : 50.25 LINK
   Adresse : `0x514910771af9ca656af840dff83e8264ecf986ca`

---

## 🔗 Base

**ETH**
Solde : 0.1 ETH

**Tokens (2)**

1. **USDC** (USD Coin)
   Solde : 500.0 USDC
   Adresse : `0x833589fcd6edb6e08f4c7c32d4f71b54bda02913`

2. **BRETT** (Brett)
   Solde : 10,000.0 BRETT
   Adresse : `0x532f27101965dd16442e59d40670faf5ebb142e4`

---

## 🔗 Polygon

**MATIC**
Solde : 50.0 MATIC

**Tokens (1)**

1. **USDC** (USD Coin)
   Solde : 100.0 USDC
   Adresse : `0x2791bca1f2de4661ed88a30c99a7a9449aa84174`

---

## 🔗 Arbitrum

**ETH**
Solde : 0.05 ETH

**Tokens (1)**

1. **ARB** (Arbitrum)
   Solde : 25.5 ARB
   Adresse : `0x912ce59144191c1204e64559fe8253a0e49e6548`

---

📈 **Résumé Global**

Total d'actifs : 11
Réseaux actifs : 4/9

💡 **Note :** Pour voir uniquement une chaîne, configurez `EVM_CHAINS=ethereum` dans votre .env
```

## 🎯 Objectif de Test

**Succès si :**
1. ✅ Multi-chain fonctionne avec `EVM_CHAINS=all`
2. ✅ Tokens détectés sur au moins 2 chaînes
3. ✅ Temps de réponse < 60 secondes
4. ✅ Single-chain fonctionne toujours avec `EVM_CHAINS=ethereum`
5. ✅ Aucune régression sur le code existant

---

**Prêt pour le test ?** Lancez `bun run dev` et testez ! 🚀

**Configuration détectée dans votre `.env` :**
- Mode : `EVM_CHAINS=all` (9 chaînes)
- Clé Alchemy : Configurée ✅
- Clé Etherscan : Configurée ✅

Vous devriez obtenir un portfolio multi-chain complet en une seule commande !
