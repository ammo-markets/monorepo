-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "backedAt" TIMESTAMP(3),
ADD COLUMN     "backedBy" TEXT;

-- CreateIndex
CREATE INDEX "Order_type_status_backedAt_idx" ON "Order"("type", "status", "backedAt");
