/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  transpilePackages: [
    "@mui/x-charts",
    "@mui/material",
    "@mui/system",
    "@mui/utils",
  ],
  experimental: {
    optimizePackageImports: ["@mui/x-charts", "@mui/material"],
  },
};

export default nextConfig;
