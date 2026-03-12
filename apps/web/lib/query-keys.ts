export const queryKeys = {
  orders: {
    all: ["orders"] as const,
    list: (address: string) => ["orders", address] as const,
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },

  admin: {
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
    history: (caliber: string, range: string) =>
      ["market", "history", caliber, range] as const,
  },

  protocolStats: {
    all: ["protocol-stats"] as const,
  },

  activity: {
    all: ["activity"] as const,
  },
} as const;
