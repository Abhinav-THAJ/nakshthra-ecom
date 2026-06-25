import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/admin',
        destination: 'http://localhost:3001',
        permanent: false,
      },
      {
        source: '/admin/:path*',
        destination: 'http://localhost:3001/:path*',
        permanent: false,
      }
    ];
  },
};

export default nextConfig;
