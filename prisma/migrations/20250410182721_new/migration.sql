/*
  Warnings:

  - Added the required column `types` to the `Challenge` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CommpetionType" AS ENUM ('Steps', 'Sleep');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "Hours" TEXT,
ADD COLUMN     "types" "CommpetionType" NOT NULL,
ALTER COLUMN "Dailystep" DROP NOT NULL;
