import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Отключаем standalone для custom server
  output: undefined,
  
  // Включаем Server Actions (если понадобятся)
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // Webpack настройки для WebSocket
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        'bufferutil': 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }
    return config;
  },
};

export default nextConfig;
