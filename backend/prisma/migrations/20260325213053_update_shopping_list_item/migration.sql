/*
  Warnings:

  - You are about to drop the column `variant_id` on the `shopping_list_items` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[shopping_list_id,unique_key]` on the table `shopping_list_items` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `unique_key` to the `shopping_list_items` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "shopping_list_items" DROP CONSTRAINT "shopping_list_items_variant_id_fkey";

-- DropIndex
DROP INDEX "shopping_list_items_shopping_list_id_idx";

-- AlterTable
ALTER TABLE "shopping_list_items" DROP COLUMN "variant_id",
ADD COLUMN     "food_id" INTEGER,
ADD COLUMN     "unique_key" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "shopping_list_items_shopping_list_id_unique_key_key" ON "shopping_list_items"("shopping_list_id", "unique_key");

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;
