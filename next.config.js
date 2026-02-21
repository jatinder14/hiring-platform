/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['country-state-city', 'lucide-react'],
  },
  async redirects() {
    return [
      {
        source: '/auth/login',
        destination: '/sign-in',
        permanent: true,
      },
      {
        source: '/auth/register',
        destination: '/sign-up',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
