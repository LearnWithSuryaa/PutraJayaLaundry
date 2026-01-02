import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable compression for faster data transfer
  compress: true,

  // Optimize images
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60, // Cache images for 60 seconds
  },

  // Experimental features
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
};

export default nextConfig;
