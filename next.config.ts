import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server (`.next/standalone/server.js`) that the Docker
  // runtime stage copies on its own, without node_modules.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
