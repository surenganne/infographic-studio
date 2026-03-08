import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Allow images served from the internal API route
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
