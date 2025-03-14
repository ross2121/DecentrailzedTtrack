-- CreateTable
CREATE TABLE "Steps" (
    "id" TEXT NOT NULL,
    "steps" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "userid" TEXT NOT NULL,

    CONSTRAINT "Steps_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Steps" ADD CONSTRAINT "Steps_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
