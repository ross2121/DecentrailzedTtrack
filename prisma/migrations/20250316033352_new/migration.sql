/*
  Warnings:

  - You are about to drop the column `members` on the `Challenge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Challenge" DROP COLUMN "members";

-- CreateTable
CREATE TABLE "_particiapted" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_particiapted_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_particiapted_B_index" ON "_particiapted"("B");

-- AddForeignKey
ALTER TABLE "_particiapted" ADD CONSTRAINT "_particiapted_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_particiapted" ADD CONSTRAINT "_particiapted_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
