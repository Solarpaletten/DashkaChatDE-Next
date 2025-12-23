/**
 * POST /api/voice
 * Voice translation endpoint (Speech-to-Text + Translation)
 */

import { NextRequest, NextResponse } from 'next/server';
import { writeFile, unlink, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

// Ensure temp directory exists
async function ensureTempDir(): Promise<string> {
  const tempDir = path.join(process.cwd(), 'tmp');
  if (!existsSync(tempDir)) {
    await mkdir(tempDir, { recursive: true });
  }
  return tempDir;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let tempFilePath: string | null = null;

  try {
    const formData = await request.formData();
    
    // Get audio file
    const audioFile = formData.get('audio') as File | null;
    if (!audioFile) {
      return NextResponse.json(
        { status: 'error', message: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Get language params
    const fromLang = (formData.get('fromLang') || formData.get('source_language') || 'RU') as string;
    const toLang = (formData.get('toLang') || formData.get('target_language') || 'DE') as string;
    
    const sourceCode = fromLang.toUpperCase();
    const targetCode = toLang.toUpperCase();

    // Save file temporarily
    const tempDir = await ensureTempDir();
    const filename = `voice_${Date.now()}_${Math.random().toString(36).slice(2)}.webm`;
    tempFilePath = path.join(tempDir, filename);

    const bytes = await audioFile.arrayBuffer();
    await writeFile(tempFilePath, Buffer.from(bytes));

    console.log(`[API/voice] Processing: ${sourceCode} → ${targetCode}`);

    // Dynamic import services
    const { UnifiedTranslationService } = require('../../services/UnifiedTranslationService');
    const translationService = new UnifiedTranslationService();

    const result = await translationService.translateVoice(
      tempFilePath,
      sourceCode,
      targetCode
    );

    // Cleanup temp file
    if (tempFilePath && existsSync(tempFilePath)) {
      await unlink(tempFilePath);
    }

    return NextResponse.json({
      status: 'success',
      originalText: result.originalText,
      translatedText: result.translatedText,
      audioUrl: result.translatedAudio ? `/audio/${path.basename(result.translatedAudio)}` : null,
      fromLanguage: result.fromLanguage,
      toLanguage: result.toLanguage,
      processingTime: Date.now() - startTime,
      confidence: result.confidence,
      provider: result.provider
    });

  } catch (error: any) {
    console.error('[API/voice] Error:', error);

    // Cleanup on error
    if (tempFilePath && existsSync(tempFilePath)) {
      try {
        await unlink(tempFilePath);
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    return NextResponse.json(
      { 
        status: 'error', 
        message: error.message || 'Voice translation failed' 
      },
      { status: 500 }
    );
  }
}
