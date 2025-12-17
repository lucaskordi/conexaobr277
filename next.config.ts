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
      {
        protocol: 'https',
        hostname: 'cdn.yampi.me',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'assets.yampi.me',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
};

export default nextConfig;
