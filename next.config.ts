import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    // Esto ayuda a Turbopack a entender la raíz correcta del proyecto
    turbo: {
      root: '.',
    },
  },
};

export default nextConfig;
