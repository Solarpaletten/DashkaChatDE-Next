/**
 * Whisper Speech-to-Text Service
 * OpenAI Whisper API integration for audio transcription
 * 
 * @module services/whisperService
 */

import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Types
interface TranscriptionResult {
  text: string;
  language: string;
  confidence: number;
  provider: string;
}

interface WhisperServiceConfig {
  apiKey: string;
  model?: string;
  temperature?: number;
}

/**
 * WhisperService - Speech-to-Text using OpenAI Whisper API
 */
class WhisperService {
  private openai: OpenAI;
  private model: string;
  private temperature: number;

  constructor(config?: WhisperServiceConfig) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.warn('⚠️ WhisperService: No API key provided, service will be limited');
    }

    this.openai = new OpenAI({ apiKey });
    this.model = config?.model || 'whisper-1';
    this.temperature = config?.temperature || 0.2;
  }

  /**
   * Transcribe audio file to text
   * @param audioFilePath - Path to audio file
   * @param language - Language code (e.g., 'ru', 'de', 'en') or 'auto'
   * @returns Transcription result with text and metadata
   */
  async transcribeAudio(
    audioFilePath: string,
    language: string = 'auto'
  ): Promise<TranscriptionResult> {
    try {
      // Validate file exists
      if (!fs.existsSync(audioFilePath)) {
        throw new Error(`Audio file not found: ${audioFilePath}`);
      }

      console.log(`🎤 Transcribing: ${path.basename(audioFilePath)} [${language}]`);

      // Language mapping for Whisper API
      const languageMap: Record<string, string> = {
        'ru-RU': 'ru',
        'de-DE': 'de',
        'en-US': 'en',
        'en-GB': 'en',
        'pl-PL': 'pl',
        'fr-FR': 'fr',
        'fr-CH': 'fr',
        'es-ES': 'es',
        'auto': '',
      };

      const whisperLang = languageMap[language] || language.split('-')[0] || undefined;

      // Call Whisper API
      const transcription = await this.openai.audio.transcriptions.create({
        file: fs.createReadStream(audioFilePath),
        model: this.model,
        language: whisperLang || undefined,
        response_format: 'json',
        temperature: this.temperature,
      });

      const text = transcription.text?.trim() || '';
      
      console.log(`✅ Transcription complete: "${text.substring(0, 50)}..."`);

      return {
        text,
        language: whisperLang || 'auto',
        confidence: 0.95,
        provider: 'openai-whisper-1',
      };
    } catch (error: any) {
      console.error(`❌ Whisper transcription error: ${error.message}`);
      throw new Error(`Transcription failed: ${error.message}`);
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }
}

// Singleton instance
const whisperService = new WhisperService();

/**
 * Helper function for direct transcription
 * @param audioFilePath - Path to audio file
 * @param language - Language code or 'auto'
 * @returns Transcribed text
 */
async function transcribeAudio(
  audioFilePath: string,
  language: string = 'auto'
): Promise<string> {
  const result = await whisperService.transcribeAudio(audioFilePath, language);
  return result.text;
}

// Named exports
export {
  WhisperService,
  whisperService,
  transcribeAudio,
};

// Type exports
export type {
  TranscriptionResult,
  WhisperServiceConfig,
};
