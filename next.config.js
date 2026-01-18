/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  basePath: '/mt2.0-queuing-system',
  assetPrefix: '/mt2.0-queuing-system/',
  trailingSlash: true,
};

module.exports = nextConfig;
