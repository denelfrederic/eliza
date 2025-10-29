# Guide de Configuration Rapide - Agent Surveillance Crypto

## Configuration Minimaliste

Pour configurer rapidement l'agent en mode surveillance, créez un fichier `.env` dans `finance-agent/` avec :

```bash
# Adresse Ethereum à surveiller (OBLIGATOIRE)
EVM_PUBLIC_KEY=0xVotreAdresseEthereum

# Chaîne EVM (OBLIGATOIRE)
EVM_CHAINS=ethereum

# Fournisseur LLM (au moins un requis)
OPENAI_API_KEY=sk-votre-cle-openai
# OU
ANTHROPIC_API_KEY=sk-ant-votre-cle-anthropic

# Base de données (OBLIGATOIRE)
DATABASE_URL=sqlite://./data/eliza.db

# APIs publiques (optionnel mais recommandé pour meilleures performances)
ETHERSCAN_API_KEY=votre-cle-etherscan  # Gratuit sur https://etherscan.io/apis
# OU
ALCHEMY_API_KEY=votre-cle-alchemy  # Gratuit sur https://www.alchemy.com/
```

## Démarrer

```bash
cd finance-agent
bun install  # Plus besoin de @elizaos/plugin-evm
bun run dev
```

## Utilisation

Une fois démarré, demandez à l'agent :

- "Vérifie mon portefeuille"
- "Mon portefeuille a-t-il besoin de rebalancing ?"
- "Analyse mon allocation d'actifs"

## Sécurité

✅ **Mode surveillance uniquement** : L'agent utilise uniquement des APIs publiques (Etherscan, Alchemy) pour lire les données du portefeuille.

⚠️ **NE JAMAIS** configurer `EVM_PRIVATE_KEY` - l'agent fonctionne en mode lecture seule avec uniquement la clé publique.

## Comment obtenir une clé API gratuite

- **Etherscan** : https://etherscan.io/apis (gratuit, 5 requêtes/seconde)
- **Alchemy** : https://www.alchemy.com/ (gratuit jusqu'à 300M requêtes/mois)

## Documentation complète

Voir `docs/SURVEILLANCE-PORTEFEUILLE.md` pour plus de détails.

