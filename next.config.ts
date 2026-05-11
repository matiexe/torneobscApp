import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    // Esto ayuda a Turbopack a entender la raíz correcta del proyecto
    root: '.',
  },
};

export default nextConfig;
