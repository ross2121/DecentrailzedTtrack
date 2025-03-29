/*
  Warnings:

  - The values [accepted,rejected] on the enum `Status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Status_new" AS ENUM ('pending', 'payoutsucess', 'completed');
ALTER TABLE "Challenge" ALTER COLUMN "PayoutStatus" DROP DEFAULT;
ALTER TABLE "Challenge" ALTER COLUMN "PayoutStatus" TYPE "Status_new" USING ("PayoutStatus"::text::"Status_new");
ALTER TYPE "Status" RENAME TO "Status_old";
ALTER TYPE "Status_new" RENAME TO "Status";
DROP TYPE "Status_old";
ALTER TABLE "Challenge" ALTER COLUMN "PayoutStatus" SET DEFAULT 'pending';
COMMIT;
