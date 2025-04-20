-- CreateTable
CREATE TABLE "StakePayment" (
    "id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "stakeId" TEXT NOT NULL,

    CONSTRAINT "StakePayment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StakePayment_stakeId_key" ON "StakePayment"("stakeId");

-- AddForeignKey
ALTER TABLE "StakePayment" ADD CONSTRAINT "StakePayment_stakeId_fkey" FOREIGN KEY ("stakeId") REFERENCES "Stake"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
