/*
  Warnings:

  - Added the required column `Updateddate` to the `Stake` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stake" ADD COLUMN     "Updateddate" TEXT NOT NULL;
