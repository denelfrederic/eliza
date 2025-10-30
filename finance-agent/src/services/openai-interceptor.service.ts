/**
 * Service d'interception des appels OpenAI
 * Intercepte les appels, estime les tokens et génère des recommandations d'optimisation
 */

import { openaiTracker } from './openai-tracker.service';

/**
 * Service d'interception des appels OpenAI
 * Estime les tokens, track les appels et génère des recommandations
 */
export class OpenAIInterceptorService {
  /**
   * Estime le nombre de tokens dans un texte
   * Utilise une approximation : ~3.5 caractères = 1 token (moyenne pour texte mixte)
   * Note: Cette estimation est approximative, les tokens réels peuvent varier
   * 
   * @param text Texte à analyser
   * @returns Nombre estimé de tokens
   */
  estimateTokens(text: string): number {
    if (!text || text.length === 0) {
      return 0;
    }

    // Approximation: ~3.5 caractères par token pour texte mixte
    // Pour être plus précis, on compte les mots et caractères
    const words = text.trim().split(/\s+/).length;
    const chars = text.length;
    
    // Estimation basée sur une moyenne entre estimation par mots et par caractères
    // Mots: ~0.75 tokens par mot en moyenne
    // Caractères: ~0.285 tokens par caractère (1/3.5)
    const tokensByWords = words * 0.75;
    const tokensByChars = chars / 3.5;
    
    // Moyenne pondérée (les mots sont généralement plus précis)
    return Math.ceil((tokensByWords * 0.6 + tokensByChars * 0.4));
  }

  /**
   * Track une génération OpenAI
   * Si les tokens réels ne sont pas fournis, les estime automatiquement
   * 
   * @param modelName Nom du modèle utilisé
   * @param prompt Texte du prompt
   * @param response Texte de la réponse
   * @param actualTokens Tokens réels si disponibles depuis l'API (optionnel)
   */
  trackGeneration(
    modelName: string,
    prompt: string,
    response: string,
    actualTokens?: { prompt: number; completion: number }
  ): void {
    let promptTokens: number;
    let completionTokens: number;

    if (actualTokens) {
      // Utiliser les tokens réels si disponibles
      promptTokens = actualTokens.prompt;
      completionTokens = actualTokens.completion;
    } else {
      // Estimer les tokens si non fournis
      promptTokens = this.estimateTokens(prompt);
      completionTokens = this.estimateTokens(response);
    }

    // Enregistrer l'appel dans le tracker
    openaiTracker.trackCall(modelName, promptTokens, completionTokens, false);
  }

  /**
   * Track une erreur d'appel API
   * 
   * @param modelName Nom du modèle concerné
   * @param error Erreur générée
   */
  trackError(modelName: string, error: Error): void {
    // Enregistrer une erreur avec 0 tokens (l'appel a échoué)
    openaiTracker.trackCall(modelName, 0, 0, true);
  }

  /**
   * Génère des recommandations d'optimisation basées sur les statistiques actuelles
   * Analyse les patterns d'utilisation et suggère des améliorations
   * 
   * @returns Liste de recommandations formatées
   */
  generateOptimizationRecommendations(): string[] {
    const stats = openaiTracker.getAllStats();
    const recommendations: string[] = [];

    for (const [modelName, modelStats] of Object.entries(stats)) {
      if (modelStats.totalCalls === 0) {
        continue;
      }

      const avgTokens = modelStats.totalTokens / modelStats.totalCalls;
      const avgCost = modelStats.estimatedCost / modelStats.totalCalls;

      // Recommandation: Réduction du prompt système si moyenne élevée
      if (avgTokens > 2000) {
        recommendations.push(
          `🔧 Le modèle ${modelName} utilise ${Math.round(avgTokens)} tokens par appel en moyenne. ` +
          `Considérez réduire la longueur du prompt système.`
        );
      }

      // Recommandation: Modèle moins cher si coût élevé
      if (avgCost > 0.01 && modelName !== 'gpt-4o-mini') {
        recommendations.push(
          `💰 Coût moyen de $${avgCost.toFixed(4)} par appel pour ${modelName}. ` +
          `Envisagez un modèle moins cher comme gpt-4o-mini ($${(0.15 / 1_000_000 * avgTokens).toFixed(4)} estimé).`
        );
      }

      // Recommandation: Vérifier les erreurs
      if (modelStats.errorCount > 5) {
        recommendations.push(
          `⚠️ ${modelStats.errorCount} erreurs détectées avec ${modelName}. ` +
          `Vérifiez votre clé API et les limites de rate limit.`
        );
      }

      // Recommandation: Optimisation des prompts si moyenne très élevée
      if (avgTokens > 3000) {
        recommendations.push(
          `📝 Les prompts pour ${modelName} semblent très longs (${Math.round(avgTokens)} tokens moy.). ` +
          `Réduisez le contexte ou limitez maxMemories dans character.ts.`
        );
      }
    }

    // Recommandation globale: Cache si beaucoup d'appels similaires
    const totals = this.calculateTotals(stats);
    if (totals.totalCalls > 50) {
      recommendations.push(
        `💾 ${totals.totalCalls} appels détectés. Envisagez d'implémenter un cache pour les réponses similaires.`
      );
    }

    return recommendations;
  }

  /**
   * Calcule les totaux à partir des statistiques
   * @param stats Statistiques par modèle
   * @returns Totaux agrégés
   */
  private calculateTotals(stats: Record<string, any>): {
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
  } {
    let totalCalls = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (const modelStats of Object.values(stats)) {
      totalCalls += modelStats.totalCalls || 0;
      totalTokens += modelStats.totalTokens || 0;
      totalCost += modelStats.estimatedCost || 0;
    }

    return { totalCalls, totalTokens, totalCost };
  }
}

/**
 * Instance singleton du service d'interception
 */
export const openaiInterceptor = new OpenAIInterceptorService();

