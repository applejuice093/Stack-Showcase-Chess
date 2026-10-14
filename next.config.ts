import type { NextConfig } from "next";

/**
 * App Router chess demo — no special bundler flags required.
 * Keep reactStrictMode on (Next default) so accidental double effects
 * in the AI useEffect are caught during development.
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
