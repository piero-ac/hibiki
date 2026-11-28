import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
    // Vercel restores .next/cache between builds, and a restored Turbopack
    // build cache once shipped a stale globals.css (the old theme) to
    // production. Build from clean source every time.
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
