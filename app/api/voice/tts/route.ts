/**
 * POST /api/voice/tts
 * Text-to-Speech
 * Принимает текст, возвращает аудио
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: import { textToSpeechService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language } = body;

    if (!text) {
      return NextResponse.json(
        { error: 'No text provided' },
        { status: 400 }
      );
    }

    // TODO: Вызов textToSpeechService.synthesize(text, language)
    // TODO: Вернуть аудио файл или URL

    return NextResponse.json({
      audioUrl: '/stub/audio.mp3',
      text,
      language: language || 'en',
    });
  } catch (error) {
    console.error('[API/voice/tts] Error:', error);
    return NextResponse.json(
      { error: 'TTS synthesis failed' },
      { status: 500 }
    );
  }
}
