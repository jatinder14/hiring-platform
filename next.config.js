/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      'country-state-city',
      'lucide-react',
      '@editorjs/editorjs',
      'date-fns',
      'sonner'
    ],
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
