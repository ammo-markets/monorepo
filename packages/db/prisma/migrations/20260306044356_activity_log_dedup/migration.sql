/*
  Warnings:

  - A unique constraint covering the columns `[txHash,logIndex]` on the table `ActivityLog` will be added. If there are existing duplicate values, this will fail.
  - Made the column `txHash` on table `ActivityLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "ActivityLog" ADD COLUMN     "logIndex" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "txHash" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ActivityLog_txHash_logIndex_key" ON "ActivityLog"("txHash", "logIndex");
