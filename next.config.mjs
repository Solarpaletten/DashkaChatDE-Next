/** @type {import('next').NextConfig} */
const nextConfig = {
  // Custom server → standalone не используем
  output: undefined,

  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },

  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        bufferutil: 'bufferutil',
        'utf-8-validate': 'utf-8-validate',
      });
    }
    return config;
  },
};

export default nextConfig;
