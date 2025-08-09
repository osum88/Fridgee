-- CreateEnum
CREATE TYPE "InvitationStatus" AS ENUM ('PENDING');

-- CreateTable
CREATE TABLE "inventory_invitations" (
    "id" SERIAL NOT NULL,
    "sender_id" INTEGER NOT NULL,
    "receiver_id" INTEGER NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "role" "InventoryRole" NOT NULL DEFAULT 'USER',
    "status" "InvitationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "inventory_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_invitations_sender_id_receiver_id_inventory_id_key" ON "inventory_invitations"("sender_id", "receiver_id", "inventory_id");

-- AddForeignKey
ALTER TABLE "inventory_invitations" ADD CONSTRAINT "inventory_invitations_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_invitations" ADD CONSTRAINT "inventory_invitations_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_invitations" ADD CONSTRAINT "inventory_invitations_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
