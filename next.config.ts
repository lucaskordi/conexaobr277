import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.yampi.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'king-assets.yampi.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.yampi.me',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
