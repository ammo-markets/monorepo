-- CreateTable
CREATE TABLE "ProtocolStats" (
    "id" TEXT NOT NULL,
    "caliber" "Caliber" NOT NULL,
    "totalMinted" TEXT NOT NULL DEFAULT '0',
    "totalRedeemed" TEXT NOT NULL DEFAULT '0',
    "netSupply" TEXT NOT NULL DEFAULT '0',
    "userCount" INTEGER NOT NULL DEFAULT 0,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ProtocolStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ActivityLog" (
    "id" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "caliber" "Caliber" NOT NULL,
    "amount" TEXT NOT NULL,
    "txHash" TEXT,
    "walletAddress" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ActivityLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "favoriteCalibers" "Caliber"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPreference_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProtocolStats_caliber_key" ON "ProtocolStats"("caliber");

-- CreateIndex
CREATE INDEX "ProtocolStats_caliber_idx" ON "ProtocolStats"("caliber");

-- CreateIndex
CREATE INDEX "ActivityLog_walletAddress_idx" ON "ActivityLog"("walletAddress");

-- CreateIndex
CREATE INDEX "ActivityLog_createdAt_idx" ON "ActivityLog"("createdAt");

-- CreateIndex
CREATE INDEX "ActivityLog_type_idx" ON "ActivityLog"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
