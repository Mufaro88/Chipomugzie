-- CreateTable
CREATE TABLE "MoneyMonth" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "enterprise" TEXT NOT NULL,
    "salesUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costsUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "MoneyMonth_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MoneyMonth_farmId_month_year_enterprise_key" ON "MoneyMonth"("farmId", "month", "year", "enterprise");

-- AddForeignKey
ALTER TABLE "MoneyMonth" ADD CONSTRAINT "MoneyMonth_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

