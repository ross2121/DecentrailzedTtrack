/*
  Warnings:

  - You are about to drop the column `Payoutpeople` on the `Challenge` table. All the data in the column will be lost.
  - You are about to drop the column `Remaingpeople` on the `Challenge` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Challenge_Payoutpeople_key";

-- DropIndex
DROP INDEX "Challenge_Remaingpeople_key";

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "Payoutpeople",
DROP COLUMN "Remaingpeople";

-- CreateTable
CREATE TABLE "PayoutPerson" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "PayoutPerson_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemainingPerson" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "RemainingPerson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PayoutPerson_userId_key" ON "PayoutPerson"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "RemainingPerson_userId_key" ON "RemainingPerson"("userId");

-- AddForeignKey
ALTER TABLE "PayoutPerson" ADD CONSTRAINT "PayoutPerson_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemainingPerson" ADD CONSTRAINT "RemainingPerson_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
