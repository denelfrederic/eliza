/**
 * Service de tracking des appels OpenAI
 * Comptabilise les appels, tokens consommés et estime les coûts en temps réel
 */

/**
 * Tarification OpenAI (mise à jour Octobre 2024)
 * Prix par million de tokens
 */
const OPENAI_PRICING: Record<string, { prompt: number; completion: number }> = {
  'gpt-4o-mini': {
    prompt: 0.15 / 1_000_000,      // $0.15 par 1M tokens
    completion: 0.60 / 1_000_000,  // $0.60 par 1M tokens
  },
  'gpt-4o': {
    prompt: 2.50 / 1_000_000,       // $2.50 par 1M tokens
    completion: 10.00 / 1_000_000,  // $10.00 par 1M tokens
  },
  'gpt-4-turbo': {
    prompt: 10.00 / 1_000_000,      // $10.00 par 1M tokens
    completion: 30.00 / 1_000_000,  // $30.00 par 1M tokens
  },
  // Modèles gpt-5 (utilisés par ElizaOS pour certaines tâches)
  'gpt-5-nano-2025-08-07': {
    prompt: 0.05 / 1_000_000,      // Estimation: très léger, moins cher que mini
    completion: 0.20 / 1_000_000,  // Estimation: très léger
  },
  'gpt-5-mini-2025-08-07': {
    prompt: 0.10 / 1_000_000,      // Estimation: léger, similaire à gpt-4o-mini
    completion: 0.40 / 1_000_000,  // Estimation: léger
  },
  'gpt-5-mini': {
    prompt: 0.10 / 1_000_000,      // Alias sans date
    completion: 0.40 / 1_000_000,
  },
  'gpt-5-nano': {
    prompt: 0.05 / 1_000_000,      // Alias sans date
    completion: 0.20 / 1_000_000,
  },
  'text-embedding-3-small': {
    prompt: 0.02 / 1_000_000,       // $0.02 par 1M tokens (embedding uniquement)
    completion: 0,                   // Pas de completion pour les embeddings
  },
  'text-embedding-3-large': {
    prompt: 0.13 / 1_000_000,       // $0.13 par 1M tokens
    completion: 0,
  },
};

/**
 * Interface pour les statistiques d'un modèle
 */
export interface ModelStats {
  totalCalls: number;
  totalPromptTokens: number;
  totalCompletionTokens: number;
  totalTokens: number;
  estimatedCost: number;
  lastCallTimestamp: number;
  errorCount: number;
}

/**
 * Seuils d'alerte configurables
 */
const ALERT_THRESHOLDS = {
  MAX_CALLS: 100,           // Alerte si plus de 100 appels
  MAX_COST_USD: 1.0,       // Alerte si coût dépasse $1.00
  MAX_AVG_TOKENS: 2000,    // Alerte si moyenne > 2000 tokens par appel
};

/**
 * Service de tracking des appels OpenAI
 * Stocke les statistiques en mémoire et calcule les coûts estimés
 */
export class OpenAITrackerService {
  private stats: Map<string, ModelStats> = new Map();
  private sessionStartTime: number = Date.now();

  /**
   * Enregistre un appel API OpenAI
   * @param modelName Nom du modèle utilisé
   * @param promptTokens Nombre de tokens du prompt
   * @param completionTokens Nombre de tokens de la completion
   * @param isError Si l'appel a généré une erreur
   */
  trackCall(
    modelName: string,
    promptTokens: number,
    completionTokens: number,
    isError: boolean = false
  ): void {
    const currentStats = this.stats.get(modelName) || {
      totalCalls: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalTokens: 0,
      estimatedCost: 0,
      lastCallTimestamp: 0,
      errorCount: 0,
    };

    // Mettre à jour les statistiques
    currentStats.totalCalls += 1;
    currentStats.totalPromptTokens += promptTokens;
    currentStats.totalCompletionTokens += completionTokens;
    currentStats.totalTokens += promptTokens + completionTokens;
    currentStats.lastCallTimestamp = Date.now();

    if (isError) {
      currentStats.errorCount += 1;
    }

    // Calculer le coût estimé
    const pricing = OPENAI_PRICING[modelName] || OPENAI_PRICING['gpt-4o-mini'];
    const promptCost = promptTokens * pricing.prompt;
    const completionCost = completionTokens * pricing.completion;
    currentStats.estimatedCost += promptCost + completionCost;

    // Sauvegarder les statistiques mises à jour
    this.stats.set(modelName, currentStats);
  }

  /**
   * Récupère toutes les statistiques par modèle
   * @returns Objet avec les statistiques par modèle
   */
  getAllStats(): Record<string, ModelStats> {
    const result: Record<string, ModelStats> = {};
    for (const [modelName, stats] of this.stats.entries()) {
      result[modelName] = { ...stats };
    }
    return result;
  }

  /**
   * Génère un rapport complet formaté pour l'affichage
   * @returns Rapport formaté en texte
   */
  generateReport(): string {
    const stats = this.getAllStats();
    const modelNames = Object.keys(stats);

    if (modelNames.length === 0) {
      return '📊 **Statistiques d\'utilisation OpenAI**\n\nAucun appel API enregistré pour cette session.';
    }

    // Calculer la durée de la session
    const sessionDuration = Date.now() - this.sessionStartTime;
    const sessionMinutes = Math.floor(sessionDuration / 60000);
    const sessionSeconds = Math.floor((sessionDuration % 60000) / 1000);

    let report = '📊 **Statistiques d\'utilisation OpenAI**\n\n';
    report += `⏱️ Durée de la session : ${sessionMinutes} minute${sessionMinutes > 1 ? 's' : ''} ${sessionSeconds > 0 ? `${sessionSeconds} seconde${sessionSeconds > 1 ? 's' : ''}` : ''}\n\n`;

    // Statistiques par modèle
    for (const modelName of modelNames) {
      const modelStats = stats[modelName];
      report += `**${modelName}**\n`;
      report += `├─ Appels : ${modelStats.totalCalls}\n`;
      report += `├─ Tokens prompt : ${modelStats.totalPromptTokens.toLocaleString('fr-FR')}\n`;
      report += `├─ Tokens completion : ${modelStats.totalCompletionTokens.toLocaleString('fr-FR')}\n`;
      report += `├─ Total tokens : ${modelStats.totalTokens.toLocaleString('fr-FR')}\n`;
      report += `├─ Erreurs : ${modelStats.errorCount}\n`;
      report += `└─ Coût estimé : $${modelStats.estimatedCost.toFixed(6)}\n\n`;
    }

    // Totaux de la session
    const totals = this.calculateTotals();
    report += '**📈 Totaux de la session**\n';
    report += `├─ Appels totaux : ${totals.totalCalls}\n`;
    report += `├─ Tokens totaux : ${totals.totalTokens.toLocaleString('fr-FR')}\n`;
    report += `└─ Coût total estimé : $${totals.totalCost.toFixed(6)}\n`;

    return report;
  }

  /**
   * Génère un résumé compact pour affichage dans les réponses
   * @returns Résumé compact ou null si aucun appel
   */
  generateCompactSummary(): string | null {
    const totals = this.calculateTotals();

    if (totals.totalCalls === 0) {
      return null;
    }

    const costStr = totals.totalCost < 0.0001 
      ? `< $0.0001` 
      : `~$${totals.totalCost.toFixed(4)}`;

    return `\n---\n💡 **Session actuelle** : ${totals.totalCalls} appels | ${totals.totalTokens.toLocaleString('fr-FR')} tokens | ${costStr}`;
  }

  /**
   * Vérifie si des seuils d'alerte sont dépassés
   * @returns Objet avec l'alerte et le message, ou null si aucun seuil dépassé
   */
  checkThresholds(): { alert: boolean; message: string } | null {
    const totals = this.calculateTotals();
    const alerts: string[] = [];

    // Vérifier le nombre d'appels
    if (totals.totalCalls > ALERT_THRESHOLDS.MAX_CALLS) {
      alerts.push(`⚠️ Alerte : ${totals.totalCalls} appels API détectés dans cette session (seuil: ${ALERT_THRESHOLDS.MAX_CALLS})`);
    }

    // Vérifier le coût total
    if (totals.totalCost > ALERT_THRESHOLDS.MAX_COST_USD) {
      alerts.push(`💰 Alerte : Coût total de $${totals.totalCost.toFixed(4)} dépasse le seuil de $${ALERT_THRESHOLDS.MAX_COST_USD}`);
    }

    // Vérifier la moyenne de tokens par appel
    if (totals.totalCalls > 0) {
      const avgTokens = totals.totalTokens / totals.totalCalls;
      if (avgTokens > ALERT_THRESHOLDS.MAX_AVG_TOKENS) {
        alerts.push(`🔧 Alerte : Moyenne de ${Math.round(avgTokens)} tokens par appel (seuil: ${ALERT_THRESHOLDS.MAX_AVG_TOKENS})`);
      }
    }

    // Vérifier les erreurs par modèle
    const stats = this.getAllStats();
    for (const [modelName, modelStats] of Object.entries(stats)) {
      if (modelStats.errorCount > 5) {
        alerts.push(`⚠️ ${modelStats.errorCount} erreurs détectées avec ${modelName}. Vérifiez votre clé API et les limites de rate limit.`);
      }
    }

    if (alerts.length === 0) {
      return null;
    }

    return {
      alert: true,
      message: alerts.join('\n\n'),
    };
  }

  /**
   * Réinitialise toutes les statistiques
   */
  resetStats(): void {
    this.stats.clear();
    this.sessionStartTime = Date.now();
  }

  /**
   * Calcule les totaux de la session
   * @returns Totaux agrégés
   */
  private calculateTotals(): {
    totalCalls: number;
    totalTokens: number;
    totalCost: number;
  } {
    const stats = this.getAllStats();
    let totalCalls = 0;
    let totalTokens = 0;
    let totalCost = 0;

    for (const modelStats of Object.values(stats)) {
      totalCalls += modelStats.totalCalls;
      totalTokens += modelStats.totalTokens;
      totalCost += modelStats.estimatedCost;
    }

    return { totalCalls, totalTokens, totalCost };
  }
}

/**
 * Instance singleton du service de tracking
 */
export const openaiTracker = new OpenAITrackerService();

