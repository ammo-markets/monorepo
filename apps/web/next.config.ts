import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ammo-exchange/shared",
    "@ammo-exchange/contracts",
  ],
  serverExternalPackages: ["@ammo-exchange/db", "@prisma/client", "@prisma/adapter-pg"],
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
    return config;
  },
};

export default nextConfig;
