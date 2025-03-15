-- CreateEnum
CREATE TYPE "Challengetype" AS ENUM ('public', 'private');

-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "type" "Challengetype" NOT NULL DEFAULT 'public';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "Friends" TEXT[],
ADD COLUMN     "Request" TEXT[];
