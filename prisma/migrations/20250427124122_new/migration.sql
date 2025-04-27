/*
  Warnings:

  - Added the required column `misseday` to the `Stake` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stake" ADD COLUMN     "misseday" INTEGER NOT NULL;
