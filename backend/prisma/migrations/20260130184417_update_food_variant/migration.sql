/*
  Warnings:

  - A unique constraint covering the columns `[food_catalog_id,added_by]` on the table `food_variants` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "food_variants_food_catalog_id_added_by_idx";

-- CreateIndex
CREATE UNIQUE INDEX "food_variants_food_catalog_id_added_by_key" ON "food_variants"("food_catalog_id", "added_by");
