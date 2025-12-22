/**
 * Next.js Edge Middleware
 * Выполняется на Edge Runtime перед каждым запросом
 * 
 * Ограничения Edge:
 * - Нет fs, path, child_process
 * - Нет тяжёлых npm пакетов
 * - Максимум 1MB кода
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // TODO: Rate limiting (использовать @upstash/ratelimit для Edge)
  // TODO: Auth проверка (JWT/session)
  // TODO: Logging

  const response = NextResponse.next();

  // CORS headers для API
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }

  return response;
}

// Конфигурация: на каких путях срабатывает middleware
export const config = {
  matcher: [
    // API routes
    '/api/:path*',
    // Исключаем статику и _next
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
