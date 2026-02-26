/*
  Warnings:

  - You are about to drop the column `last_activity_at` on the `food_inventory` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Unit" ADD VALUE 'MULTIPACK';

-- AlterTable
ALTER TABLE "food_inventory" DROP COLUMN "last_activity_at";

-- AlterTable
ALTER TABLE "food_labels" ALTER COLUMN "description" SET DATA TYPE VARCHAR(250),
ALTER COLUMN "title" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "normalized_title" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "food_image_cloud_id" SET DATA TYPE VARCHAR(250);

-- CreateIndex
CREATE INDEX "food_labels_food_image_cloud_id_idx" ON "food_labels"("food_image_cloud_id");
