/*
  Warnings:

  - The `PayoutStatus` column on the `Challenge` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `enddate` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startdate` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('pending', 'accepted', 'rejected');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "enddate" TEXT NOT NULL,
ADD COLUMN     "startdate" TEXT NOT NULL,
ADD COLUMN     "status" "Status" NOT NULL DEFAULT 'pending',
DROP COLUMN "PayoutStatus",
ADD COLUMN     "PayoutStatus" "Status" NOT NULL DEFAULT 'pending';
