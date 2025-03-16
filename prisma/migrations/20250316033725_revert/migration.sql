/*
  Warnings:

  - You are about to drop the `_particiapted` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_particiapted" DROP CONSTRAINT "_particiapted_A_fkey";

-- DropForeignKey
ALTER TABLE "_particiapted" DROP CONSTRAINT "_particiapted_B_fkey";

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "members" TEXT[];

-- DropTable
DROP TABLE "_particiapted";
