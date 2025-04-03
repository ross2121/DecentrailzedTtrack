/*
  Warnings:

  - You are about to alter the column `Amount` on the `Challenge` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.
  - You are about to alter the column `Totalamount` on the `Challenge` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Integer`.

*/
-- AlterTable
ALTER TABLE "Challenge" ALTER COLUMN "Amount" SET DATA TYPE INTEGER,
ALTER COLUMN "Totalamount" SET DATA TYPE INTEGER;
