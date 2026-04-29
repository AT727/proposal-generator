import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // The repo root has its own package.json (Puppeteer for design work).
  // Pin Turbopack to this app dir so it picks the right lockfile.
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
