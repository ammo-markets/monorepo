-- AlterTable
ALTER TABLE "User" ADD COLUMN     "defaultShippingCity" TEXT,
ADD COLUMN     "defaultShippingLine1" TEXT,
ADD COLUMN     "defaultShippingLine2" TEXT,
ADD COLUMN     "defaultShippingName" TEXT,
ADD COLUMN     "defaultShippingState" TEXT,
ADD COLUMN     "defaultShippingZip" TEXT,
ADD COLUMN     "kycDateOfBirth" TIMESTAMP(3),
ADD COLUMN     "kycFullName" TEXT,
ADD COLUMN     "kycGovIdNumber" TEXT,
ADD COLUMN     "kycGovIdType" TEXT,
ADD COLUMN     "kycState" TEXT;
