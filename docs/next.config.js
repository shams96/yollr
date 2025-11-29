/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  basePath: '/docs',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig