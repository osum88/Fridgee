/*
  Warnings:

  - You are about to drop the column `remove_at` on the `food_instances` table. All the data in the column will be lost.
  - You are about to drop the column `remove_by` on the `food_instances` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `foods` table. All the data in the column will be lost.
  - Added the required column `catalog_id` to the `food_histories` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "food_instances" DROP CONSTRAINT "food_instances_remove_by_fkey";

-- DropIndex
DROP INDEX "foods_catalog_id_idx";

-- DropIndex
DROP INDEX "foods_inventory_id_idx";

-- AlterTable
ALTER TABLE "food_histories" ADD COLUMN     "catalog_id" INTEGER NOT NULL,
ADD COLUMN     "metadata" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "price_id" INTEGER,
ADD COLUMN     "snapshot_amount" DOUBLE PRECISION,
ADD COLUMN     "snapshot_unit" "Unit";

-- AlterTable
ALTER TABLE "food_instances" DROP COLUMN "remove_at",
DROP COLUMN "remove_by";

-- AlterTable
ALTER TABLE "foods" DROP COLUMN "quantity";

-- CreateIndex
CREATE INDEX "food_categories_inventory_id_idx" ON "food_categories"("inventory_id");

-- CreateIndex
CREATE INDEX "food_histories_inventory_id_idx" ON "food_histories"("inventory_id");

-- CreateIndex
CREATE INDEX "food_histories_inventory_id_changed_by_idx" ON "food_histories"("inventory_id", "changed_by");

-- CreateIndex
CREATE INDEX "food_histories_inventory_id_changed_by_action_idx" ON "food_histories"("inventory_id", "changed_by", "action");

-- CreateIndex
CREATE INDEX "food_histories_inventory_id_action_idx" ON "food_histories"("inventory_id", "action");

-- CreateIndex
CREATE INDEX "food_instances_food_id_idx" ON "food_instances"("food_id");

-- CreateIndex
CREATE INDEX "food_instances_food_id_added_by_idx" ON "food_instances"("food_id", "added_by");

-- CreateIndex
CREATE INDEX "foods_inventory_id_catalog_id_idx" ON "foods"("inventory_id", "catalog_id");

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "prices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
