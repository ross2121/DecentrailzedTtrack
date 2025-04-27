/*
  Warnings:

  - The values [sixty_days,eighthy_days] on the enum `Badges` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Badges_new" AS ENUM ('seven_days', 'fourteen_days', 'thirty_days', 'ninty_days', 'one_eighty_days');
ALTER TABLE "Stake" ALTER COLUMN "Badges" TYPE "Badges_new"[] USING ("Badges"::text::"Badges_new"[]);
ALTER TYPE "Badges" RENAME TO "Badges_old";
ALTER TYPE "Badges_new" RENAME TO "Badges";
DROP TYPE "Badges_old";
COMMIT;
