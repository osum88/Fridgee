-- DropForeignKey
ALTER TABLE "food_variants" DROP CONSTRAINT "food_variants_food_catalog_id_fkey";

-- AddForeignKey
ALTER TABLE "food_variants" ADD CONSTRAINT "food_variants_food_catalog_id_fkey" FOREIGN KEY ("food_catalog_id") REFERENCES "food_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
