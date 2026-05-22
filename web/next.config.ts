import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // ably (used only in the server-side /api/ably-token route) pulls in `got`/`keyv`,
  // which webpack can't statically analyze. Keep it external so it's required at
  // runtime instead of bundled — silences the "Critical dependency" build warning.
  serverExternalPackages: ["ably"],
  webpack: (config) => {
    config.externals.push("pino-pretty", "lokijs", "encoding");
    config.resolve.fallback = {
      ...config.resolve.fallback,
      "@react-native-async-storage/async-storage": false,
    };
    return config;
  },
};

export default nextConfig;
