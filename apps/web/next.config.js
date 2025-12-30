/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  // Disable API routes in static export
  trailingSlash: true,
};

module.exports = nextConfig;
