import type { Plugin } from '@elizaos/core';
import {
  type Action,
  type ActionResult,
  type Content,
  type GenerateTextParams,
  type HandlerCallback,
  type IAgentRuntime,
  type Memory,
  ModelType,
  type Provider,
  type ProviderResult,
  Service,
  type State,
  logger,
} from '@elizaos/core';
import { z } from 'zod';

/**
 * Define the configuration schema for the plugin with the following properties:
 *
 * @param {string} EXAMPLE_PLUGIN_VARIABLE - The name of the plugin (min length of 1, optional)
 * @returns {object} - The configured schema object
 */
const configSchema = z.object({
  EXAMPLE_PLUGIN_VARIABLE: z
    .string()
    .min(1, 'Example plugin variable is not provided')
    .optional()
    .transform((val) => {
      if (!val) {
        console.warn('Warning: Example plugin variable is not provided');
      }
      return val;
    }),
});

/**
 * Action pour surveiller le portefeuille crypto et analyser sa composition
 * Mode lecture seule - aucune transaction n'est exécutée
 */
const surveillancePortefeuilleAction: Action = {
  name: 'SURVEILLANCE_PORTEFEUILLE',
  similes: ['MONITOR_PORTFOLIO', 'CHECK_PORTFOLIO', 'ANALYZE_PORTFOLIO', 'PORTFOLIO_STATUS'],
  description:
    'Surveille et analyse la composition du portefeuille crypto Ethereum/EVM. Mode lecture seule - aucune transaction n\'est exécutée. Fournit un rapport détaillé sur les actifs, leurs valeurs, et leurs proportions.',

  validate: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<boolean> => {
    // Toujours permettre l'action pour informer l'utilisateur si la config manque
    // La validation réelle se fait dans le handler
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    logger.info('=== SURVEILLANCE_PORTEFEUILLE handler STARTED ===');
    try {
      logger.info('Handling SURVEILLANCE_PORTEFEUILLE action');

      const publicKey = process.env.EVM_PUBLIC_KEY?.trim();
      logger.info(`EVM_PUBLIC_KEY from env: ${publicKey ? publicKey.substring(0, 10) + '...' : 'NOT SET'}`);
      
      if (!publicKey) {
        const errorMessage = 'Configuration manquante : EVM_PUBLIC_KEY n\'est pas configuré dans votre fichier .env.\n\n' +
          'Pour activer la surveillance de votre portefeuille :\n' +
          '1. Ouvrez le fichier finance-agent/.env\n' +
          '2. Ajoutez la ligne : EVM_PUBLIC_KEY=0xVotreAdresseEthereum\n' +
          '3. Redémarrez l\'agent\n\n' +
          'L\'adresse doit être votre adresse Ethereum publique (commence par 0x).';
        
        logger.warn('EVM_PUBLIC_KEY not configured');
        
        const responseContent: Content = {
          text: errorMessage,
          actions: ['SURVEILLANCE_PORTEFEUILLE'],
          source: message.content.source,
        };

        await callback(responseContent);

        return {
          text: errorMessage,
          values: {
            success: false,
            error: 'EVM_PUBLIC_KEY_NOT_CONFIGURED',
          },
          data: {
            actionName: 'SURVEILLANCE_PORTEFEUILLE',
            messageId: message.id,
            timestamp: Date.now(),
          },
          success: false,
        };
      }

      // Vérifier le format de l'adresse
      if (!publicKey.startsWith('0x') || publicKey.length !== 42) {
        logger.warn(`Invalid address format: ${publicKey}`);
        const errorMessage = `Format d'adresse invalide : ${publicKey}\n\n` +
          'L\'adresse Ethereum doit commencer par 0x et contenir 42 caractères au total (0x + 40 caractères hexadécimaux).\n' +
          'Exemple valide : 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb';
        
        const responseContent: Content = {
          text: errorMessage,
          actions: ['SURVEILLANCE_PORTEFEUILLE'],
          source: message.content.source,
        };

        await callback(responseContent);

        return {
          text: errorMessage,
          values: {
            success: false,
            error: 'INVALID_ADDRESS_FORMAT',
          },
          data: {
            actionName: 'SURVEILLANCE_PORTEFEUILLE',
            messageId: message.id,
            timestamp: Date.now(),
          },
          success: false,
        };
      }

      // Utilisation d'APIs publiques pour lire les données du portefeuille
      // Etherscan API V2 (gratuite) - Documentation: https://docs.etherscan.io/introduction
      const rawApiKey = process.env.ETHERSCAN_API_KEY?.trim();
      const chainsConfig = process.env.EVM_CHAINS?.trim() || 'ethereum';

      // Parser la configuration des chaînes
      let chainsToQuery: string[] = [];
      if (chainsConfig.toLowerCase() === 'all') {
        // Importer la liste complète des chaînes supportées
        const { SUPPORTED_CHAINS } = await import('./services/multi-chain-portfolio.service');
        chainsToQuery = Object.keys(SUPPORTED_CHAINS);
        logger.info(`Multi-chain mode enabled: scanning all ${chainsToQuery.length} supported chains`);
      } else {
        // Chaînes spécifiques séparées par des virgules
        chainsToQuery = chainsConfig.split(',').map(c => c.trim().toLowerCase());
        logger.info(`Multi-chain mode: scanning ${chainsToQuery.length} chain(s): ${chainsToQuery.join(', ')}`);
      }

      // Ne pas utiliser "YourApiKeyToken" comme valeur par défaut - c'est déprécié
      const etherscanApiKey = rawApiKey && rawApiKey !== 'YourApiKeyToken' ? rawApiKey : undefined;
      const hasApiKey = !!etherscanApiKey;
      const alchemyApiKey = process.env.ALCHEMY_API_KEY?.trim() || 'demo';

      logger.info(`Configuration: chains=${chainsToQuery.join(',')}, hasEtherscanKey=${hasApiKey}, hasAlchemyKey=${alchemyApiKey !== 'demo'}`);

      // Envoyer une réponse immédiate pour informer l'utilisateur que le traitement est en cours
      const chainText = chainsToQuery.length > 1
        ? `Analyse multi-chain sur ${chainsToQuery.length} réseaux (${chainsToQuery.join(', ')})...`
        : `Analyse de votre portefeuille sur ${chainsToQuery[0]}...`;

      await callback({
        text: `🔄 Récupération des données de portefeuille en cours...\n\n${chainText}`,
        actions: ['SURVEILLANCE_PORTEFEUILLE'],
        source: message.content.source,
      });

      // ===== MODE MULTI-CHAIN =====
      if (chainsToQuery.length > 1) {
        logger.info('Using multi-chain portfolio service...');

        try {
          const { MultiChainPortfolioService } = await import('./services/multi-chain-portfolio.service');
          const multiChainService = new MultiChainPortfolioService(etherscanApiKey, alchemyApiKey);

          const multiPortfolio = await multiChainService.getMultiChainPortfolio(publicKey, chainsToQuery);

          logger.info(`Multi-chain portfolio retrieved: ${multiPortfolio.chainsWithAssets} chains with assets out of ${multiPortfolio.totalChains}`);

          // Construire le message multi-chain
          let portfolioText = `📊 **Votre Portefeuille Multi-Chain**\n\n`;
          portfolioText += `Adresse : \`${publicKey}\`\n`;
          portfolioText += `Chaînes scannées : ${multiPortfolio.totalChains}\n`;
          portfolioText += `Chaînes avec actifs : ${multiPortfolio.chainsWithAssets}\n`;
          portfolioText += `Mode : Lecture seule (surveillance uniquement)\n\n`;
          portfolioText += `---\n\n`;

          // Afficher chaque chaîne avec des actifs
          multiPortfolio.chains.forEach((chain) => {
            const hasNative = parseFloat(chain.nativeBalance) > 0;
            const hasTokens = chain.tokens.length > 0;

            if (!hasNative && !hasTokens && !chain.error) {
              return; // Skip chaînes sans actifs
            }

            portfolioText += `## 🔗 ${chain.chainName}\n\n`;

            // Balance native
            if (hasNative) {
              portfolioText += `**${chain.nativeCurrency}**\n`;
              portfolioText += `Solde : ${chain.nativeBalance} ${chain.nativeCurrency}\n\n`;
            }

            // Tokens ERC-20
            if (hasTokens) {
              portfolioText += `**Tokens (${chain.tokens.length})**\n\n`;
              chain.tokens.forEach((token, index) => {
                portfolioText += `${index + 1}. **${token.symbol}** (${token.name})\n`;
                portfolioText += `   Solde : ${parseFloat(token.balance).toLocaleString('fr-FR', { maximumFractionDigits: 6 })} ${token.symbol}\n`;
                portfolioText += `   Adresse : \`${token.address}\`\n\n`;
              });
            } else if (chain.error) {
              // Afficher l'erreur seulement s'il n'y a pas de tokens
              portfolioText += `**Tokens**\n${chain.error}\n\n`;
            }

            if (!hasNative && !hasTokens && !chain.error) {
              portfolioText += `Aucun actif détecté\n\n`;
            }

            portfolioText += `---\n\n`;
          });

          // Statistiques globales
          const totalAssets = multiPortfolio.chains.reduce((sum, chain) => {
            const nativeCount = parseFloat(chain.nativeBalance) > 0 ? 1 : 0;
            return sum + nativeCount + chain.tokens.length;
          }, 0);

          portfolioText += `📈 **Résumé Global**\n\n`;
          portfolioText += `Total d'actifs : ${totalAssets}\n`;
          portfolioText += `Réseaux actifs : ${multiPortfolio.chainsWithAssets}/${multiPortfolio.totalChains}\n\n`;

          portfolioText += `💡 **Note :** Pour voir uniquement une chaîne, configurez \`EVM_CHAINS=ethereum\` dans votre .env\n`;

          // Ajouter les statistiques d'utilisation API
          try {
            const { openaiTracker } = await import('./services/openai-tracker.service');
            const compactSummary = openaiTracker.generateCompactSummary();
            if (compactSummary) {
              portfolioText += compactSummary;
            }
          } catch (err) {
            logger.warn('Could not fetch API stats:', err);
          }

          const responseContent: Content = {
            text: portfolioText,
            actions: ['SURVEILLANCE_PORTEFEUILLE'],
            source: message.content.source,
          };

          await callback(responseContent);

          return {
            text: 'Surveillance multi-chain du portefeuille terminée',
            values: {
              success: true,
              publicKey,
              mode: 'multi-chain',
              chains: multiPortfolio.totalChains,
              chainsWithAssets: multiPortfolio.chainsWithAssets,
            },
            data: {
              actionName: 'SURVEILLANCE_PORTEFEUILLE',
              messageId: message.id,
              timestamp: Date.now(),
              multiPortfolio,
            },
            success: true,
          };
        } catch (multiChainError) {
          logger.error(`Multi-chain portfolio failed: ${multiChainError instanceof Error ? multiChainError.message : String(multiChainError)}`);
          // Fallback : continuer avec le mode single-chain sur la première chaîne
          logger.info('Falling back to single-chain mode on first chain...');
        }
      }

      // ===== MODE SINGLE-CHAIN (code original) =====
      const chainName = chainsToQuery[0] || 'ethereum';
      const chainIdMap: Record<string, number> = {
        'ethereum': 1,
        'base': 8453,
        'bsc': 56,
        'polygon': 137,
        'arbitrum': 42161,
        'optimism': 10,
        'avalanche': 43114,
        'fantom': 250,
        'cronos': 25,
      };
      const chainid = chainIdMap[chainName.toLowerCase()] || 1;
      const apiUrl = 'https://api.etherscan.io/v2/api';

      logger.info(`Single-chain mode: ${chainName} (chainid: ${chainid})`);

      // Construire l'URL avec chainid et clé API (V2 nécessite une clé API)
      const ethBalanceUrl = hasApiKey
        ? `${apiUrl}?chainid=${chainid}&module=account&action=balance&address=${publicKey}&tag=latest&apikey=${etherscanApiKey}`
        : `${apiUrl}?chainid=${chainid}&module=account&action=balance&address=${publicKey}&tag=latest`;

      let ethBalance = '0';
      let tokenList: any[] = [];
      let apiErrorDetails: any = null;
      
      try {
        // Appel à l'API Etherscan pour récupérer le solde ETH
        const maskedUrl = hasApiKey 
          ? ethBalanceUrl.replace(etherscanApiKey!, '***')
          : ethBalanceUrl;
        logger.info(`Calling Etherscan API: ${maskedUrl}`);
        // Vérifier que fetch est disponible
        if (typeof fetch === 'undefined') {
          logger.error('fetch is not available in this environment');
          throw new Error('fetch API not available');
        }
        
        logger.info('Making fetch request...');
        const balanceResponse = await fetch(ethBalanceUrl);
        logger.info(`Response status: ${balanceResponse.status}, ok: ${balanceResponse.ok}`);
        
        const balanceData = await balanceResponse.json();
        const errorMessage = balanceData.message || balanceData.result || 'No error message';
        logger.info(`ETH balance API response - status: ${balanceData.status}, message: ${errorMessage}, result: ${typeof balanceData.result === 'string' ? balanceData.result.substring(0, 100) : JSON.stringify(balanceData.result)}`);
        
        // Si l'API retourne une erreur, le message peut être dans result ou message
        if (balanceData.status === '1' && balanceData.result && typeof balanceData.result === 'string' && !balanceData.result.toLowerCase().includes('error')) {
          try {
            // Convertir de Wei en ETH (1 ETH = 10^18 Wei)
            const weiAmount = BigInt(balanceData.result);
            const ethAmount = weiAmount / BigInt(10 ** 18);
            const remainder = weiAmount % BigInt(10 ** 18);
            ethBalance = ethAmount.toString() + '.' + remainder.toString().padStart(18, '0').replace(/0+$/, '').replace(/\.$/, '');
            logger.info(`Converted ETH balance: ${ethBalance} ETH`);
          } catch (conversionError) {
            logger.error({ error: conversionError, result: balanceData.result }, 'Error converting Wei to ETH');
            ethBalance = '0';
          }
        } else {
          // Le message d'erreur peut être dans result ou message
          const errorMsg = balanceData.message || balanceData.result || 'Unknown error';
          logger.warn(`ETH balance API returned status: ${balanceData.status}, message: ${errorMsg}`);
          logger.warn(`Full API response: ${JSON.stringify(balanceData)}`);
          
          // Si l'API retourne une erreur, capturer le message pour l'afficher à l'utilisateur
          if (!apiErrorDetails) {
            apiErrorDetails = `Etherscan API Error: ${errorMsg}`;
          }
          
          // Si le message indique que la clé API est dépréciée ou invalide, suggérer de la vérifier
          if (errorMsg.toLowerCase().includes('deprecated') || errorMsg.toLowerCase().includes('invalid') || errorMsg.toLowerCase().includes('api key')) {
            apiErrorDetails += ` - Vérifiez que votre clé API Etherscan est valide et active`;
          }
        }
        
        // Récupérer directement tous les tokens ERC-20 avec leurs balances
        // Utiliser l'endpoint addresstokenbalance de l'API V2
        // Documentation: https://docs.etherscan.io/etherscan-v2/api-endpoints/tokens
        const requestTimeout = 10000; // 10 secondes max par requête
        
        // Fonction helper pour fetch avec timeout
        const fetchWithTimeout = async (url: string, timeout: number = requestTimeout) => {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), timeout);
          
          try {
            const response = await fetch(url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return response;
          } catch (error) {
            clearTimeout(timeoutId);
            if (error instanceof Error && error.name === 'AbortError') {
              throw new Error(`Request timeout after ${timeout}ms`);
            }
            throw error;
          }
        };
        
        // Stratégie de récupération des tokens:
        // 1. Essayer l'endpoint Etherscan addresstokenbalance (nécessite API PRO)
        // 2. Si échec (API gratuite), utiliser Alchemy comme fallback

        let useAlchemyFallback = false;
        let tokenPage = 1;
        const maxTokenPages = 10;
        const tokensPerPage = 100;
        let hasMoreTokenPages = true;
        const allTokens: any[] = [];

        // Tentative avec Etherscan PRO endpoint
        if (hasApiKey) {
          const tokenListUrl = `${apiUrl}?chainid=${chainid}&module=account&action=addresstokenbalance&address=${publicKey}&page=1&offset=10&apikey=${etherscanApiKey}`;

          logger.info(`Testing Etherscan PRO endpoint: addresstokenbalance...`);

          try {
            const testResponse = await fetchWithTimeout(tokenListUrl, 5000);
            const testData = await testResponse.json();

            // Vérifier si l'endpoint PRO est disponible
            if (testData.status === '0' && testData.result?.toLowerCase().includes('api pro')) {
              logger.warn(`Etherscan PRO endpoint not available: ${testData.result}`);
              useAlchemyFallback = true;
            } else if (testData.status === '1') {
              logger.info(`Etherscan PRO endpoint available, using it...`);
              // L'endpoint fonctionne, continuer avec Etherscan
            } else {
              logger.warn(`Etherscan endpoint returned unexpected status: ${testData.status}, falling back to Alchemy`);
              useAlchemyFallback = true;
            }
          } catch (testError) {
            logger.error(`Error testing Etherscan PRO endpoint: ${testError instanceof Error ? testError.message : String(testError)}`);
            useAlchemyFallback = true;
          }
        } else {
          logger.info(`No Etherscan API key provided, using Alchemy fallback`);
          useAlchemyFallback = true;
        }

        // Utiliser Alchemy si Etherscan PRO n'est pas disponible
        if (useAlchemyFallback) {
          logger.info(`Using Alchemy API as fallback for token balances...`);

          try {
            // Import dynamique du service Alchemy
            const { AlchemyService } = await import('./services/alchemy.service');
            const alchemyApiKey = process.env.ALCHEMY_API_KEY || 'demo';
            const alchemyService = new AlchemyService(alchemyApiKey);

            // Récupérer les balances de tokens
            const alchemyResult = await alchemyService.getTokenBalances(publicKey);

            logger.info(`Alchemy returned ${alchemyResult.tokenBalances.length} token balances`);

            // Filtrer les tokens avec balance > 0 et récupérer leurs métadonnées
            const tokensWithBalance = alchemyResult.tokenBalances.filter(
              (token: any) => token.tokenBalance !== '0x0000000000000000000000000000000000000000000000000000000000000000'
            );

            logger.info(`Found ${tokensWithBalance.length} tokens with balance > 0`);

            // Récupérer les métadonnées pour chaque token en parallèle (par batches de 5)
            const batchSize = 5;
            for (let i = 0; i < tokensWithBalance.length; i += batchSize) {
              const batch = tokensWithBalance.slice(i, i + batchSize);

              const metadataPromises = batch.map(async (token: any) => {
                try {
                  const metadata = await alchemyService.getTokenMetadata(token.contractAddress);
                  const balance = alchemyService.formatBalance(token.tokenBalance, metadata.decimals);

                  if (parseFloat(balance) > 0) {
                    return {
                      address: token.contractAddress.toLowerCase(),
                      name: metadata.name || 'Unknown Token',
                      symbol: metadata.symbol || 'UNKNOWN',
                      decimals: metadata.decimals,
                      balance: balance,
                      balanceRaw: token.tokenBalance,
                    };
                  }
                  return null;
                } catch (metadataError) {
                  logger.warn(`Failed to get metadata for token ${token.contractAddress}: ${metadataError instanceof Error ? metadataError.message : String(metadataError)}`);
                  return null;
                }
              });

              const batchResults = await Promise.all(metadataPromises);
              const validTokens = batchResults.filter((t: any) => t !== null);
              allTokens.push(...validTokens);

              // Pause entre les batches pour respecter les rate limits
              if (i + batchSize < tokensWithBalance.length) {
                await new Promise(resolve => setTimeout(resolve, 200));
              }
            }

            logger.info(`Successfully retrieved ${allTokens.length} tokens with balance > 0 via Alchemy`);
          } catch (alchemyError) {
            logger.error(`Alchemy fallback failed: ${alchemyError instanceof Error ? alchemyError.message : String(alchemyError)}`);
            apiErrorDetails = `Failed to retrieve token list from both Etherscan and Alchemy: ${alchemyError instanceof Error ? alchemyError.message : String(alchemyError)}`;
          }
        } else {
          // Continuer avec Etherscan PRO (code original)
          while (hasMoreTokenPages && tokenPage <= maxTokenPages) {
            const tokenListUrl = `${apiUrl}?chainid=${chainid}&module=account&action=addresstokenbalance&address=${publicKey}&page=${tokenPage}&offset=${tokensPerPage}&apikey=${etherscanApiKey}`;

            logger.info(`Fetching token list page ${tokenPage} using Etherscan addresstokenbalance...`);

            try {
              const tokenListResponse = await fetchWithTimeout(tokenListUrl);
              const tokenListData = await tokenListResponse.json();

              const tokenErrorMsg = tokenListData.message || tokenListData.result || 'No error message';
              logger.info(`Token list API response page ${tokenPage} - status: ${tokenListData.status}, message: ${tokenErrorMsg}`);

              if (tokenListData.status !== '1') {
                logger.error(`Token list API error page ${tokenPage}`);
                apiErrorDetails = `Etherscan API Error: ${tokenErrorMsg}`;
                hasMoreTokenPages = false;
                break;
              }

              if (tokenListData.result && Array.isArray(tokenListData.result)) {
                tokenListData.result.forEach((tokenData: any) => {
                  const tokenAddress = (tokenData.TokenAddress || tokenData.contractAddress || tokenData.address)?.toLowerCase();
                  const tokenName = tokenData.TokenName || tokenData.tokenName || tokenData.name || 'Unknown Token';
                  const tokenSymbol = tokenData.TokenSymbol || tokenData.tokenSymbol || tokenData.symbol || 'UNKNOWN';
                  const tokenDecimals = parseInt(tokenData.TokenDecimal || tokenData.tokenDecimal || tokenData.decimals || '18');
                  const tokenQuantity = tokenData.TokenQuantity || tokenData.tokenQuantity || tokenData.quantity || tokenData.balance || '0';

                  if (!tokenAddress || tokenAddress === '0x') return;

                  try {
                    const balanceWei = BigInt(tokenQuantity);

                    if (balanceWei > 0n) {
                      const divisor = BigInt(10 ** tokenDecimals);
                      const balanceAmount = balanceWei / divisor;
                      const remainder = balanceWei % divisor;

                      let balanceFormatted = balanceAmount.toString();
                      if (remainder > 0n) {
                        const decimalsStr = remainder.toString().padStart(tokenDecimals, '0').replace(/0+$/, '');
                        if (decimalsStr) {
                          balanceFormatted += '.' + decimalsStr;
                        }
                      }

                      allTokens.push({
                        address: tokenAddress,
                        name: tokenName,
                        symbol: tokenSymbol,
                        decimals: tokenDecimals,
                        balance: balanceFormatted,
                        balanceRaw: balanceWei.toString(),
                      });

                      logger.info(`Found token: ${tokenSymbol} - Balance: ${balanceFormatted}`);
                    }
                  } catch (conversionError) {
                    logger.warn(`Failed to parse token balance for ${tokenSymbol}`);
                  }
                });

                logger.info(`Page ${tokenPage}: Found ${allTokens.length} tokens with balance > 0 so far`);

                if (tokenListData.result.length < tokensPerPage) {
                  hasMoreTokenPages = false;
                } else {
                  tokenPage++;
                  await new Promise(resolve => setTimeout(resolve, 500));
                }
              } else {
                hasMoreTokenPages = false;
              }
            } catch (pageError) {
              logger.error(`Error fetching token list page ${tokenPage}: ${pageError instanceof Error ? pageError.message : String(pageError)}`);
              hasMoreTokenPages = false;
            }
          }

          logger.info(`Successfully retrieved ${allTokens.length} tokens via Etherscan PRO`);
        }

        // Trier les tokens par balance (décroissant)
        tokenList = allTokens.sort((a: any, b: any) => {
          const balanceA = parseFloat(a.balance || '0');
          const balanceB = parseFloat(b.balance || '0');
          return balanceB - balanceA;
        });

        if (tokenList.length === 0 && !apiErrorDetails) {
          logger.info(`No tokens with balance > 0 found in this address`);
        }
        
        logger.info(`Retrieved portfolio data: ETH balance: ${ethBalance}, Tokens with balance: ${tokenList.length}`);
      } catch (apiError) {
        logger.error(`Failed to fetch data from Etherscan API: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
        logger.error(`Stack trace: ${apiError instanceof Error ? apiError.stack : 'none'}`);
        apiErrorDetails = apiError instanceof Error ? apiError.message : String(apiError);
      }
      
      logger.info(`Final data before formatting: ethBalance=${ethBalance}, tokenList.length=${tokenList.length}, apiErrorDetails=${apiErrorDetails || 'none'}`);

      // Construire le message avec la liste complète du portefeuille
      let portfolioText = `📊 **Votre Portefeuille Ethereum**\n\n`;
      portfolioText += `Adresse : \`${publicKey}\`\n`;
      portfolioText += `Chaîne : ${chainName} (chainid: ${chainid})\n`;
      portfolioText += `API : Etherscan V2 (${apiUrl})\n`;
      portfolioText += `Mode : Lecture seule (surveillance uniquement)\n\n`;
      portfolioText += `---\n\n`;
      
      // Afficher le solde ETH
      const ethBalanceNum = parseFloat(ethBalance);
      portfolioText += `**ETH (Ethereum)**\n`;
      if (ethBalanceNum > 0) {
        portfolioText += `Solde : ${ethBalance} ETH\n`;
        // Essayer de convertir en USD si possible (approximation)
        const ethPrice = 4000; // Prix approximatif, à remplacer par une vraie API
        const ethValueUSD = (ethBalanceNum * ethPrice).toFixed(2);
        portfolioText += `Valeur estimée : ~$${ethValueUSD} (à ${ethPrice}$/ETH)\n\n`;
      } else {
        portfolioText += `Solde : 0 ETH\n\n`;
      }
      
      // Afficher les tokens
      if (tokenList.length > 0) {
        portfolioText += `**Tokens ERC-20 (${tokenList.length})**\n\n`;
        tokenList.forEach((token: any, index: number) => {
          portfolioText += `${index + 1}. **${token.symbol}** (${token.name})\n`;
          portfolioText += `   Solde : ${parseFloat(token.balance).toLocaleString('fr-FR', { maximumFractionDigits: 6 })} ${token.symbol}\n`;
          portfolioText += `   Adresse : \`${token.address}\`\n\n`;
        });
      } else {
        portfolioText += `**Tokens ERC-20**\n`;
        if (apiErrorDetails) {
          portfolioText += `❌ Erreur lors de la récupération : ${apiErrorDetails}\n\n`;
          portfolioText += `**Diagnostic :**\n`;
          portfolioText += `- L'API Etherscan V2 nécessite une clé API valide (obligatoire)\n`;
          portfolioText += `- Obtenez une clé API gratuite sur https://etherscan.io/apis\n`;
          portfolioText += `- Configurez ETHERSCAN_API_KEY dans votre .env\n`;
          portfolioText += `- Erreurs courantes : clé invalide, limite de taux dépassée (5 req/s pour API gratuite), adresse incorrecte\n`;
          portfolioText += `- Documentation API V2 : https://docs.etherscan.io/introduction\n\n`;
          portfolioText += `**Vérification rapide :**\n`;
          portfolioText += `1. Vérifiez votre clé API sur Etherscan : https://etherscan.io/myapikey\n`;
          portfolioText += `2. Testez l'API V2 directement : curl "https://api.etherscan.io/v2/api?chainid=${chainid}&module=account&action=balance&address=${publicKey}&tag=latest&apikey=VOTRE_CLE"\n\n`;
        } else {
          portfolioText += `Aucun token avec solde détecté dans ce portefeuille.\n\n`;
        }
      }
      
      portfolioText += `---\n\n`;
      portfolioText += `📈 **Analyse**\n`;
      
      // Calculer les statistiques
      const totalAssets = tokenList.length + (ethBalanceNum > 0 ? 1 : 0);
      if (totalAssets > 0) {
        portfolioText += `Total d'actifs différents : ${totalAssets}\n`;
        if (ethBalanceNum > 0) {
          portfolioText += `• ETH : ${ethBalance} ETH\n`;
        }
        if (tokenList.length > 0) {
          portfolioText += `• ${tokenList.length} token(s) ERC-20 détenu(s)\n`;
        }
        // Afficher ce message seulement si la clé API n'est pas configurée
        if (!hasApiKey) {
          portfolioText += `\n💡 Pour une analyse plus détaillée avec les valeurs en USD précises et les pourcentages d'allocation, configurez ETHERSCAN_API_KEY dans votre .env\n`;
        } else {
          portfolioText += `\n💡 Les valeurs en USD et pourcentages d'allocation seront disponibles dans une prochaine mise à jour\n`;
        }
      } else {
        portfolioText += `Portefeuille vide ou aucune donnée récupérée.\n`;
        if (apiErrorDetails) {
          portfolioText += `\n⚠️ **Erreur API détectée** : ${apiErrorDetails}\n\n`;
          portfolioText += `**Solutions possibles :**\n`;
          portfolioText += `1. Vérifiez que votre clé API Etherscan est valide\n`;
          portfolioText += `2. Attendez quelques secondes et réessayez (limite de taux)\n`;
          portfolioText += `3. Vérifiez que l'adresse ${publicKey} est correcte et existe sur Ethereum\n`;
          portfolioText += `4. Visitez https://etherscan.io/address/${publicKey} pour vérifier manuellement\n\n`;
        }
      }
      
      if (!hasApiKey) {
        portfolioText += `\n⚠️ **ACTION REQUISE** : L'API Etherscan V2 nécessite une clé API valide\n`;
        portfolioText += `- Obtenez une clé API gratuite sur https://etherscan.io/apis\n`;
        portfolioText += `- Ajoutez ETHERSCAN_API_KEY=votre_cle dans votre fichier .env\n`;
        portfolioText += `- Documentation : https://docs.etherscan.io/introduction\n`;
        portfolioText += `- Migration V1 → V2 : https://docs.etherscan.io/resources/v2-migration\n`;
      } else {
        portfolioText += `\n✅ Clé API Etherscan V2 configurée\n`;
      }

      // Ajouter les statistiques d'utilisation API
      try {
        const { openaiTracker } = await import('./services/openai-tracker.service');
        const compactSummary = openaiTracker.generateCompactSummary();
        if (compactSummary) {
          portfolioText += compactSummary;
        }
      } catch (err) {
        logger.warn('Could not fetch API stats:', err);
      }
      
      const responseContent: Content = {
        text: portfolioText,
        actions: ['SURVEILLANCE_PORTEFEUILLE'],
        source: message.content.source,
      };

      await callback(responseContent);

      return {
        text: 'Surveillance du portefeuille initiée',
        values: {
          success: true,
          publicKey,
          mode: 'read-only',
        },
        data: {
          actionName: 'SURVEILLANCE_PORTEFEUILLE',
          messageId: message.id,
          timestamp: Date.now(),
          publicKey,
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, 'Error in SURVEILLANCE_PORTEFEUILLE action:');

      return {
        text: 'Échec de la surveillance du portefeuille',
        values: {
          success: false,
          error: 'SURVEILLANCE_FAILED',
        },
        data: {
          actionName: 'SURVEILLANCE_PORTEFEUILLE',
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Peux-tu vérifier l\'état de mon portefeuille ?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Surveillance du portefeuille en cours...',
          actions: ['SURVEILLANCE_PORTEFEUILLE'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Analyse mon allocation d\'actifs crypto',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Analyse de l\'allocation en cours...',
          actions: ['SURVEILLANCE_PORTEFEUILLE'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Montre-moi mon portfolio',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Affichage de votre portefeuille...',
          actions: ['SURVEILLANCE_PORTEFEUILLE'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Quel est mon portefeuille ?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Analyse de votre portefeuille en cours...',
          actions: ['SURVEILLANCE_PORTEFEUILLE'],
        },
      },
    ],
  ],
};

/**
 * Action pour proposer des rebalancings quand la déviation dépasse 10%
 * IMPORTANT: Cette action ne fait QUE proposer, jamais exécuter de transactions
 */
const proposerRebalancingAction: Action = {
  name: 'PROPOSER_REBALANCING',
  similes: [
    'REBALANCE_PORTFOLIO',
    'PROPOSE_REBALANCING',
    'SUGGEST_REBALANCING',
    'REBALANCING_PROPOSAL',
  ],
  description:
    'Analyse le portefeuille et propose des actions de rebalancing si une déviation supérieure à 10% est détectée. IMPORTANT: Mode proposition uniquement - AUCUNE transaction n\'est exécutée automatiquement. Les propositions incluent les actifs à vendre/acheter et les quantités recommandées.',

  validate: async (
    runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<boolean> => {
    const publicKey = process.env.EVM_PUBLIC_KEY?.trim();
    if (!publicKey) {
      logger.warn('EVM_PUBLIC_KEY not configured - rebalancing proposal unavailable');
      return false;
    }
    return true;
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info('Handling PROPOSER_REBALANCING action');

      const publicKey = process.env.EVM_PUBLIC_KEY?.trim();
      if (!publicKey) {
        throw new Error('EVM_PUBLIC_KEY not configured');
      }

      const threshold = 10; // Seuil de 10% de déviation

      let responseText = `Analyse du portefeuille pour détecter les besoins de rebalancing...\n\n` +
          `Seuil de détection: ${threshold}% de déviation\n` +
          `Mode: PROPOSITION UNIQUEMENT (aucune transaction ne sera exécutée)\n\n` +
          `Je vais comparer l'allocation actuelle avec les cibles définies et proposer des ajustements spécifiques si nécessaire. ` +
          `Chaque proposition inclura:\n` +
          `- Les actifs à ajuster\n` +
          `- Les quantités recommandées (vendues/achetées)\n` +
          `- La justification de chaque ajustement\n\n` +
          `RAPPEL IMPORTANT: Ces propositions sont informatives uniquement. Vous devez exécuter manuellement toute transaction.`;

      // Ajouter les statistiques d'utilisation API
      try {
        const { openaiTracker } = await import('./services/openai-tracker.service');
        const compactSummary = openaiTracker.generateCompactSummary();
        if (compactSummary) {
          responseText += compactSummary;
        }
      } catch (err) {
        logger.warn('Could not fetch API stats:', err);
      }

      const responseContent: Content = {
        text: responseText,
        actions: ['PROPOSER_REBALANCING'],
        source: message.content.source,
      };

      await callback(responseContent);

      return {
        text: 'Analyse de rebalancing terminée - propositions générées',
        values: {
          success: true,
          threshold,
          mode: 'proposal-only',
          publicKey,
        },
        data: {
          actionName: 'PROPOSER_REBALANCING',
          messageId: message.id,
          timestamp: Date.now(),
          threshold,
          publicKey,
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, 'Error in PROPOSER_REBALANCING action:');

      return {
        text: 'Échec de l\'analyse de rebalancing',
        values: {
          success: false,
          error: 'REBALANCING_PROPOSAL_FAILED',
        },
        data: {
          actionName: 'PROPOSER_REBALANCING',
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Mon portefeuille a-t-il besoin d\'être rééquilibré ?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Analyse en cours...',
          actions: ['PROPOSER_REBALANCING'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Que proposes-tu comme ajustements pour mon portefeuille ?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Génération de propositions de rebalancing...',
          actions: ['PROPOSER_REBALANCING'],
        },
      },
    ],
  ],
};

/**
 * Action pour afficher les statistiques d'utilisation de l'API OpenAI
 * Permet de surveiller la consommation de tokens et les coûts
 */
const showApiStatsAction: Action = {
  name: 'SHOW_API_STATS',
  similes: ['API_STATS', 'SHOW_STATS', 'API_USAGE', 'TOKEN_USAGE', 'CONSUMPTION'],
  description:
    'Affiche les statistiques d\'utilisation de l\'API OpenAI : nombre d\'appels, tokens consommés, et coûts estimés pour la session en cours.',

  validate: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<boolean> => {
    return true; // Toujours disponible
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    _state: State,
    _options: any,
    callback: HandlerCallback,
    _responses: Memory[]
  ): Promise<ActionResult> => {
    try {
      logger.info('Handling SHOW_API_STATS action');

      // Importer dynamiquement le service de tracking
      const { openaiTracker } = await import('./services/openai-tracker.service');

      // Générer le rapport complet
      const report = openaiTracker.generateReport();

      // Vérifier les seuils d'alerte
      const threshold = openaiTracker.checkThresholds();
      let fullReport = report;
      
      if (threshold?.alert) {
        fullReport = threshold.message + '\n\n' + report;
      }

      // Ajouter des recommandations d'optimisation
      const { openaiInterceptor } = await import('./services/openai-interceptor.service');
      const recommendations = openaiInterceptor.generateOptimizationRecommendations();
      
      if (recommendations.length > 0) {
        fullReport += '\n**💡 Recommandations d\'optimisation**\n';
        recommendations.forEach(rec => {
          fullReport += `\n${rec}`;
        });
      }

      const responseContent: Content = {
        text: fullReport,
        actions: ['SHOW_API_STATS'],
        source: message.content.source,
      };

      await callback(responseContent);

      return {
        text: 'Statistiques API affichées',
        values: {
          success: true,
          stats: openaiTracker.getAllStats(),
        },
        data: {
          actionName: 'SHOW_API_STATS',
          messageId: message.id,
          timestamp: Date.now(),
        },
        success: true,
      };
    } catch (error) {
      logger.error({ error }, 'Error in SHOW_API_STATS action:');

      const errorContent: Content = {
        text: `Erreur lors de la récupération des statistiques : ${error instanceof Error ? error.message : String(error)}`,
        actions: ['SHOW_API_STATS'],
      };

      await callback(errorContent);

      return {
        text: errorContent.text,
        values: {
          success: false,
          error: error instanceof Error ? error.message : String(error),
        },
        data: {
          actionName: 'SHOW_API_STATS',
          error: error instanceof Error ? error.message : String(error),
        },
        success: false,
        error: error instanceof Error ? error : new Error(String(error)),
      };
    }
  },

  examples: [
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Montre-moi les stats API',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Récupération des statistiques en cours...',
          actions: ['SHOW_API_STATS'],
        },
      },
    ],
    [
      {
        name: '{{name1}}',
        content: {
          text: 'Combien de tokens j\'ai consommé ?',
        },
      },
      {
        name: '{{name2}}',
        content: {
          text: 'Affichage de la consommation...',
          actions: ['SHOW_API_STATS'],
        },
      },
    ],
  ],
};

/**
 * Example Hello World Provider
 * This demonstrates the simplest possible provider implementation
 */
const helloWorldProvider: Provider = {
  name: 'HELLO_WORLD_PROVIDER',
  description: 'A simple example provider',

  get: async (
    _runtime: IAgentRuntime,
    _message: Memory,
    _state: State
  ): Promise<ProviderResult> => {
    return {
      text: 'I am a provider',
      values: {},
      data: {},
    };
  },
};

export class StarterService extends Service {
  static serviceType = 'starter';
  capabilityDescription =
    'This is a starter service which is attached to the agent through the starter plugin.';

  constructor(runtime: IAgentRuntime) {
    super(runtime);
  }

  static async start(runtime: IAgentRuntime) {
    logger.info('*** Starting starter service ***');
    const service = new StarterService(runtime);
    return service;
  }

  static async stop(runtime: IAgentRuntime) {
    logger.info('*** Stopping starter service ***');
    // get the service from the runtime
    const service = runtime.getService(StarterService.serviceType);
    if (!service) {
      throw new Error('Starter service not found');
    }
    service.stop();
  }

  async stop() {
    logger.info('*** Stopping starter service instance ***');
  }
}

const plugin: Plugin = {
  name: 'finance-surveillance',
  description:
    'Plugin de surveillance de portefeuille crypto Ethereum/EVM avec propositions de rebalancing. Mode lecture seule - aucune transaction n\'est exécutée.',
  // Set lowest priority so real models take precedence
  priority: -1000,
  config: {
    EVM_PUBLIC_KEY: process.env.EVM_PUBLIC_KEY,
    EVM_CHAINS: process.env.EVM_CHAINS,
    REBALANCING_THRESHOLD: process.env.REBALANCING_THRESHOLD || '10',
    ETHERSCAN_API_KEY: process.env.ETHERSCAN_API_KEY, // Optionnel pour accès API gratuit
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY, // Optionnel pour meilleures performances
  },
  async init(config: Record<string, string>) {
    logger.info('*** Initializing finance surveillance plugin ***');
    try {
      const publicKey = config.EVM_PUBLIC_KEY?.trim();
      if (!publicKey) {
        logger.warn('EVM_PUBLIC_KEY not configured - surveillance features will be unavailable');
      } else {
        logger.info('Finance surveillance plugin initialized in READ-ONLY mode');
        logger.info('Using Etherscan API V2 (https://docs.etherscan.io/introduction) for portfolio monitoring');
        logger.info('API V2 requires a valid API key - get one for free at https://etherscan.io/apis');
        logger.info('No private key required - read-only mode using public address');
      }

      // Set all environment variables at once
      for (const [key, value] of Object.entries(config)) {
        if (value) process.env[key] = value;
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(
          `Invalid plugin configuration: ${error.issues.map((e: z.ZodIssue) => e.message).join(', ')}`
        );
      }
      throw error;
    }
  },
  models: {
    [ModelType.TEXT_SMALL]: async (
      _runtime,
      { prompt, stopSequences = [] }: GenerateTextParams
    ) => {
      return 'Never gonna give you up, never gonna let you down, never gonna run around and desert you...';
    },
    [ModelType.TEXT_LARGE]: async (
      _runtime,
      {
        prompt,
        stopSequences = [],
        maxTokens = 8192,
        temperature = 0.7,
        frequencyPenalty = 0.7,
        presencePenalty = 0.7,
      }: GenerateTextParams
    ) => {
      return 'Never gonna make you cry, never gonna say goodbye, never gonna tell a lie and hurt you...';
    },
  },
  routes: [
    {
      name: 'portfolio-surveillance',
      path: '/portfolio/surveillance',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        res.json({
          mode: 'read-only',
          publicKey: process.env.EVM_PUBLIC_KEY,
          chains: process.env.EVM_CHAINS?.split(',') || [],
          rebalancingThreshold: process.env.REBALANCING_THRESHOLD || '10',
          message: 'Surveillance mode active - no transactions will be executed',
        });
      },
    },
    {
      name: 'api-stats',
      path: '/api/stats',
      type: 'GET',
      handler: async (_req: any, res: any) => {
        try {
          const { openaiTracker } = await import('./services/openai-tracker.service');
          const { openaiInterceptor } = await import('./services/openai-interceptor.service');

          const stats = openaiTracker.getAllStats();
          const threshold = openaiTracker.checkThresholds();
          const recommendations = openaiInterceptor.generateOptimizationRecommendations();

          res.json({
            success: true,
            timestamp: Date.now(),
            stats,
            threshold,
            recommendations,
            report: openaiTracker.generateReport(),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    },
    {
      name: 'api-stats-reset',
      path: '/api/stats/reset',
      type: 'POST',
      handler: async (_req: any, res: any) => {
        try {
          const { openaiTracker } = await import('./services/openai-tracker.service');
          openaiTracker.resetStats();
          
          res.json({
            success: true,
            message: 'Statistiques réinitialisées avec succès',
            timestamp: Date.now(),
          });
        } catch (error) {
          res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      },
    },
  ],
  events: {
    MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('MESSAGE_RECEIVED event received');
        logger.info({ keys: Object.keys(params) }, 'MESSAGE_RECEIVED param keys');
      },
    ],
    VOICE_MESSAGE_RECEIVED: [
      async (params) => {
        logger.info('VOICE_MESSAGE_RECEIVED event received');
        logger.info({ keys: Object.keys(params) }, 'VOICE_MESSAGE_RECEIVED param keys');
      },
    ],
    WORLD_CONNECTED: [
      async (params) => {
        logger.info('WORLD_CONNECTED event received');
        logger.info({ keys: Object.keys(params) }, 'WORLD_CONNECTED param keys');
      },
    ],
    WORLD_JOINED: [
      async (params) => {
        logger.info('WORLD_JOINED event received');
        logger.info({ keys: Object.keys(params) }, 'WORLD_JOINED param keys');
      },
    ],
  },
  services: [StarterService, 
    async (runtime: IAgentRuntime) => {
      const { OpenAITrackerService } = await import('./services/openai-tracker.service');
      return new OpenAITrackerService();
    },
    async (runtime: IAgentRuntime) => {
      const { OpenAIInterceptorService } = await import('./services/openai-interceptor.service');
      return new OpenAIInterceptorService();
    }
  ],
  actions: [surveillancePortefeuilleAction, proposerRebalancingAction, showApiStatsAction],
  providers: [helloWorldProvider],
};

export default plugin;
