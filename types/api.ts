/**
 * API Request/Response Types
 */

// Health
export interface HealthResponse {
  status: 'ok' | 'error';
  timestamp: string;
  service: string;
}

// Languages
export interface Language {
  code: string;
  name: string;
}

export interface LanguagesResponse {
  languages: Language[];
}

// Translation
export interface TranslationRequest {
  text: string;
  from: string;
  to: string;
}

export interface TranslationResponse {
  original: string;
  translated: string;
  from: string;
  to: string;
}

// Voice
export interface VoiceTranscriptionResponse {
  text: string;
  language: string;
}

export interface VoiceTTSRequest {
  text: string;
  language?: string;
}

export interface VoiceTTSResponse {
  audioUrl: string;
  text: string;
  language: string;
}

// Error
export interface APIError {
  error: string;
  code?: string;
}
