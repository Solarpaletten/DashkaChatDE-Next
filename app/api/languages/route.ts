/**
 * GET /api/languages
 * Возвращает список поддерживаемых языков
 */

import { NextResponse } from 'next/server';
// TODO: import { languages } from '@/config/languages';

export async function GET() {
  // TODO: Заменить на реальные данные из config/languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'de', name: 'German' },
    { code: 'pl', name: 'Polish' },
  ];

  return NextResponse.json({ languages });
}
