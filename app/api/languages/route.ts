/**
 * GET /api/languages
 * POST /api/languages/detect
 * Language endpoints
 */

import { NextRequest, NextResponse } from 'next/server';

// Supported languages (inline to avoid service dependency for simple list)
const SUPPORTED_LANGUAGES = [
  { code: 'EN', name: 'English', flag: '🇺🇸', nativeName: 'English' },
  { code: 'RU', name: 'Русский', flag: '🇷🇺', nativeName: 'Русский' },
  { code: 'DE', name: 'Deutsch', flag: '🇩🇪', nativeName: 'Deutsch' },
  { code: 'FR', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
  { code: 'ES', name: 'Español', flag: '🇪🇸', nativeName: 'Español' },
  { code: 'CS', name: 'Čeština', flag: '🇨🇿', nativeName: 'Čeština' },
  { code: 'PL', name: 'Polski', flag: '🇵🇱', nativeName: 'Polski' },
  { code: 'LT', name: 'Lietuvių', flag: '🇱🇹', nativeName: 'Lietuvių' },
  { code: 'LV', name: 'Latviešu', flag: '🇱🇻', nativeName: 'Latviešu' },
  { code: 'NO', name: 'Norsk', flag: '🇳🇴', nativeName: 'Norsk' },
];

export async function GET() {
  return NextResponse.json({
    status: 'success',
    count: SUPPORTED_LANGUAGES.length,
    languages: SUPPORTED_LANGUAGES,
    service: 'DashkaChat'
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text) {
      return NextResponse.json(
        { status: 'error', message: 'Text is required' },
        { status: 400 }
      );
    }

    // Simple language detection heuristics
    // In production, this would call translationService.detectLanguage()
    let detected = 'EN';
    
    if (/[а-яА-ЯёЁ]/.test(text)) {
      detected = 'RU';
    } else if (/[äöüßÄÖÜ]/.test(text)) {
      detected = 'DE';
    } else if (/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/.test(text)) {
      detected = 'PL';
    } else if (/[áéíóúñ¿¡]/.test(text)) {
      detected = 'ES';
    } else if (/[àâçéèêëîïôùûü]/.test(text)) {
      detected = 'FR';
    }

    return NextResponse.json({
      status: 'success',
      detected_language: detected,
      confidence: 0.85,
      provider: 'heuristic'
    });

  } catch (error) {
    console.error('[API/languages] Error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Detection failed' },
      { status: 500 }
    );
  }
}
