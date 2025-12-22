/**
 * POST /api/voice
 * Speech-to-Text (Whisper)
 * Принимает аудио файл, возвращает текст
 */

import { NextRequest, NextResponse } from 'next/server';
// TODO: import { whisperService } from '@/services';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }

    // TODO: Сохранить файл во временную директорию
    // TODO: Вызов whisperService.transcribe(filePath)
    
    const transcription = '[STUB] Transcribed text';

    return NextResponse.json({
      text: transcription,
      language: 'auto', // TODO: определение языка
    });
  } catch (error) {
    console.error('[API/voice] Error:', error);
    return NextResponse.json(
      { error: 'Transcription failed' },
      { status: 500 }
    );
  }
}
