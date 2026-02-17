import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  transpilePackages: ["@ammo-exchange/shared"],
  webpack: (config) => {
    // Resolve .js extension imports to .ts files in workspace packages
    // (ESM TypeScript uses .js extensions in imports but actual files are .ts)
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };

    return config;
  },
};

export default nextConfig;
