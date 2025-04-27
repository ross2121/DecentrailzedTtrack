/*
  Warnings:

  - You are about to drop the column `Days` on the `Stake` table. All the data in the column will be lost.
  - You are about to drop the column `enddate` on the `Stake` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "Badges" AS ENUM ('seven_days', 'fourteen_days', 'thirty_days', 'sixty_days', 'eighthy_days');

-- AlterTable
ALTER TABLE "Stake" DROP COLUMN "Days",
DROP COLUMN "enddate",
ADD COLUMN     "Badges" "Badges"[];
