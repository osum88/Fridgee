-- AlterTable
ALTER TABLE "food_labels" ADD COLUMN     "food_image_cloud_id" INTEGER;

-- CreateIndex
CREATE INDEX "food_labels_normalized_title_idx" ON "food_labels"("normalized_title");
