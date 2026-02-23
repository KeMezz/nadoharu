import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@nadoharu/shared'],
  webpack(config) {
    config.module.rules.push({
      test: /\.graphql$/i,
      type: 'asset/source',
    });

    return config;
  },
};

export default nextConfig;
