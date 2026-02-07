import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ammo-exchange/db",
    "@ammo-exchange/shared",
    "@ammo-exchange/contracts",
  ],
};

export default nextConfig;
