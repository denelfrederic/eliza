import { logger } from '@elizaos/core';

export interface TokenBalance {
  contractAddress: string;
  tokenBalance: string;
}

export interface AlchemyTokenBalancesResponse {
  address: string;
  tokenBalances: TokenBalance[];
}

export interface TokenMetadata {
  decimals: number;
  logo?: string;
  name: string;
  symbol: string;
}

/**
 * Service Alchemy pour récupérer les balances de tokens ERC-20
 * Documentation: https://docs.alchemy.com/reference/alchemy-gettokenbalances
 */
/**
 * Mapping des chaînes supportées par Alchemy
 */
export const ALCHEMY_CHAIN_ENDPOINTS: Record<string, string> = {
  ethereum: 'eth-mainnet',
  polygon: 'polygon-mainnet',
  arbitrum: 'arb-mainnet',
  optimism: 'opt-mainnet',
  base: 'base-mainnet',
  bsc: 'bnb-mainnet',
  avalanche: 'avax-mainnet',
  fantom: 'fantom-mainnet',
  cronos: 'cronos-mainnet',
  // Alchemy supporte aussi : polygon-amoy, arb-sepolia, opt-sepolia, base-sepolia (testnets)
};

export class AlchemyService {
  private apiKey: string;
  private baseUrl: string;
  private chain: string;

  constructor(apiKey?: string, chain: string = 'ethereum') {
    this.apiKey = apiKey || 'demo'; // Utiliser 'demo' si pas de clé
    this.chain = chain.toLowerCase();

    // Obtenir l'endpoint Alchemy pour cette chaîne
    const alchemyEndpoint = ALCHEMY_CHAIN_ENDPOINTS[this.chain];
    if (!alchemyEndpoint) {
      logger.warn(`Chain ${chain} not supported by Alchemy, defaulting to Ethereum`);
      this.baseUrl = `https://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`;
    } else {
      this.baseUrl = `https://${alchemyEndpoint}.g.alchemy.com/v2/${this.apiKey}`;
    }

    logger.info(`AlchemyService initialized for chain: ${this.chain}, endpoint: ${this.baseUrl.split('/v2/')[0]}`);
  }

  /**
   * Récupère tous les tokens ERC-20 détenus par une adresse
   * @param address Adresse Ethereum
   * @returns Liste des tokens avec leurs balances
   */
  async getTokenBalances(address: string): Promise<AlchemyTokenBalancesResponse> {
    const payload = {
      jsonrpc: '2.0',
      method: 'alchemy_getTokenBalances',
      params: [address, 'DEFAULT_TOKENS'], // DEFAULT_TOKENS = top 100 tokens par volume
      id: 42,
    };

    logger.info(`Calling Alchemy API: alchemy_getTokenBalances for ${address}`);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Alchemy API error: ${data.error.message}`);
    }

    logger.info(`Alchemy API returned ${data.result.tokenBalances.length} token balances`);

    return data.result;
  }

  /**
   * Récupère les métadonnées d'un token (nom, symbole, décimales)
   * @param contractAddress Adresse du contrat du token
   * @returns Métadonnées du token
   */
  async getTokenMetadata(contractAddress: string): Promise<TokenMetadata> {
    const payload = {
      jsonrpc: '2.0',
      method: 'alchemy_getTokenMetadata',
      params: [contractAddress],
      id: 42,
    };

    logger.info(`Calling Alchemy API: alchemy_getTokenMetadata for ${contractAddress}`);

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Alchemy API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    if (data.error) {
      throw new Error(`Alchemy API error: ${data.error.message}`);
    }

    return data.result;
  }

  /**
   * Formatte un balance hexadécimal en nombre décimal
   * @param hexBalance Balance en hexadécimal (ex: "0x5798")
   * @param decimals Nombre de décimales du token
   * @returns Balance formatée en string
   */
  formatBalance(hexBalance: string, decimals: number): string {
    try {
      // Convertir de hex en BigInt
      const balanceWei = BigInt(hexBalance);

      if (balanceWei === 0n) {
        return '0';
      }

      const divisor = BigInt(10 ** decimals);
      const balanceAmount = balanceWei / divisor;
      const remainder = balanceWei % divisor;

      let balanceFormatted = balanceAmount.toString();
      if (remainder > 0n) {
        const decimalsStr = remainder.toString().padStart(decimals, '0').replace(/0+$/, '');
        if (decimalsStr) {
          balanceFormatted += '.' + decimalsStr;
        }
      }

      return balanceFormatted;
    } catch (error) {
      logger.error(`Error formatting balance ${hexBalance}:`, error);
      return '0';
    }
  }
}
