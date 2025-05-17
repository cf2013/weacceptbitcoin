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
    NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'https://btcapproved-backend.livelycoast-10565395.eastus.azurecontainerapps.io',
  },
  output: 'export',
  trailingSlash: true,
  // Disable image optimization during export
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
