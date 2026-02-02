-- AlterTable
ALTER TABLE "food_histories" ADD COLUMN     "variant_id" INTEGER;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "food_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;
