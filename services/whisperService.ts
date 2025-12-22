/**
 * Whisper Service (Speech-to-Text)
 * TODO: Перенести из backend/src/services/whisperService.js
 */

interface TranscriptionResult {
  text: string;
  language: string;
  confidence?: number;
}

export async function transcribe(audioPath: string): Promise<TranscriptionResult> {
  // TODO: Интеграция с OpenAI Whisper API или локальным Whisper
  throw new Error('Not implemented');
}

export const whisperService = {
  transcribe,
};
