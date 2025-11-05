/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost', 'tawa.com', 'graph.facebook.com', 'lookaside.facebook.com', 'platform-lookaside.fbsbx.com', 'fbcdn.net', 'scontent.xx.fbcdn.net'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'lookaside.facebook.com',
      },
      {
        protocol: 'https',
        hostname: 'platform-lookaside.fbsbx.com',
      },
      {
        protocol: 'https',
        hostname: 'fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'scontent.xx.fbcdn.net',
      },
    ],
  },
}

module.exports = nextConfig

