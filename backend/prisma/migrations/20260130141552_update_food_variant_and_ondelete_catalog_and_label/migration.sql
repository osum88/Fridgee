-- DropForeignKey
ALTER TABLE "food_labels" DROP CONSTRAINT "food_labels_catalog_id_fkey";

-- DropForeignKey
ALTER TABLE "food_labels" DROP CONSTRAINT "food_labels_user_id_fkey";

-- DropIndex
DROP INDEX "food_catalogs_barcode_added_by_key";

-- DropIndex
DROP INDEX "food_labels_user_id_catalog_id_key";

-- AlterTable
ALTER TABLE "food_labels" ALTER COLUMN "user_id" DROP NOT NULL;

-- AlterTable
ALTER TABLE "food_variants" ADD COLUMN     "added_by" INTEGER,
ADD COLUMN     "is_deleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "food_catalogs_barcode_added_by_idx" ON "food_catalogs"("barcode", "added_by");

-- CreateIndex
CREATE INDEX "food_labels_user_id_catalog_id_idx" ON "food_labels"("user_id", "catalog_id");

-- CreateIndex
CREATE INDEX "food_variants_food_catalog_id_added_by_idx" ON "food_variants"("food_catalog_id", "added_by");

-- AddForeignKey
ALTER TABLE "food_variants" ADD CONSTRAINT "food_variants_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
