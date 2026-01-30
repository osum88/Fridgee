/*
  Warnings:

  - You are about to drop the column `description` on the `food_catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `food_image_url` on the `food_catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `food_catalogs` table. All the data in the column will be lost.
  - You are about to drop the column `custom_description` on the `food_labels` table. All the data in the column will be lost.
  - You are about to drop the column `custom_food_image_url` on the `food_labels` table. All the data in the column will be lost.
  - You are about to drop the column `custom_title` on the `food_labels` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "food_labels" DROP CONSTRAINT "food_labels_catalog_id_fkey";

-- DropForeignKey
ALTER TABLE "food_labels" DROP CONSTRAINT "food_labels_user_id_fkey";

-- AlterTable
ALTER TABLE "food_catalogs" DROP COLUMN "description",
DROP COLUMN "food_image_url",
DROP COLUMN "title";

-- AlterTable
ALTER TABLE "food_labels" DROP COLUMN "custom_description",
DROP COLUMN "custom_food_image_url",
DROP COLUMN "custom_title",
ADD COLUMN     "description" VARCHAR(100),
ADD COLUMN     "food_image_url" VARCHAR(250),
ADD COLUMN     "title" VARCHAR(40);

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
