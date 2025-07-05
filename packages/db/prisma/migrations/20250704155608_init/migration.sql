/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `rooms` table. All the data in the column will be lost.
  - You are about to drop the column `isPublic` on the `rooms` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "rooms_inviteCode_key";

-- AlterTable
ALTER TABLE "rooms" DROP COLUMN "inviteCode",
DROP COLUMN "isPublic",
ALTER COLUMN "name" SET DEFAULT 'Untitled Room';
