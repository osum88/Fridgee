/*
  Warnings:

  - You are about to drop the column `preferredLanguage` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "preferredLanguage",
ADD COLUMN     "preferred_language" TEXT NOT NULL DEFAULT 'en';
