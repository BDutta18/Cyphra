const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@cyphra/shared', '@cyphra/contracts'],
  outputFileTracingRoot: path.join(__dirname, '../'),
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      crypto: false,
      stream: false,
    };
    return config;
  },
};

module.exports = nextConfig;
