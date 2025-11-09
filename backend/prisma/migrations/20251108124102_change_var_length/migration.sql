/*
  Warnings:

  - You are about to alter the column `name` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(40)`.
  - You are about to alter the column `bank_number` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(70)`.
  - You are about to alter the column `surname` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(40)`.
  - You are about to alter the column `username` on the `users` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(30)`.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "name" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "bank_number" SET DATA TYPE VARCHAR(70),
ALTER COLUMN "surname" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "username" SET DATA TYPE VARCHAR(30);
