/*
  Warnings:

  - You are about to drop the column `food_id` on the `shopping_list_items` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "shopping_list_items" DROP CONSTRAINT "shopping_list_items_food_id_fkey";

-- AlterTable
ALTER TABLE "shopping_list_items" DROP COLUMN "food_id";
