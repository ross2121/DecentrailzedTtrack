/*
  Warnings:

  - Added the required column `WithdrawAmount` to the `Stake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentday` to the `Stake` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stake" ADD COLUMN     "WithdrawAmount" INTEGER NOT NULL,
ADD COLUMN     "currentday" INTEGER NOT NULL;
