/**
 * Unified Translation Service
 * Combines text translation, voice transcription, and TTS
 * 
 * @module services/translationService
 */

import OpenAI from 'openai';
import { transcribeAudio } from './whisperService';
import { speakText } from './textToSpeechService';

// Types
interface SupportedLanguage {
  name: string;
  nativeName: string;
  flag: string;
  code: string;
}

interface TranslationResult {
  originalText: string;
  translatedText: string;
  fromLanguage: string;
  toLanguage: string;
  processingTime: number;
  confidence: number;
  provider: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface VoiceTranslationResult extends TranslationResult {
  originalAudio: string;
  translatedAudio: string;
}

interface LanguageDetectionResult {
  language: string;
  confidence: number;
  provider: string;
}

// Supported languages configuration
const SUPPORTED_LANGUAGES: Record<string, SupportedLanguage> = {
  EN: { name: 'English', nativeName: 'English', flag: '🇺🇸', code: 'en' },
  RU: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', code: 'ru' },
  DE: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', code: 'de' },
  FR: { name: 'French', nativeName: 'Français', flag: '🇫🇷', code: 'fr' },
  ES: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', code: 'es' },
  CS: { name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿', code: 'cs' },
  PL: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', code: 'pl' },
  LT: { name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹', code: 'lt' },
  LV: { name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻', code: 'lv' },
  NO: { name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴', code: 'no' },
};

/**
 * UnifiedTranslationService
 * Main service for all translation operations
 */
class UnifiedTranslationService {
  private openai: OpenAI;
  private supportedLanguages: Record<string, SupportedLanguage>;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.supportedLanguages = SUPPORTED_LANGUAGES;

    console.log(
      `🌍 UnifiedTranslationService initialized with ${Object.keys(this.supportedLanguages).length} languages`
    );
  }

  /**
   * Get list of supported languages
   */
  getSupportedLanguages(): Array<{
    code: string;
    name: string;
    nativeName: string;
    flag: string;
  }> {
    return Object.entries(this.supportedLanguages).map(([code, config]) => ({
      code,
      name: config.name,
      nativeName: config.nativeName,
      flag: config.flag,
    }));
  }

  /**
   * Translate text from one language to another
   * @param text - Text to translate
   * @param fromLanguage - Source language code (e.g., 'RU', 'EN')
   * @param toLanguage - Target language code
   * @returns Translation result
   */
  async translateText(
    text: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<TranslationResult> {
    const startTime = Date.now();

    // Validate languages
    const fromLang = fromLanguage.toUpperCase();
    const toLang = toLanguage.toUpperCase();

    if (!this.supportedLanguages[fromLang]) {
      throw new Error(`Unsupported source language: ${fromLanguage}`);
    }

    if (!this.supportedLanguages[toLang]) {
      throw new Error(`Unsupported target language: ${toLanguage}`);
    }

    // Same language = no translation needed
    if (fromLang === toLang) {
      return {
        originalText: text,
        translatedText: text,
        fromLanguage: fromLang,
        toLanguage: toLang,
        processingTime: Date.now() - startTime,
        confidence: 1.0,
        provider: 'same-language',
      };
    }

    try {
      const fromName = this.supportedLanguages[fromLang].name;
      const toName = this.supportedLanguages[toLang].name;

      const systemPrompt = `You are a professional translator. Translate the following text from ${fromName} to ${toName}.

RULES:
- Provide ONLY the translation, no explanations or notes
- Maintain the original tone and style
- Keep formatting if present
- For conversational text, translate naturally
- Do not add quotation marks around the translation`;

      console.log(`🌍 Translating: ${fromLang} → ${toLang}`);

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: text },
        ],
        max_tokens: Math.min(4000, text.length * 3),
        temperature: 0.3,
      });

      const translatedText = response.choices[0]?.message?.content?.trim();

      if (!translatedText) {
        throw new Error('Empty translation response');
      }

      console.log(`✅ Translation complete: "${translatedText.substring(0, 50)}..."`);

      return {
        originalText: text,
        translatedText,
        fromLanguage: fromLang,
        toLanguage: toLang,
        processingTime: Date.now() - startTime,
        confidence: 0.95,
        provider: 'openai-gpt4o-mini',
        usage: response.usage,
      };
    } catch (error: any) {
      console.error(`❌ Translation error: ${error.message}`);
      throw new Error(`Translation failed: ${error.message}`);
    }
  }

  /**
   * Translate voice: STT → Translate → TTS
   * @param audioFilePath - Path to audio file
   * @param fromLanguage - Source language code
   * @param toLanguage - Target language code
   * @returns Voice translation result with audio paths
   */
  async translateVoice(
    audioFilePath: string,
    fromLanguage: string,
    toLanguage: string
  ): Promise<VoiceTranslationResult> {
    const startTime = Date.now();

    const fromLang = fromLanguage.toUpperCase();
    const toLang = toLanguage.toUpperCase();

    console.log(`🎤 Voice translation: ${fromLang} → ${toLang}`);

    try {
      // Step 1: Speech-to-Text
      const fromLangCode = this.supportedLanguages[fromLang]?.code || 'auto';
      const transcribedText = await transcribeAudio(audioFilePath, fromLangCode);

      if (!transcribedText || transcribedText.trim().length === 0) {
        throw new Error('No speech detected in audio');
      }

      console.log(`📝 Transcribed: "${transcribedText.substring(0, 50)}..."`);

      // Step 2: Translate text
      const translation = await this.translateText(transcribedText, fromLang, toLang);

      // Step 3: Text-to-Speech
      const toLangCode = this.supportedLanguages[toLang]?.code || 'en';
      const translatedAudioPath = await speakText(translation.translatedText, toLangCode);

      console.log(`✅ Voice translation complete in ${Date.now() - startTime}ms`);

      return {
        originalText: transcribedText,
        translatedText: translation.translatedText,
        originalAudio: audioFilePath,
        translatedAudio: translatedAudioPath,
        fromLanguage: fromLang,
        toLanguage: toLang,
        processingTime: Date.now() - startTime,
        confidence: translation.confidence,
        provider: 'solar-voice-pipeline',
      };
    } catch (error: any) {
      console.error(`❌ Voice translation error: ${error.message}`);
      throw new Error(`Voice translation failed: ${error.message}`);
    }
  }

  /**
   * Detect language of text
   * @param text - Text to analyze
   * @returns Detected language code
   */
  async detectLanguage(text: string): Promise<LanguageDetectionResult> {
    try {
      const supportedCodes = Object.keys(this.supportedLanguages).join(', ');

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a language detection expert. Analyze the text and respond with ONLY the language code from this list: ${supportedCodes}.

Examples:
"Hello world" → EN
"Привет мир" → RU
"Guten Tag" → DE
"Bonjour" → FR

Respond with ONLY the 2-letter code, nothing else.`,
          },
          { role: 'user', content: text.substring(0, 500) },
        ],
        max_tokens: 5,
        temperature: 0.0,
      });

      const detectedCode = response.choices[0]?.message?.content?.trim().toUpperCase();

      // Check if valid detection
      if (detectedCode && this.supportedLanguages[detectedCode]) {
        return {
          language: detectedCode,
          confidence: 0.95,
          provider: 'openai-detection',
        };
      }

      // Try to match partial response
      if (detectedCode) {
        for (const code of Object.keys(this.supportedLanguages)) {
          if (detectedCode.includes(code)) {
            return {
              language: code,
              confidence: 0.8,
              provider: 'openai-detection-fuzzy',
            };
          }
        }
      }

      // Fallback
      return {
        language: 'EN',
        confidence: 0.5,
        provider: 'fallback',
      };
    } catch (error: any) {
      console.error(`❌ Language detection error: ${error.message}`);
      return {
        language: 'EN',
        confidence: 0.3,
        provider: 'error-fallback',
      };
    }
  }

  /**
   * Get service statistics
   */
  getStats(): {
    supportedLanguages: number;
    features: string[];
    provider: string;
    status: string;
  } {
    return {
      supportedLanguages: Object.keys(this.supportedLanguages).length,
      features: [
        'text-translation',
        'voice-translation',
        'language-detection',
        'real-time-processing',
      ],
      provider: 'SOLAR v3.0 + OpenAI',
      status: 'ready',
    };
  }
}

// Named export
export { UnifiedTranslationService };

// Type exports
export type {
  TranslationResult,
  VoiceTranslationResult,
  LanguageDetectionResult,
  SupportedLanguage,
};
