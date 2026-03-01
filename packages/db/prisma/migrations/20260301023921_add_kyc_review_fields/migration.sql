-- AlterTable
ALTER TABLE "User" ADD COLUMN     "kycRejectionReason" TEXT,
ADD COLUMN     "kycReviewedAt" TIMESTAMP(3),
ADD COLUMN     "kycSubmittedAt" TIMESTAMP(3);
