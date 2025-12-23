/**
 * Services barrel export
 * Central export point for all service modules
 * 
 * @module services
 */

// Translation Service (main)
export { UnifiedTranslationService } from './translationService';
export type {
  TranslationResult,
  VoiceTranslationResult,
  LanguageDetectionResult,
  SupportedLanguage,
} from './translationService';

// Whisper STT Service
export {
  WhisperService,
  whisperService,
  transcribeAudio,
} from './whisperService';
export type {
  TranscriptionResult,
  WhisperServiceConfig,
} from './whisperService';

// TTS Service
export {
  TextToSpeechService,
  ttsService,
  speakText,
  generateSpeech,
} from './textToSpeechService';
export type {
  TTSResult,
  TTSConfig,
  TTSVoice,
  TTSModel,
} from './textToSpeechService';
