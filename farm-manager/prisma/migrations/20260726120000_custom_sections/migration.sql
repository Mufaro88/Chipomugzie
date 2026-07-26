-- CreateTable
CREATE TABLE "FarmSection" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT NOT NULL DEFAULT '🐾',
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FarmSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FarmSectionClass" (
    "id" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FarmSectionClass_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomSectionEntry" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "openingStock" INTEGER NOT NULL DEFAULT 0,
    "births" INTEGER NOT NULL DEFAULT 0,
    "movedIn" INTEGER NOT NULL DEFAULT 0,
    "movedOut" INTEGER NOT NULL DEFAULT 0,
    "sold" INTEGER NOT NULL DEFAULT 0,
    "slaughtered" INTEGER NOT NULL DEFAULT 0,
    "deaths" INTEGER NOT NULL DEFAULT 0,
    "closingStock" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,

    CONSTRAINT "CustomSectionEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomClassCount" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CustomClassCount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmSection_farmId_name_key" ON "FarmSection"("farmId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "FarmSectionClass_sectionId_name_key" ON "FarmSectionClass"("sectionId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "CustomSectionEntry_censusId_sectionId_key" ON "CustomSectionEntry"("censusId", "sectionId");

-- CreateIndex
CREATE UNIQUE INDEX "CustomClassCount_entryId_classId_key" ON "CustomClassCount"("entryId", "classId");

-- AddForeignKey
ALTER TABLE "FarmSection" ADD CONSTRAINT "FarmSection_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FarmSectionClass" ADD CONSTRAINT "FarmSectionClass_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FarmSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionEntry" ADD CONSTRAINT "CustomSectionEntry_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomSectionEntry" ADD CONSTRAINT "CustomSectionEntry_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "FarmSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomClassCount" ADD CONSTRAINT "CustomClassCount_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "CustomSectionEntry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomClassCount" ADD CONSTRAINT "CustomClassCount_classId_fkey" FOREIGN KEY ("classId") REFERENCES "FarmSectionClass"("id") ON DELETE CASCADE ON UPDATE CASCADE;

