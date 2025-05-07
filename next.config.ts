import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */  async headers() {
    return [
      {
        source: '/trf-files/:path*',
        headers: [
          {
            key: 'Content-Disposition',
            value: 'attachment',
          },
          {
            key: 'Content-Type',
            value: 'text/plain; charset=utf-8',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
