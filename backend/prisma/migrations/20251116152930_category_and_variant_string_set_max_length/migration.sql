/*
  Warnings:

  - You are about to alter the column `title` on the `food_categories` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.
  - You are about to alter the column `title` on the `food_variants` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE "food_categories" ALTER COLUMN "title" SET DATA TYPE VARCHAR(50);

-- AlterTable
ALTER TABLE "food_variants" ALTER COLUMN "title" SET DATA TYPE VARCHAR(50);

-- CreateIndex
CREATE INDEX "food_variants_food_catalog_id_idx" ON "food_variants"("food_catalog_id");
