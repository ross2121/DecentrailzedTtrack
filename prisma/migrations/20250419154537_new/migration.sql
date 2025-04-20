-- CreateTable
CREATE TABLE "Stake" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "Days" INTEGER NOT NULL,
    "Hours" TEXT NOT NULL,
    "Userid" TEXT NOT NULL,

    CONSTRAINT "Stake_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Stake_id_key" ON "Stake"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Stake_Userid_key" ON "Stake"("Userid");

-- AddForeignKey
ALTER TABLE "Stake" ADD CONSTRAINT "Stake_Userid_fkey" FOREIGN KEY ("Userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
