import { logger } from '@elizaos/core';
import { AlchemyService, ALCHEMY_CHAIN_ENDPOINTS } from './alchemy.service';

/**
 * Configuration des chaînes EVM supportées
 */
export interface ChainConfig {
  id: number;
  name: string;
  nativeCurrency: string;
  etherscanApiUrl: string;
  supportsAlchemy: boolean;
}

export const SUPPORTED_CHAINS: Record<string, ChainConfig> = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    nativeCurrency: 'ETH',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,
  },
  base: {
    id: 8453,
    name: 'Base',
    nativeCurrency: 'ETH',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    nativeCurrency: 'MATIC',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    nativeCurrency: 'ETH',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    nativeCurrency: 'ETH',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,
  },
  bsc: {
    id: 56,
    name: 'BNB Smart Chain',
    nativeCurrency: 'BNB',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,  // ✅ Alchemy supporte BSC (bnb-mainnet)
  },
  avalanche: {
    id: 43114,
    name: 'Avalanche C-Chain',
    nativeCurrency: 'AVAX',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,  // ✅ Alchemy supporte Avalanche
  },
  fantom: {
    id: 250,
    name: 'Fantom',
    nativeCurrency: 'FTM',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,  // ✅ Alchemy supporte Fantom
  },
  cronos: {
    id: 25,
    name: 'Cronos',
    nativeCurrency: 'CRO',
    etherscanApiUrl: 'https://api.etherscan.io/v2/api',
    supportsAlchemy: true,  // ✅ Alchemy supporte Cronos
  },
};

export interface TokenBalance {
  address: string;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  balanceRaw: string;
}

export interface ChainPortfolio {
  chainName: string;
  chainId: number;
  nativeCurrency: string;
  nativeBalance: string;
  tokens: TokenBalance[];
  error?: string;
}

export interface MultiChainPortfolio {
  address: string;
  chains: ChainPortfolio[];
  totalChains: number;
  chainsWithAssets: number;
  timestamp: Date;
}

/**
 * Service pour récupérer le portfolio sur plusieurs chaînes EVM
 */
export class MultiChainPortfolioService {
  private etherscanApiKey?: string;
  private alchemyApiKey?: string;

  constructor(etherscanApiKey?: string, alchemyApiKey?: string) {
    this.etherscanApiKey = etherscanApiKey;
    this.alchemyApiKey = alchemyApiKey;
  }

  /**
   * Récupère le portfolio complet sur toutes les chaînes spécifiées
   * @param address Adresse Ethereum/EVM
   * @param chains Liste des chaînes à interroger (par défaut: toutes)
   * @returns Portfolio multi-chain
   */
  async getMultiChainPortfolio(
    address: string,
    chains?: string[]
  ): Promise<MultiChainPortfolio> {
    const chainList = chains || Object.keys(SUPPORTED_CHAINS);

    logger.info(`Fetching portfolio for ${address} on ${chainList.length} chains: ${chainList.join(', ')}`);

    // Récupérer le portfolio sur chaque chaîne en parallèle
    const portfolioPromises = chainList.map(async (chainName) => {
      try {
        return await this.getChainPortfolio(address, chainName);
      } catch (error) {
        logger.error(`Error fetching portfolio on ${chainName}: ${error instanceof Error ? error.message : String(error)}`);
        const chainConfig = SUPPORTED_CHAINS[chainName.toLowerCase()];
        return {
          chainName: chainConfig?.name || chainName,
          chainId: chainConfig?.id || 0,
          nativeCurrency: chainConfig?.nativeCurrency || 'UNKNOWN',
          nativeBalance: '0',
          tokens: [],
          error: error instanceof Error ? error.message : String(error),
        };
      }
    });

    const portfolios = await Promise.all(portfolioPromises);

    // Filtrer les chaînes avec des actifs
    const chainsWithAssets = portfolios.filter(
      (p) => parseFloat(p.nativeBalance) > 0 || p.tokens.length > 0
    ).length;

    return {
      address,
      chains: portfolios,
      totalChains: portfolios.length,
      chainsWithAssets,
      timestamp: new Date(),
    };
  }

  /**
   * Récupère le portfolio sur une chaîne spécifique
   * @param address Adresse Ethereum/EVM
   * @param chainName Nom de la chaîne
   * @returns Portfolio de la chaîne
   */
  async getChainPortfolio(address: string, chainName: string): Promise<ChainPortfolio> {
    const chainConfig = SUPPORTED_CHAINS[chainName.toLowerCase()];

    if (!chainConfig) {
      throw new Error(`Chain ${chainName} not supported`);
    }

    logger.info(`Fetching portfolio on ${chainConfig.name} (chainid: ${chainConfig.id})...`);

    // 1. Récupérer le solde natif via Etherscan
    const nativeBalance = await this.getNativeBalance(address, chainConfig);

    // 2. Récupérer les tokens ERC-20
    let tokens: TokenBalance[] = [];
    let tokenError: string | undefined;

    if (chainConfig.supportsAlchemy && this.alchemyApiKey && this.alchemyApiKey !== 'demo') {
      // Utiliser Alchemy si supporté et clé valide disponible
      logger.info(`Using Alchemy for ${chainName} tokens...`);
      try {
        tokens = await this.getTokensViaAlchemy(address, chainName);
      } catch (alchemyError) {
        const errorMsg = alchemyError instanceof Error ? alchemyError.message : String(alchemyError);
        logger.error(`Alchemy failed for ${chainName}: ${errorMsg}`);

        // Message d'erreur explicite selon le type d'erreur
        if (errorMsg.includes('not enabled')) {
          tokenError = `❌ Réseau ${chainConfig.name} non activé sur votre app Alchemy.\n` +
            `   → Activez-le sur : https://dashboard.alchemy.com/apps (section Networks)\n` +
            `   → Ou créez une nouvelle app avec ce réseau activé`;
        } else if (errorMsg.includes('Invalid API')) {
          tokenError = `❌ Clé Alchemy invalide ou expirée.\n` +
            `   → Vérifiez ALCHEMY_API_KEY dans votre .env\n` +
            `   → Obtenez une nouvelle clé sur https://www.alchemy.com/`;
        } else {
          tokenError = `❌ Erreur Alchemy : ${errorMsg}`;
        }
      }
    } else if (!chainConfig.supportsAlchemy) {
      // Chaîne non supportée par Alchemy
      tokenError = `⚠️ ${chainConfig.name} n'est pas supporté par Alchemy.\n` +
        `   → Tokens non disponibles pour cette chaîne\n` +
        `   → Seule la balance native (${chainConfig.nativeCurrency}) est affichée`;
    } else if (!this.alchemyApiKey || this.alchemyApiKey === 'demo') {
      // Pas de clé Alchemy configurée
      tokenError = `⚠️ Clé Alchemy manquante ou en mode demo.\n` +
        `   → Configurez ALCHEMY_API_KEY dans votre .env\n` +
        `   → Obtenez une clé gratuite sur https://www.alchemy.com/`;
    }

    logger.info(`Portfolio on ${chainConfig.name}: ${nativeBalance} ${chainConfig.nativeCurrency}, ${tokens.length} tokens${tokenError ? ' (error: ' + tokenError.substring(0, 50) + '...)' : ''}`);

    return {
      chainName: chainConfig.name,
      chainId: chainConfig.id,
      nativeCurrency: chainConfig.nativeCurrency,
      nativeBalance,
      tokens,
      error: tokenError,
    };
  }

  /**
   * Récupère le solde natif (ETH, MATIC, BNB, etc.) via Etherscan
   */
  private async getNativeBalance(address: string, chainConfig: ChainConfig): Promise<string> {
    const apiKey = this.etherscanApiKey ? `&apikey=${this.etherscanApiKey}` : '';
    const url = `${chainConfig.etherscanApiUrl}?chainid=${chainConfig.id}&module=account&action=balance&address=${address}&tag=latest${apiKey}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === '1' && data.result) {
        const weiAmount = BigInt(data.result);
        const ethAmount = weiAmount / BigInt(10 ** 18);
        const remainder = weiAmount % BigInt(10 ** 18);
        let balance = ethAmount.toString();
        if (remainder > 0n) {
          const decimalsStr = remainder.toString().padStart(18, '0').replace(/0+$/, '');
          if (decimalsStr) {
            balance += '.' + decimalsStr;
          }
        }
        return balance;
      }

      logger.warn(`Failed to get native balance on ${chainConfig.name}: ${data.message || data.result}`);
      return '0';
    } catch (error) {
      logger.error(`Error fetching native balance on ${chainConfig.name}: ${error instanceof Error ? error.message : String(error)}`);
      return '0';
    }
  }

  /**
   * Récupère les tokens via Alchemy
   */
  private async getTokensViaAlchemy(address: string, chainName: string): Promise<TokenBalance[]> {
    const alchemyService = new AlchemyService(this.alchemyApiKey, chainName);

    try {
      const result = await alchemyService.getTokenBalances(address);

      const tokensWithBalance = result.tokenBalances.filter(
        (token) => token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
      );

      logger.info(`Found ${tokensWithBalance.length} tokens with balance on ${chainName}`);

      // Récupérer les métadonnées en parallèle (batches de 5)
      const tokens: TokenBalance[] = [];
      const batchSize = 5;

      for (let i = 0; i < tokensWithBalance.length; i += batchSize) {
        const batch = tokensWithBalance.slice(i, i + batchSize);

        const batchResults = await Promise.allSettled(
          batch.map(async (token) => {
            try {
              const metadata = await alchemyService.getTokenMetadata(token.contractAddress);
              const balance = alchemyService.formatBalance(token.tokenBalance, metadata.decimals);

              if (parseFloat(balance) > 0) {
                return {
                  address: token.contractAddress.toLowerCase(),
                  name: metadata.name || 'Unknown Token',
                  symbol: metadata.symbol || 'UNKNOWN',
                  decimals: metadata.decimals,
                  balance,
                  balanceRaw: token.tokenBalance,
                };
              }
              return null;
            } catch (error) {
              logger.warn(`Failed to get metadata for token ${token.contractAddress}`);
              return null;
            }
          })
        );

        batchResults.forEach((result) => {
          if (result.status === 'fulfilled' && result.value) {
            tokens.push(result.value);
          }
        });

        // Pause entre les batches
        if (i + batchSize < tokensWithBalance.length) {
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
      }

      return tokens;
    } catch (error) {
      logger.error(`Alchemy failed for ${chainName}: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

}
