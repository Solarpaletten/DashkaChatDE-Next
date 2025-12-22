/**
 * POST /api/translation
 * Перевод текста
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: import { translationService } from '@/services';
// TODO: import { TranslationRequest } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // TODO: Валидация через Zod
    const { text, from, to } = body;

    if (!text || !from || !to) {
      return NextResponse.json(
        { error: 'Missing required fields: text, from, to' },
        { status: 400 }
      );
    }

    // TODO: Вызов translationService.translate(text, from, to)
    const translated = `[STUB] Translated: ${text}`;

    return NextResponse.json({
      original: text,
      translated,
      from,
      to,
    });
  } catch (error) {
    console.error('[API/translation] Error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
}
