/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig