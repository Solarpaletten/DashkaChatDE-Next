/**
 * POST /api/translation
 * Text translation endpoint
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple in-memory cache
const translationCache = new Map<string, { result: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCacheKey(text: string, from: string, to: string): string {
  return `${text.trim()}_${from}_${to}`;
}

function getFromCache(key: string): any | null {
  const cached = translationCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.result;
  }
  translationCache.delete(key);
  return null;
}

function setCache(key: string, result: any): void {
  // Limit cache size
  if (translationCache.size > 1000) {
    const firstKey = translationCache.keys().next().value;
    if (firstKey) translationCache.delete(firstKey);
  }
  translationCache.set(key, { result, timestamp: Date.now() });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    
    const {
      text,
      source_language = 'RU',
      target_language = 'DE',
      fromLang,
      toLang,
      from,
      to
    } = body;

    // Normalize language codes
    const sourceCode = (source_language || fromLang || from || 'RU').toUpperCase();
    const targetCode = (target_language || toLang || to || 'DE').toUpperCase();

    if (!text || !text.trim()) {
      return NextResponse.json(
        { status: 'error', message: 'Text is required' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = getCacheKey(text, sourceCode, targetCode);
    const cached = getFromCache(cacheKey);
    if (cached) {
      return NextResponse.json({
        ...cached,
        from_cache: true,
        processing_time: Date.now() - startTime
      });
    }

    // Same language = no translation needed
    if (sourceCode === targetCode) {
      const response = {
        status: 'success',
        original_text: text,
        translated_text: text,
        source_language: sourceCode.toLowerCase(),
        target_language: targetCode.toLowerCase(),
        confidence: 1.0,
        timestamp: new Date().toISOString(),
        processing_time: Date.now() - startTime,
        provider: 'same-language',
        from_cache: false
      };
      return NextResponse.json(response);
    }

    // Dynamic import to avoid issues with CommonJS service
    const { UnifiedTranslationService } = require('../../../services/translationService');
    const translationService = new UnifiedTranslationService();

    const result = await translationService.translateText(
      text.trim(),
      sourceCode,
      targetCode
    );

    const response = {
      status: 'success',
      original_text: result.originalText,
      translated_text: result.translatedText,
      source_language: sourceCode.toLowerCase(),
      target_language: targetCode.toLowerCase(),
      confidence: result.confidence,
      timestamp: new Date().toISOString(),
      processing_time: result.processingTime,
      provider: result.provider,
      from_cache: false
    };

    // Save to cache
    setCache(cacheKey, response);

    return NextResponse.json(response);

  } catch (error: any) {
    console.error('[API/translation] Error:', error);
    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message || 'Translation failed',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
