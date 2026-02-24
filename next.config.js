const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.subconsciousvalley.workers.dev',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.subconsciousvalley.com',
          },
        ],
        destination: 'https://subconsciousvalley.com/:path*',
        permanent: true,
      },
    ]
  },
}

module.exports = withPWA(nextConfig)