-- DropForeignKey
ALTER TABLE "food_catalogs" DROP CONSTRAINT "food_catalogs_added_by_fkey";

-- AlterTable
ALTER TABLE "food_catalogs" ALTER COLUMN "added_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "food_catalogs" ADD CONSTRAINT "food_catalogs_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
