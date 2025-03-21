/*
  Warnings:

  - You are about to drop the column `payoutremainign` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "payoutremainign",
ADD COLUMN     "Remaingpeople" TEXT[];
