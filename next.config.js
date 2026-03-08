/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  typescript: {
    tsconfigPath: './tsconfig.json'
  },
  eslint: {
    dirs: ['src']
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    domains: ['avatars.githubusercontent.com', 'github.com']
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      }
    ]
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY
  },
  poweredByHeader: false,
  compress: true
}

module.exports = nextConfig