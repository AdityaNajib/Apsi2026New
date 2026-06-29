import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "192.168.1.31",
    "10.60.185.236",
    "10.60.192.88",
    "localhost",
    "127.0.0.1",
  ],
  devIndicators: false,
  experimental: {
    // Disable the dev overlay error toast
  },
};

export default nextConfig;
