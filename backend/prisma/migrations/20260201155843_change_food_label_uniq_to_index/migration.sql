-- DropIndex
DROP INDEX "food_labels_user_id_catalog_id_key";

-- CreateIndex
CREATE INDEX "food_labels_user_id_catalog_id_idx" ON "food_labels"("user_id", "catalog_id");
