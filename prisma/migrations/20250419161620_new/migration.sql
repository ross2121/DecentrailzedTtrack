/*
  Warnings:

  - Added the required column `enddate` to the `Stake` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startdate` to the `Stake` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Stake" ADD COLUMN     "Status" "Completed" NOT NULL DEFAULT 'CurrentlyRunning',
ADD COLUMN     "enddate" TEXT NOT NULL,
ADD COLUMN     "startdate" TEXT NOT NULL;
