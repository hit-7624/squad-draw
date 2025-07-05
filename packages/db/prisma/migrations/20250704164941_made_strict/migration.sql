/*
  Warnings:

  - Made the column `name` on table `rooms` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "rooms" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "password" SET NOT NULL;
