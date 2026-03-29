import pkg from './package.json' with { type: 'json' };

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        hostname: 's2.googleusercontent.com',
      },
    ],
  },
  serverExternalPackages: ['pdf-parse'],
  outputFileTracingIncludes: {
    '/api/**': [
      './node_modules/@napi-rs/canvas/**',
      './node_modules/@napi-rs/canvas-linux-x64-gnu/**',
      './node_modules/@napi-rs/canvas-linux-x64-musl/**',
    ],
  },
  env: {
    NEXT_PUBLIC_VERSION: pkg.version,
  },
  async rewrites() {
    const worldMonitorUrl = process.env.NEXT_PUBLIC_WORLDMONITOR_URL || 'http://localhost:5173';
    const portfolioUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'http://localhost:3001';
    return [
      {
        source: '/monitor',
        destination: worldMonitorUrl,
      },
      {
        source: '/monitor/:path*',
        destination: `${worldMonitorUrl}/:path*`,
      },
      {
        source: '/portfolio',
        destination: portfolioUrl,
      },
      {
        source: '/portfolio/:path*',
        destination: `${portfolioUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
