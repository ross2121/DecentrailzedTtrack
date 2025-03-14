/*
  Warnings:

  - Changed the type of `Dailystep` on the `Challenge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `Amount` on the `Challenge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `Totalamount` on the `Challenge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "Dailystep",
ADD COLUMN     "Dailystep" INTEGER NOT NULL,
DROP COLUMN "Amount",
ADD COLUMN     "Amount" INTEGER NOT NULL,
DROP COLUMN "Totalamount",
ADD COLUMN     "Totalamount" INTEGER NOT NULL;
