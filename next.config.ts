import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/color-scales',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
