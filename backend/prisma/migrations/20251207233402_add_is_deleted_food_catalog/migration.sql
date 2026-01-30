/*
  Warnings:

  - You are about to drop the column `is_global` on the `food_catalogs` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "food_catalogs" DROP COLUMN "is_global",
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "food_labels_catalog_id_idx" ON "food_labels"("catalog_id");
