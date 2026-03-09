-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OrderStatus" ADD VALUE 'APPROVED';
ALTER TYPE "OrderStatus" ADD VALUE 'PAID';

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "protocolFee" TEXT,
ADD COLUMN     "shippingCost" TEXT,
ADD COLUMN     "trackingId" TEXT;

-- CreateTable
CREATE TABLE "MarketConfig" (
    "id" TEXT NOT NULL,
    "caliber" "Caliber" NOT NULL,
    "mintFeeBps" INTEGER NOT NULL DEFAULT 150,
    "redeemFeeBps" INTEGER NOT NULL DEFAULT 150,
    "minMintRounds" INTEGER NOT NULL DEFAULT 50,
    "paused" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketConfig_caliber_key" ON "MarketConfig"("caliber");

-- CreateIndex
CREATE INDEX "MarketConfig_caliber_idx" ON "MarketConfig"("caliber");
