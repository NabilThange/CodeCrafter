/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Webpack configuration for external dependencies
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('better-sqlite3');
    }
    return config;
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },

  // Environment variables exposed to browser
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_VANE_URL: process.env.NEXT_PUBLIC_VANE_URL,
    NEXT_PUBLIC_PORTFOLIO_URL: process.env.NEXT_PUBLIC_PORTFOLIO_URL,
    NEXT_PUBLIC_WORLDMONITOR_URL: process.env.NEXT_PUBLIC_WORLDMONITOR_URL,
  },
};

export default nextConfig;
