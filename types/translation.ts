/**
 * Translation Domain Types
 */

export type LanguageCode = 'en' | 'de' | 'pl' | 'ru' | 'uk';

export interface LanguageConfig {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag?: string;
}

export interface TranslationEntry {
  id: string;
  original: string;
  translated: string;
  from: LanguageCode;
  to: LanguageCode;
  timestamp: Date;
  userId?: string;
}

export interface Room {
  id: string;
  name?: string;
  participants: string[];
  createdAt: Date;
}
