/*
  Warnings:

  - A unique constraint covering the columns `[Payoutpeople]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[Remaingpeople]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Challenge_Payoutpeople_key" ON "Challenge"("Payoutpeople");

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_Remaingpeople_key" ON "Challenge"("Remaingpeople");
