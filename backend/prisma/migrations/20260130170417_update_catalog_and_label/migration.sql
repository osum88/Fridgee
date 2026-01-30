/*
  Warnings:

  - A unique constraint covering the columns `[user_id,catalog_id]` on the table `food_labels` will be added. If there are existing duplicate values, this will fail.
  - Made the column `added_by` on table `food_catalogs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_id` on table `food_labels` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "food_catalogs" DROP CONSTRAINT "food_catalogs_added_by_fkey";

-- DropForeignKey
ALTER TABLE "food_labels" DROP CONSTRAINT "food_labels_user_id_fkey";

-- DropIndex
DROP INDEX "food_labels_user_id_catalog_id_idx";

-- AlterTable
ALTER TABLE "food_catalogs" ALTER COLUMN "added_by" SET NOT NULL;

-- AlterTable
ALTER TABLE "food_labels" ALTER COLUMN "user_id" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "food_labels_user_id_catalog_id_key" ON "food_labels"("user_id", "catalog_id");

-- AddForeignKey
ALTER TABLE "food_catalogs" ADD CONSTRAINT "food_catalogs_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
