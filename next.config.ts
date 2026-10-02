import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A self-contained server (`.next/standalone/server.js`) that the Docker
  // runtime stage copies on its own, without node_modules.
  output: "standalone",
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    // Prerendered pages are still read from disk. What the server renders on
    // request (the 404 for an unknown slug) stays in its bounded in-memory
    // cache instead of being written under .next/server: the container's
    // filesystem is read-only, and random URLs must not be able to fill a disk.
    isrFlushToDisk: false,
  },
};

// MDX files are imported from `src/content`, never routed, so
// `pageExtensions` keeps its default.
const withMDX = createMDX();

export default withMDX(nextConfig);
