/*
  Warnings:

  - Added the required column `privatekey` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `publickey` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "privatekey" TEXT NOT NULL,
ADD COLUMN     "publickey" TEXT NOT NULL;
