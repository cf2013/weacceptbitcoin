/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['mempool.space'],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000/api',
  },
};

module.exports = nextConfig; 