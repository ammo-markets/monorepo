-- DropIndex
DROP INDEX "Order_txHash_key";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "amount",
ADD COLUMN     "logIndex" INTEGER NOT NULL,
ADD COLUMN     "usdcAmount" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Order_txHash_logIndex_key" ON "Order"("txHash", "logIndex");
