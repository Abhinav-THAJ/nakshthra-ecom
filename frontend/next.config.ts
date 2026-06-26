import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const adminUrl = process.env.ADMIN_URL || 'http://localhost:3001';
    return [
      {
        source: '/admin',
        destination: `${adminUrl}/admin`,
      },
      {
        source: '/admin/:path*',
        destination: `${adminUrl}/admin/:path*`,
      }
    ];
  },
};

export default nextConfig;
