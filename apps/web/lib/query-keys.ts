export const queryKeys = {
  profile: {
    all: ["profile"] as const,
  },

  orders: {
    all: ["orders"] as const,
    list: (address: string) => ["orders", address] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },

  kyc: {
    all: ["kyc"] as const,
    status: (address: string) => ["kyc", address] as const,
  },

  admin: {
    kyc: {
      all: ["admin", "kyc"] as const,
      list: (params: { status?: string; search?: string; page?: number }) =>
        ["admin", "kyc", params.status, params.search, params.page] as const,
    },
    orders: {
      all: (type: string) => ["admin", "orders", type] as const,
      list: (
        type: string,
        params: { search?: string; caliber?: string; page?: number },
      ) =>
        [
          "admin",
          "orders",
          type,
          params.search,
          params.caliber,
          params.page,
        ] as const,
    },
    stats: {
      all: ["admin", "stats"] as const,
    },
    inventory: {
      all: ["admin", "inventory"] as const,
    },
  },

  market: {
    all: ["market"] as const,
  },

  protocolStats: {
    all: ["protocol-stats"] as const,
  },

  activity: {
    all: ["activity"] as const,
  },
} as const;
