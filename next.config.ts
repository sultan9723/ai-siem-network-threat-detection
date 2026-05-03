import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure we use the src directory structure
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
