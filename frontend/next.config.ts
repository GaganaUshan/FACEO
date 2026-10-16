import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  turbopack: {
    // Explicitly set the root to the frontend directory so Turbopack
    // resolves node_modules from here instead of the repo root (FACEO/).
    root: path.join(__dirname),
  },
};

export default nextConfig;
