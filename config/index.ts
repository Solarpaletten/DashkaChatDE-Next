/**
 * Application Configuration
 * Единая точка доступа к конфигам
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  hostname: process.env.HOSTNAME || 'localhost',
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // API Keys (TODO: добавить реальные)
  openaiApiKey: process.env.OPENAI_API_KEY,
  deepLApiKey: process.env.DEEPL_API_KEY,
  
  // Limits
  maxFileSize: 10 * 1024 * 1024, // 10MB
  maxAudioDuration: 60, // seconds
  rateLimitWindow: 60 * 1000, // 1 minute
  rateLimitMax: 100, // requests per window
  
  // Paths
  tempDir: './temp',
  uploadsDir: './uploads',
  cacheDir: './cache',
} as const;

export type Config = typeof config;
