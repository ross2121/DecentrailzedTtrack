/*
  Warnings:

  - A unique constraint covering the columns `[challengeId,userId]` on the table `PayoutPerson` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[challengeId,userId]` on the table `RemainingPerson` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PayoutPerson_challengeId_userId_key" ON "PayoutPerson"("challengeId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "RemainingPerson_challengeId_userId_key" ON "RemainingPerson"("challengeId", "userId");
