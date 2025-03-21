/*
  Warnings:

  - The `status` column on the `Challenge` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Completed" AS ENUM ('CurrentlyRunning', 'Completed');

-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "status",
ADD COLUMN     "status" "Completed" NOT NULL DEFAULT 'CurrentlyRunning';
