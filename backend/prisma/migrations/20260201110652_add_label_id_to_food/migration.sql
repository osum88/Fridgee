/*
  Warnings:

  - You are about to drop the column `added_at` on the `food_instances` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "food_instances" DROP COLUMN "added_at";

-- AlterTable
ALTER TABLE "foods" ADD COLUMN     "default_label_id" INTEGER;

-- CreateIndex
CREATE INDEX "food_catalogs_barcode_idx" ON "food_catalogs"("barcode");

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_default_label_id_fkey" FOREIGN KEY ("default_label_id") REFERENCES "food_labels"("id") ON DELETE SET NULL ON UPDATE CASCADE;
