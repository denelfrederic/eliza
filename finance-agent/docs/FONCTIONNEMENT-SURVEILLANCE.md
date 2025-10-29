# Fonctionnement de la Surveillance de Portefeuille

## Vue d'ensemble

La surveillance fonctionne en **mode lecture seule** via des APIs publiques blockchain. Aucune clé privée n'est nécessaire, seule l'adresse publique Ethereum est utilisée.

## Architecture de la Surveillance

### 1. Récupération des Données (APIs Publiques)

**Pourquoi utiliser des APIs publiques ?**
- Les données blockchain sont publiques de toute façon
- Pas besoin de clé privée pour lire les balances
- Sécurité maximale : aucune possibilité d'exécuter des transactions

**Comment ça fonctionne :**

```
Utilisateur demande → Agent déclenche action → Appel API Etherscan → Analyse → Affichage
```

### 2. Flux de Surveillance Détaillé

#### Étape 1 : Récupération du Solde ETH

```typescript
// Appel à l'API Etherscan
GET https://api.etherscan.io/api?module=account&action=balance&address=0x...
```

**Ce qui se passe :**
- L'API Etherscan lit directement la blockchain
- Retourne le solde en Wei (plus petite unité d'ETH)
- Conversion : 1 ETH = 10^18 Wei
- Affichage formaté : "X.XXXXXX ETH"

#### Étape 2 : Récupération des Tokens ERC-20

```typescript
// Récupération des transactions de tokens
GET https://api.etherscan.io/api?module=account&action=tokentx&address=0x...
```

**Ce qui se passe :**
- L'API retourne les transactions de tokens (réceptions et envois)
- Parcours de toutes les transactions pour chaque token
- Calcul du solde actuel :
  - Si `tx.to === votre_adresse` → Ajout au solde
  - Si `tx.from === votre_adresse` → Soustrait du solde
- Filtrage : seuls les tokens avec solde > 0 sont affichés

**Limitation actuelle :**
- L'API Etherscan limite à 100 transactions par requête
- Pour les portefeuilles avec beaucoup d'historique, certains tokens peuvent ne pas apparaître
- Pour une surveillance complète, il faudrait utiliser l'API `tokenbalance` pour chaque token individuellement

#### Étape 3 : Formatage et Affichage

Les données sont formatées pour afficher :
- Solde ETH avec 6 décimales
- Liste des tokens avec :
  - Symbole (ex: USDT, DAI)
  - Nom complet
  - Solde formaté selon les décimales du token
  - Adresse du contrat
- Tri par solde décroissant

## Détection de Rebalancing

### Comment ça fonctionne

L'action `PROPOSER_REBALANCING` :

1. **Récupère les données du portefeuille** (comme `SURVEILLANCE_PORTEFEUILLE`)
2. **Compare avec des allocations cibles** (à définir par l'utilisateur)
3. **Détecte les déviations > 10%**
4. **Propose des ajustements** :
   - Quels tokens vendre
   - Quels tokens acheter
   - Quantités recommandées
   - Justification de chaque ajustement

**État actuel :**
- La détection de déviation n'est pas encore implémentée dans le code
- Elle nécessite de définir des allocations cibles (ex: ETH 40%, USDT 30%, etc.)
- Pour l'instant, l'action affiche un message informatif

## Sécurité et Limitations

### Sécurité ✅

- **Lecture seule** : Utilise uniquement des APIs publiques
- **Pas de clé privée** : Impossible d'exécuter des transactions
- **Pas de signature** : L'agent ne peut pas signer de transactions

### Limitations ⚠️

1. **Précision des balances tokens** :
   - Actuellement calculée depuis les transactions
   - Peut être incomplète pour les portefeuilles avec beaucoup d'historique
   - Solution : Utiliser l'API `tokenbalance` pour chaque token

2. **Pas de prix en temps réel** :
   - Les valeurs en USD ne sont pas calculées
   - Nécessiterait une API de prix (CoinGecko, CoinMarketCap)

3. **Pas de surveillance automatique** :
   - La surveillance se fait uniquement à la demande
   - Pas de monitoring continu en arrière-plan

4. **Multi-chaînes limité** :
   - Supporté conceptuellement mais nécessite différentes APIs selon la chaîne
   - Actuellement optimisé pour Ethereum mainnet

## Améliorations Possibles

### Court terme :
1. Utiliser l'API `tokenbalance` pour des balances précises
2. Ajouter les prix en USD via CoinGecko API
3. Calculer les pourcentages d'allocation automatiquement

### Moyen terme :
1. Définir des allocations cibles configurables
2. Implémenter la détection de déviation > 10%
3. Ajouter des alertes automatiques

### Long terme :
1. Surveillance continue en arrière-plan
2. Support multi-chaînes complet
3. Dashboard web pour visualisation

## Exemple de Requête API

```bash
# Récupérer le solde ETH
curl "https://api.etherscan.io/api?module=account&action=balance&address=0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb&tag=latest&apikey=YourApiKeyToken"

# Réponse :
{
  "status": "1",
  "message": "OK",
  "result": "1000000000000000000"  // 1 ETH en Wei
}
```

## Résumé du Fonctionnement

1. **Déclenchement** : Vous demandez "Montre-moi mon portfolio"
2. **Validation** : L'agent vérifie que `EVM_PUBLIC_KEY` est configuré
3. **Récupération** : Appels à l'API Etherscan pour ETH et tokens
4. **Calcul** : Calcul des balances depuis les transactions
5. **Formatage** : Présentation lisible des données
6. **Affichage** : Message avec liste complète du portefeuille

**Tout cela se fait en lecture seule, sans jamais toucher à votre clé privée !**

