/**
 * Text-to-Speech Service
 * TODO: Перенести из backend/src/services/textToSpeechService.js
 */

interface TTSResult {
  audioPath: string;
  duration?: number;
}

export async function synthesize(text: string, language: string): Promise<TTSResult> {
  // TODO: Интеграция с TTS API (Google, Azure, ElevenLabs, etc.)
  throw new Error('Not implemented');
}

export const textToSpeechService = {
  synthesize,
};
