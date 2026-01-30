/*
  Warnings:

  - You are about to alter the column `title` on the `food_variants` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `VarChar(40)`.

*/
-- DropIndex
DROP INDEX "food_variants_food_catalog_id_added_by_key";

-- AlterTable
ALTER TABLE "food_variants" ALTER COLUMN "title" SET DATA TYPE VARCHAR(40);

-- CreateIndex
CREATE INDEX "food_variants_title_food_catalog_id_added_by_idx" ON "food_variants"("title", "food_catalog_id", "added_by");
