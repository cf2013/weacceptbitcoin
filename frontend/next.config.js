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
  },
  env: {
    API_URL: process.env.API_URL || 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io/:path*',
      },
    ];
  },
  output: 'standalone',
};

module.exports = nextConfig;