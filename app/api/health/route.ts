/**
 * GET /api/health
 * Health check endpoint
 */

import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'DashkaChat Next.js',
    version: '3.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
}
