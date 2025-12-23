/**
 * Text-to-Speech Service
 * OpenAI TTS API integration for speech synthesis
 * 
 * @module services/textToSpeechService
 */

import { promises as fs } from 'fs';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';
import OpenAI from 'openai';

// Types
type TTSVoice = 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
type TTSModel = 'tts-1' | 'tts-1-hd';

interface TTSResult {
  audioPath: string;
  audioUrl: string;
  text: string;
  language: string;
  voice: TTSVoice;
  duration: number;
  fileSize: number;
  processingTime: number;
  provider: string;
}

interface TTSConfig {
  apiKey?: string;
  defaultVoice?: TTSVoice;
  defaultModel?: TTSModel;
  outputDir?: string;
}

// Voice mapping by language
const LANGUAGE_VOICES: Record<string, TTSVoice> = {
  en: 'alloy',
  ru: 'shimmer',
  de: 'onyx',
  fr: 'nova',
  es: 'nova',
  pl: 'echo',
  cs: 'fable',
  lt: 'alloy',
  lv: 'alloy',
  no: 'onyx',
};

/**
 * TextToSpeechService - TTS using OpenAI API
 */
class TextToSpeechService {
  private openai: OpenAI;
  private defaultVoice: TTSVoice;
  private defaultModel: TTSModel;
  private outputDir: string;
  private enabled: boolean;

  constructor(config?: TTSConfig) {
    const apiKey = config?.apiKey || process.env.OPENAI_API_KEY;
    
    this.enabled = !!apiKey;
    this.openai = new OpenAI({ apiKey });
    this.defaultVoice = config?.defaultVoice || 'alloy';
    this.defaultModel = config?.defaultModel || 'tts-1';
    this.outputDir = config?.outputDir || path.join(process.cwd(), 'public', 'audio');

    // Ensure output directory exists
    this.ensureOutputDir();

    if (this.enabled) {
      console.log('🔊 TextToSpeechService initialized');
    } else {
      console.warn('⚠️ TextToSpeechService: No API key, mock mode enabled');
    }
  }

  /**
   * Ensure output directory exists
   */
  private ensureOutputDir(): void {
    try {
      if (!existsSync(this.outputDir)) {
        mkdirSync(this.outputDir, { recursive: true });
        console.log(`📁 Created TTS output directory: ${this.outputDir}`);
      }
    } catch (error) {
      console.warn(`⚠️ Could not create output directory: ${this.outputDir}`);
    }
  }

  /**
   * Get voice for language
   */
  private getVoiceForLanguage(language: string): TTSVoice {
    const langCode = language.toLowerCase().split('-')[0];
    return LANGUAGE_VOICES[langCode] || this.defaultVoice;
  }

  /**
   * Generate speech from text
   * @param text - Text to convert to speech
   * @param language - Language code (e.g., 'en', 'ru', 'de')
   * @param voice - Voice name (optional)
   * @param model - TTS model (optional)
   * @param speed - Speech speed 0.25-4.0 (optional)
   * @returns TTS result with audio file path
   */
  async generateSpeech(
    text: string,
    language: string = 'en',
    voice: TTSVoice | null = null,
    model: TTSModel = 'tts-1',
    speed: number = 1.0
  ): Promise<TTSResult> {
    const startTime = Date.now();

    // Validate inputs
    if (!text || text.trim().length === 0) {
      throw new Error('Text is required for TTS');
    }

    if (text.length > 4096) {
      throw new Error('Text too long (max 4096 characters)');
    }

    if (speed < 0.25 || speed > 4.0) {
      throw new Error('Speed must be between 0.25 and 4.0');
    }

    const selectedVoice = voice || this.getVoiceForLanguage(language);
    const langCode = language.toLowerCase().split('-')[0];

    // Generate filename
    const filename = `tts_${Date.now()}_${langCode}.mp3`;
    const filepath = path.join(this.outputDir, filename);

    try {
      if (!this.enabled) {
        return this.generateMockSpeech(text, langCode, filepath, filename, startTime);
      }

      console.log(`🔊 Generating speech: "${text.substring(0, 40)}..." [${langCode}, ${selectedVoice}]`);

      // Call OpenAI TTS API
      const mp3Response = await this.openai.audio.speech.create({
        model: model,
        voice: selectedVoice,
        input: text,
        speed: speed,
        response_format: 'mp3',
      });

      // Convert response to buffer and save
      const buffer = Buffer.from(await mp3Response.arrayBuffer());
      await fs.writeFile(filepath, buffer);

      // Estimate duration (rough: ~150 words per minute)
      const wordCount = text.split(/\s+/).length;
      const estimatedDuration = Math.ceil((wordCount / 150) * 60);

      console.log(`✅ TTS complete: ${filename} (${buffer.length} bytes)`);

      return {
        audioPath: filepath,
        audioUrl: `/audio/${filename}`,
        text: text,
        language: langCode,
        voice: selectedVoice,
        duration: estimatedDuration,
        fileSize: buffer.length,
        processingTime: Date.now() - startTime,
        provider: 'openai-tts-1',
      };
    } catch (error: any) {
      console.error(`❌ TTS error: ${error.message}`);
      
      // Fallback to mock on error
      if (this.enabled) {
        console.log('🔄 Falling back to mock TTS');
        return this.generateMockSpeech(text, langCode, filepath, filename, startTime, error.message);
      }
      
      throw new Error(`TTS failed: ${error.message}`);
    }
  }

  /**
   * Generate mock speech (for testing or when API unavailable)
   */
  private async generateMockSpeech(
    text: string,
    language: string,
    filepath: string,
    filename: string,
    startTime: number,
    errorMessage?: string
  ): Promise<TTSResult> {
    // Minimal valid MP3 header
    const mockMp3 = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    ]);

    await fs.writeFile(filepath, mockMp3);

    console.log(`⚠️ Mock TTS generated: ${filename}`);

    return {
      audioPath: filepath,
      audioUrl: `/audio/${filename}`,
      text: text,
      language: language,
      voice: 'alloy',
      duration: Math.ceil(text.length * 0.05),
      fileSize: mockMp3.length,
      processingTime: Date.now() - startTime,
      provider: errorMessage ? 'mock-fallback' : 'mock-tts',
    };
  }

  /**
   * Check if service is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Get supported voices
   */
  getAvailableVoices(): TTSVoice[] {
    return ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
  }
}

// Singleton instance
const ttsService = new TextToSpeechService();

/**
 * Helper function for simple speech generation
 * @param text - Text to speak
 * @param language - Language code
 * @returns Path to generated audio file
 */
async function speakText(text: string, language: string = 'en'): Promise<string> {
  const result = await ttsService.generateSpeech(text, language);
  return result.audioPath;
}

/**
 * Helper function with full options
 */
async function generateSpeech(
  text: string,
  language: string = 'en',
  voice: TTSVoice | null = null,
  model: TTSModel = 'tts-1',
  speed: number = 1.0
): Promise<TTSResult> {
  return ttsService.generateSpeech(text, language, voice, model, speed);
}

// Named exports
export {
  TextToSpeechService,
  ttsService,
  speakText,
  generateSpeech,
};

// Type exports
export type {
  TTSResult,
  TTSConfig,
  TTSVoice,
  TTSModel,
};
