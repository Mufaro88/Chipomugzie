-- CreateTable
CREATE TABLE "Expense" (
    "id" TEXT NOT NULL,
    "censusId" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'feed',
    "description" TEXT NOT NULL,
    "amountUsd" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Expense_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "type" TEXT NOT NULL DEFAULT 'suggestion',
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Expense" ADD CONSTRAINT "Expense_censusId_fkey" FOREIGN KEY ("censusId") REFERENCES "MonthlyCensus"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
