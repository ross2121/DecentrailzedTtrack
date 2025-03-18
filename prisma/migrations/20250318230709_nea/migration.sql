-- AlterTable
ALTER TABLE "User" ADD COLUMN     "HistoryCreated" TEXT[],
ADD COLUMN     "HistoryParticipated" TEXT[],
ADD COLUMN     "Participated" TEXT[],
ALTER COLUMN "privatekey" SET DATA TYPE TEXT;
