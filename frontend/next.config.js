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
      'btcapproved-backend.azurewebsites.net'  // Add your Azure Container App domain
    ],
  },
  env: {
    API_URL: process.env.API_URL || 'https://btcapproved-backend.azurewebsites.net/api',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://btcapproved-backend.azurewebsites.net/api/:path*', // Proxy to Azure Container App
      },
    ];
  },
  output: 'standalone', // Required for Azure Static Web Apps
};

module.exports = nextConfig;