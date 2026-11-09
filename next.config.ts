import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Next 16 defaults dynamic routes to a 0s client router-cache lifetime, so every
    // sidebar click re-requests the RSC payload. Keeping visited/prefetched routes
    // in memory for a few minutes makes menu navigation instant with no loading UI.
    staleTimes: {
      dynamic: 300,
      static: 300,
    },
  },
};

export default nextConfig;
