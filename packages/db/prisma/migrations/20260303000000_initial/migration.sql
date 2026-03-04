-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "KycStatus" AS ENUM ('NONE', 'PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "OrderType" AS ENUM ('MINT', 'REDEEM');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "Caliber" AS ENUM ('NINE_MM_PRACTICE', 'NINE_MM_SELF_DEFENSE', 'FIVE_FIVE_SIX_SELF_DEFENSE', 'FIVE_FIVE_SIX_NATO_PRACTICE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "walletAddress" TEXT NOT NULL,
    "kycStatus" "KycStatus" NOT NULL DEFAULT 'NONE',
    "kycFullName" TEXT,
    "kycDateOfBirth" TIMESTAMP(3),
    "kycState" TEXT,
    "kycGovIdType" TEXT,
    "kycGovIdNumber" TEXT,
    "kycRejectionReason" TEXT,
    "kycSubmittedAt" TIMESTAMP(3),
    "kycReviewedAt" TIMESTAMP(3),
    "defaultShippingName" TEXT,
    "defaultShippingLine1" TEXT,
    "defaultShippingLine2" TEXT,
    "defaultShippingCity" TEXT,
    "defaultShippingState" TEXT,
    "defaultShippingZip" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "OrderType" NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "caliber" "Caliber" NOT NULL,
    "usdcAmount" TEXT,
    "tokenAmount" TEXT,
    "onChainOrderId" TEXT,
    "walletAddress" TEXT,
    "txHash" TEXT,
    "mintPrice" TEXT,
    "refundAmount" TEXT,
    "feeAmount" TEXT,
    "logIndex" INTEGER NOT NULL,
    "chainId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingAddress" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "zip" TEXT NOT NULL,

    CONSTRAINT "ShippingAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inventory" (
    "id" TEXT NOT NULL,
    "caliber" "Caliber" NOT NULL,
    "rounds" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlockCursor" (
    "id" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "chainId" INTEGER NOT NULL,
    "lastBlock" BIGINT NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockCursor_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "CaliberPrice" (
    "id" TEXT NOT NULL,
    "caliber" "Caliber" NOT NULL,
    "price" TEXT NOT NULL,
    "priceX18" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ammosquared',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaliberPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PriceSnapshot" (
    "id" TEXT NOT NULL,
    "caliber" "Caliber" NOT NULL,
    "price" TEXT NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'ammosquared',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_walletAddress_key" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "User_walletAddress_idx" ON "User"("walletAddress");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_txHash_idx" ON "Order"("txHash");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Order_walletAddress_idx" ON "Order"("walletAddress");

-- CreateIndex
CREATE INDEX "Order_onChainOrderId_idx" ON "Order"("onChainOrderId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_txHash_logIndex_key" ON "Order"("txHash", "logIndex");

-- CreateIndex
CREATE UNIQUE INDEX "ShippingAddress_orderId_key" ON "ShippingAddress"("orderId");

-- CreateIndex
CREATE UNIQUE INDEX "Inventory_caliber_key" ON "Inventory"("caliber");

-- CreateIndex
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "BlockCursor_contractAddress_key" ON "BlockCursor"("contractAddress");

-- CreateIndex
CREATE INDEX "BlockCursor_contractAddress_idx" ON "BlockCursor"("contractAddress");

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

-- CreateIndex
CREATE UNIQUE INDEX "CaliberPrice_caliber_key" ON "CaliberPrice"("caliber");

-- CreateIndex
CREATE INDEX "CaliberPrice_caliber_idx" ON "CaliberPrice"("caliber");

-- CreateIndex
CREATE INDEX "PriceSnapshot_caliber_createdAt_idx" ON "PriceSnapshot"("caliber", "createdAt");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShippingAddress" ADD CONSTRAINT "ShippingAddress_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPreference" ADD CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

