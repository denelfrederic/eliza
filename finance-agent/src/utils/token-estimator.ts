/**
 * Utilitaire pour estimer le nombre de tokens OpenAI
 * Utilise une estimation approximative basée sur la longueur du texte
 * Note: Pour une précision exacte, il faudrait utiliser tiktoken, mais cela nécessiterait
 * l'accès aux détails de l'appel API qui ne sont pas toujours disponibles
 */

/**
 * Estimation approximative du nombre de tokens
 * OpenAI : ~4 caractères par token en moyenne pour l'anglais
 * Pour le français et autres langues, c'est environ 3-4 caractères par token
 */
export function estimateTokens(text: string): number {
  if (!text || text.length === 0) {
    return 0;
  }

  // Estimation conservatrice : 4 caractères = 1 token en moyenne
  // Pour un texte mixte (anglais + français + code), on utilise 3.5 comme moyenne
  const estimatedTokens = Math.ceil(text.length / 3.5);
  
  return estimatedTokens;
}

/**
 * Estime les tokens pour un prompt et une réponse
 */
export function estimateTokensForPromptAndResponse(prompt: string, response: string): {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
} {
  const inputTokens = estimateTokens(prompt);
  const outputTokens = estimateTokens(response);
  
  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens,
  };
}

