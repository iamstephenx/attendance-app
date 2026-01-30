import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Allow Turbopack with no extra config
  turbopack: {},
};

export default nextConfig;
