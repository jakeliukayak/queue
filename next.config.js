/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/queue',
  assetPrefix: '/queue/',
  trailingSlash: true,
};

module.exports = nextConfig;
