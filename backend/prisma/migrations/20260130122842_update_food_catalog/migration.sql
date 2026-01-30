/*
  Warnings:

  - You are about to drop the column `amount` on the `food_catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `food_catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `unit` on the `food_catalogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "food_catalogs" DROP COLUMN "amount",
DROP COLUMN "price",
DROP COLUMN "unit";
