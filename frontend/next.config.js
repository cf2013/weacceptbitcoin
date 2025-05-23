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
      'btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io',
      'www.btcapproved.com'
    ],
  },
  env: {
    NEXT_PUBLIC_BACKEND_URL: process.env.NODE_ENV === 'development' 
      ? 'http://localhost:8000'
      : 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'development' 
          ? 'http://localhost:8000/api/:path*'
          : 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io/api/:path*',
      },
    ];
  },
  output: 'standalone',
};

module.exports = nextConfig;
