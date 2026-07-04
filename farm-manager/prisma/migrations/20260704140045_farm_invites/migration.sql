-- CreateTable
CREATE TABLE "FarmInvite" (
    "id" TEXT NOT NULL,
    "farmId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'manager',
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usedById" TEXT,
    "usedAt" TIMESTAMP(3),

    CONSTRAINT "FarmInvite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FarmInvite_code_key" ON "FarmInvite"("code");

-- AddForeignKey
ALTER TABLE "FarmInvite" ADD CONSTRAINT "FarmInvite_farmId_fkey" FOREIGN KEY ("farmId") REFERENCES "Farm"("id") ON DELETE CASCADE ON UPDATE CASCADE;

