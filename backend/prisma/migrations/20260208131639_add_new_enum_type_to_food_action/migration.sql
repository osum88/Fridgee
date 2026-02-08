-- AlterEnum
ALTER TYPE "FoodAction" ADD VALUE 'CATEGORY_RENAME';

-- DropForeignKey
ALTER TABLE "food_histories" DROP CONSTRAINT "food_histories_catalog_id_fkey";

-- AlterTable
ALTER TABLE "food_histories" ALTER COLUMN "catalog_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
