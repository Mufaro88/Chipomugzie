-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "phone" TEXT,
    "role" TEXT NOT NULL DEFAULT 'owner',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Farm" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "ownerId" TEXT NOT NULL,
    "tier" TEXT NOT NULL DEFAULT 'free',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Farm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',

    CONSTRAINT "FarmAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyCensus" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MonthlyCensus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BeefSection" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL DEFAULT 0,
    "births" INTEGER NOT NULL DEFAULT 0,
    "movedIn" INTEGER NOT NULL DEFAULT 0,
    "movedOut" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "slaughtered" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "closingStock" INTEGER NOT NULL DEFAULT 0,
    "bulls" INTEGER NOT NULL DEFAULT 0,
    "juvenileBulls" INTEGER NOT NULL DEFAULT 0,
    "cows" INTEGER NOT NULL DEFAULT 0,
    "bullingHeifers" INTEGER NOT NULL DEFAULT 0,
    "weanerHeifers" INTEGER NOT NULL DEFAULT 0,
    "feederSteers" INTEGER NOT NULL DEFAULT 0,
    "weanerSteers" INTEGER NOT NULL DEFAULT 0,
    "weanerMaleCalves" INTEGER NOT NULL DEFAULT 0,
    "calfSteers" INTEGER NOT NULL DEFAULT 0,
    "maleCaves" INTEGER NOT NULL DEFAULT 0,
    "femaleCalves" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "BeefSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DairySection" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL DEFAULT 0,
    "births" INTEGER NOT NULL DEFAULT 0,
    "movedIn" INTEGER NOT NULL DEFAULT 0,
    "movedOut" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "slaughtered" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "closingStock" INTEGER NOT NULL DEFAULT 0,
    "bulls" INTEGER NOT NULL DEFAULT 0,
    "juvenileBulls" INTEGER NOT NULL DEFAULT 0,
    "milkingCows" INTEGER NOT NULL DEFAULT 0,
    "dryCows" INTEGER NOT NULL DEFAULT 0,
    "bullingHeifers" INTEGER NOT NULL DEFAULT 0,
    "weanerHeifers" INTEGER NOT NULL DEFAULT 0,
    "feederSteers" INTEGER NOT NULL DEFAULT 0,
    "weanerSteers" INTEGER NOT NULL DEFAULT 0,
    "weanerMaleCalves" INTEGER NOT NULL DEFAULT 0,
    "calfSteers" INTEGER NOT NULL DEFAULT 0,
    "maleCalves" INTEGER NOT NULL DEFAULT 0,
    "femaleCalves" INTEGER NOT NULL DEFAULT 0,
    "totalMilkYield" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedConsumedBags" INTEGER NOT NULL DEFAULT 0,
    "feedWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "notes" TEXT,

    CONSTRAINT "DairySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GoatSection" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL DEFAULT 0,
    "births" INTEGER NOT NULL DEFAULT 0,
    "movedIn" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "slaughtered" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "movedOut" INTEGER NOT NULL DEFAULT 0,
    "closingStock" INTEGER NOT NULL DEFAULT 0,
    "bucks" INTEGER NOT NULL DEFAULT 0,
    "juvenileBucks" INTEGER NOT NULL DEFAULT 0,
    "does" INTEGER NOT NULL DEFAULT 0,
    "maidenDoes" INTEGER NOT NULL DEFAULT 0,
    "castratedWeaners" INTEGER NOT NULL DEFAULT 0,
    "castratedMaleKids" INTEGER NOT NULL DEFAULT 0,
    "femaleKids" INTEGER NOT NULL DEFAULT 0,
    "maleKids" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "GoatSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LayerSection" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL DEFAULT 0,
    "mortalities" INTEGER NOT NULL DEFAULT 0,
    "movedIn" INTEGER NOT NULL DEFAULT 0,
    "closingStock" INTEGER NOT NULL DEFAULT 0,
    "cratesCollected" INTEGER NOT NULL DEFAULT 0,
    "eggTraysDelivered" INTEGER NOT NULL DEFAULT 0,
    "breakagesCrates" INTEGER NOT NULL DEFAULT 0,
    "binnedCrates" INTEGER NOT NULL DEFAULT 0,
    "averageLayingPct" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feedConsumedBags" INTEGER NOT NULL DEFAULT 0,
    "feedWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "notes" TEXT,

    CONSTRAINT "LayerSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BroilerSection" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL DEFAULT 0,
    "received" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "closingStock" INTEGER NOT NULL DEFAULT 0,
    "starterBags" INTEGER NOT NULL DEFAULT 0,
    "growerBags" INTEGER NOT NULL DEFAULT 0,
    "finisherBags" INTEGER NOT NULL DEFAULT 0,
    "feedWeightKg" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "notes" TEXT,

    CONSTRAINT "BroilerSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CropActivity" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "cropName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'field',
    "hectares" DOUBLE PRECISION,
    "activity" TEXT NOT NULL,
    "plantedDate" TEXT,
    "daysToMaturity" INTEGER,
    "notes" TEXT,

    CONSTRAINT "CropActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkshopItem" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'equipment',
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "notes" TEXT,

    CONSTRAINT "WorkshopItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValues" TEXT,
    "newValues" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "FarmAccess_userId_farmId_key" ON "FarmAccess"("userId", "farmId");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyCensus_farmId_month_year_key" ON "MonthlyCensus"("farmId", "month", "year");

-- CreateIndex
CREATE UNIQUE INDEX "BeefSection_censusId_key" ON "BeefSection"("censusId");

-- CreateIndex
CREATE UNIQUE INDEX "DairySection_censusId_key" ON "DairySection"("censusId");

-- CreateIndex
CREATE UNIQUE INDEX "GoatSection_censusId_key" ON "GoatSection"("censusId");

-- CreateIndex
CREATE UNIQUE INDEX "LayerSection_censusId_key" ON "LayerSection"("censusId");

-- CreateIndex
CREATE UNIQUE INDEX "BroilerSection_censusId_key" ON "BroilerSection"("censusId");

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmAccess" ADD CONSTRAINT "FarmAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmAccess" ADD CONSTRAINT "FarmAccess_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyCensus" ADD CONSTRAINT "MonthlyCensus_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyCensus" ADD CONSTRAINT "MonthlyCensus_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BeefSection" ADD CONSTRAINT "BeefSection_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DairySection" ADD CONSTRAINT "DairySection_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GoatSection" ADD CONSTRAINT "GoatSection_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LayerSection" ADD CONSTRAINT "LayerSection_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BroilerSection" ADD CONSTRAINT "BroilerSection_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CropActivity" ADD CONSTRAINT "CropActivity_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkshopItem" ADD CONSTRAINT "WorkshopItem_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
