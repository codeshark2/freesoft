/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  reactStrictMode: true,
  // Disable automatic static optimization to prevent build-time rendering issues
  trailingSlash: true,
};

module.exports = nextConfig;
