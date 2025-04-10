-- CreateTable
CREATE TABLE "Sleep" (
    "id" TEXT NOT NULL,
    "Hours" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "Sleep_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Sleep" ADD CONSTRAINT "Sleep_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
