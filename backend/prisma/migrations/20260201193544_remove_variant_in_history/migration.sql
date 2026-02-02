/*
  Warnings:

  - You are about to drop the column `variant_id` on the `food_histories` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "food_histories" DROP CONSTRAINT "food_histories_variant_id_fkey";

-- AlterTable
ALTER TABLE "food_histories" DROP COLUMN "variant_id";
