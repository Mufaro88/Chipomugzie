-- AlterTable
ALTER TABLE "MonthlyCensus" ADD COLUMN     "shareToken" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "referralCode" TEXT,
ADD COLUMN     "referredById" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyCensus_shareToken_key" ON "MonthlyCensus"("shareToken");

-- CreateIndex
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

