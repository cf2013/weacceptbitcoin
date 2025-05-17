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
      'wxmksfojkiwlaiylqwht.supabase.co',
      'btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io'
    ],
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io',
  },
  output: 'standalone',
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io/api/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
