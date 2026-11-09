import type { NextConfig } from "next";

const cors = [
  { key: "Access-Control-Allow-Origin", value: "*" },
  { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      { source: "/api/:path*", headers: cors },
      { source: "/export/:path*", headers: cors },
      { source: "/llms.txt", headers: cors },
    ];
  },
};

export default nextConfig;
