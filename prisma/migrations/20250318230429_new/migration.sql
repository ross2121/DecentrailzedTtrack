/*
  Warnings:

  - Changed the type of `privatekey` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "User" DROP COLUMN "privatekey",
ADD COLUMN     "privatekey" BYTEA NOT NULL;
