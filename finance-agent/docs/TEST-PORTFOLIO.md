# Guide de Test - Portfolio Listing

## 🧪 Procédure de Test

### 1. Démarrer l'Agent

```bash
cd finance-agent
bun run dev
# Ou : npm start
```

**Attendre le message :**
```
[INFO] Finance surveillance plugin initialized in READ-ONLY mode
[INFO] Using Etherscan API V2 for portfolio monitoring
[INFO] Agent started on http://localhost:3001
```

### 2. Ouvrir l'Interface

Ouvrez votre navigateur : **http://localhost:3000**

### 3. Envoyer la Commande

Dans le chat, tapez :
```
montre moi mon portfolio
```

Ou variantes :
- "affiche mon portfolio"
- "quel est mon portefeuille ?"
- "liste mes assets"
- "check portfolio"

### 4. Résultat Attendu

L'agent devrait répondre avec :

```
🔄 Récupération des données de portefeuille en cours...

Analyse de votre portefeuille Ethereum...
```

Puis après quelques secondes :

```
📊 **Votre Portefeuille Ethereum**

Adresse : `0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663`
Chaîne : ethereum (chainid: 1)
API : Alchemy (fallback)
Mode : Lecture seule (surveillance uniquement)

---

**ETH (Ethereum)**
Solde : X.XXX ETH
Valeur estimée : ~$X,XXX (à $4000/ETH)

**Tokens ERC-20 (N)**

1. **WBTC** (Wrapped Bitcoin)
   Solde : 0.00022424 WBTC
   Adresse : `0x2260fac5e5542a773aa44fbcfedf7c193bc2c599`

2. **[AUTRE TOKEN]** (Nom du token)
   Solde : X.XXX TOKEN
   Adresse : `0x...`

---

📈 **Analyse**
Total d'actifs différents : N
• ETH : X.XXX ETH
• N token(s) ERC-20 détenu(s)

✅ Clé API Etherscan V2 configurée
```

## 📋 Checklist de Vérification

### ✅ Test Réussi Si :

- [ ] L'agent répond en moins de 15 secondes
- [ ] Le solde ETH est affiché (même si 0)
- [ ] Au moins 1 token ERC-20 est listé (WBTC attendu)
- [ ] Les balances sont formatées correctement (pas de valeurs hexadécimales)
- [ ] Le message indique "Alchemy (fallback)" ou "Etherscan PRO"
- [ ] Pas d'erreur dans les logs du terminal

### ❌ Test Échoué Si :

- [ ] Message d'erreur "Configuration manquante"
- [ ] Message "Failed to retrieve token list"
- [ ] Timeout après 30 secondes
- [ ] Aucun token affiché alors que l'adresse en possède
- [ ] Erreur dans la console : "Cannot import module"

## 🔍 Analyse des Logs

### Logs de Succès (Alchemy)

```
[INFO] Testing Etherscan PRO endpoint: addresstokenbalance...
[WARN] Etherscan PRO endpoint not available: Sorry, it looks like you are trying to access an API Pro endpoint...
[INFO] Using Alchemy API as fallback for token balances...
[INFO] Calling Alchemy API: alchemy_getTokenBalances for 0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663
[INFO] Alchemy returned 100 token balances
[INFO] Found 2 tokens with balance > 0
[INFO] Calling Alchemy API: alchemy_getTokenMetadata for 0x2260fac5e5542a773aa44fbcfedf7c193bc2c599
[INFO] Successfully retrieved 2 tokens with balance > 0 via Alchemy
[INFO] Retrieved portfolio data: ETH balance: X.XXX, Tokens with balance: 2
```

### Logs de Succès (Etherscan PRO)

```
[INFO] Testing Etherscan PRO endpoint: addresstokenbalance...
[INFO] Etherscan PRO endpoint available, using it...
[INFO] Fetching token list page 1 using Etherscan addresstokenbalance...
[INFO] Token list API response page 1 - status: 1
[INFO] Found token: WBTC - Balance: 0.00022424
[INFO] Successfully retrieved 2 tokens via Etherscan PRO
```

### Logs d'Erreur à Investiguer

```
[ERROR] Failed to fetch data from Etherscan API: fetch is not available
→ Problème : Version de Node.js trop ancienne
→ Solution : Mettre à jour Node.js vers v18+

[ERROR] Alchemy fallback failed: Invalid API key
→ Problème : Clé Alchemy invalide ou expirée
→ Solution : Vérifier ALCHEMY_API_KEY dans .env

[ERROR] Error testing Etherscan PRO endpoint: timeout
→ Problème : Réseau lent ou API indisponible
→ Solution : Réessayer ou augmenter le timeout
```

## 🐛 Debugging Étape par Étape

### Si aucun token n'est affiché :

**1. Vérifier la configuration**
```bash
# Dans finance-agent/.env
cat .env | grep -E "EVM_PUBLIC_KEY|ETHERSCAN_API_KEY|ALCHEMY_API_KEY"
```

Doit afficher :
```
EVM_PUBLIC_KEY=0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663
ETHERSCAN_API_KEY=8P11ZPRYE793138EIQHCHT6VFNQAFTX37W
# ALCHEMY_API_KEY=... (optionnel)
```

**2. Tester Alchemy manuellement**
```bash
curl https://eth-mainnet.g.alchemy.com/v2/demo \
-X POST \
-H "Content-Type: application/json" \
-d '{"jsonrpc":"2.0","method":"alchemy_getTokenBalances","params":["0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663","DEFAULT_TOKENS"],"id":42}'
```

Doit retourner des résultats avec `tokenBalances`.

**3. Vérifier que le service Alchemy existe**
```bash
ls -la finance-agent/src/services/alchemy.service.ts
```

Doit afficher le fichier créé.

**4. Vérifier les imports**
```bash
grep -n "import.*alchemy" finance-agent/src/plugin.ts
```

Doit afficher :
```
309:            const { AlchemyService } = await import('./services/alchemy.service');
```

## 📊 Résultats de Test à Rapporter

### Format de Rapport

```markdown
## Test du Portfolio Listing

**Date :** 29/10/2025
**Environnement :** Development
**Adresse testée :** 0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663

### Résultats

- [ ] ✅ / ❌ Agent démarre sans erreur
- [ ] ✅ / ❌ Commande "montre moi mon portfolio" reconnue
- [ ] ✅ / ❌ Solde ETH affiché correctement
- [ ] ✅ / ❌ Tokens ERC-20 listés
- [ ] ✅ / ❌ Fallback Alchemy fonctionne
- [ ] ✅ / ❌ Temps de réponse < 15 secondes

### Tokens Détectés

1. WBTC : ✅ / ❌ (balance : ...)
2. Autres : ...

### Logs Pertinents

```
[Coller les logs ici]
```

### Problèmes Rencontrés

[Décrire ici]

### Captures d'Écran

[Ajouter captures d'écran si pertinent]
```

## 🎯 Critères de Validation Finale

### ✅ MVP Validé Si :

1. **Fonctionnel** : L'agent affiche au moins 1 token correctement
2. **Robuste** : Gère le fallback Etherscan → Alchemy automatiquement
3. **Performant** : Réponse en moins de 15 secondes
4. **Complet** : Affiche nom, symbole, balance et adresse de chaque token

### 🎓 Objectif Atteint Si :

L'utilisateur peut demander "montre moi mon portfolio" et obtenir une **liste complète et à jour** de tous ses tokens ERC-20, identique à celle visible sur https://etherscan.io/address/0xF5C42a9F0d648d171C1cB9FB17C8da6EB25dc663#tokensholdings

---

**Prêt pour le test ?** Lancez `bun run dev` et testez ! 🚀
