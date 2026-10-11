import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // cacheComponents dimatikan: aplikasi ini dinamis penuh (dashboard + API
  // agent memakai `export const dynamic = "force-dynamic"` sesuai AGENTS.md §8).
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  serverExternalPackages: ["@prisma/client", "prisma", "bcryptjs"],
  poweredByHeader: false,
};

export default nextConfig;
