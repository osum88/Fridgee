-- DropIndex
DROP INDEX "shopping_list_items_shopping_list_id_unique_key_key";

-- CreateIndex
CREATE INDEX "shopping_list_items_shopping_list_id_unique_key_idx" ON "shopping_list_items"("shopping_list_id", "unique_key");
