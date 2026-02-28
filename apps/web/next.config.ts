import "./lib/env";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CHAIN: process.env.CHAIN,
  },
  transpilePackages: ["@ammo-exchange/shared", "@ammo-exchange/contracts"],
  serverExternalPackages: [
    "@ammo-exchange/db",
    "@prisma/client",
    "@prisma/adapter-pg",
  ],
  webpack: (config, { isServer }) => {
    // Resolve .js extension imports to .ts files in workspace packages
    // (ESM TypeScript uses .js extensions in imports but actual files are .ts)
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };

    // Prisma wasm modules must not be bundled by webpack
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        "@prisma/client": "commonjs @prisma/client",
      });
    }

    // Silence warnings from wagmi transitive deps (MetaMask SDK, WalletConnect/pino)
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "@react-native-async-storage/async-storage": false,
        "pino-pretty": false,
      };
    }

    return config;
  },
};

export default nextConfig;
