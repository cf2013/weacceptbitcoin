/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [
      'mempool.space',
      'localhost',
      'supabase.co',
      'supabase.in',
      'wxmksfojkiwlaiylqwht.supabase.co'  // Add your Supabase project domain
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'http://localhost:8000/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*', // Proxy to FastAPI backend
      },
    ];
  },
};

module.exports = nextConfig;