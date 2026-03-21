-- AlterEnum
ALTER TYPE "FoodAction" ADD VALUE 'ROLE_CHANGE';

-- CreateIndex
CREATE INDEX "inventory_invitations_receiver_id_inventory_id_idx" ON "inventory_invitations"("receiver_id", "inventory_id");

-- CreateIndex
CREATE INDEX "inventory_invitations_inventory_id_idx" ON "inventory_invitations"("inventory_id");
