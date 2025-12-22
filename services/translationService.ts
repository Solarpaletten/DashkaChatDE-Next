/**
 * Translation Service
 * TODO: Перенести из backend/src/services/unifiedTranslationService.js
 */

interface TranslationResult {
  original: string;
  translated: string;
  from: string;
  to: string;
}

export async function translate(
  text: string,
  from: string,
  to: string
): Promise<TranslationResult> {
  // TODO: Интеграция с Translation API (DeepL, Google, Azure, etc.)
  throw new Error('Not implemented');
}

export const translationService = {
  translate,
};
