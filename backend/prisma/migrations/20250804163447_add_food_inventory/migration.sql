-- CreateEnum
CREATE TYPE "InventoryRole" AS ENUM ('OWNER', 'EDITOR', 'USER');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "last_login" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "profile_picture_url" TEXT;

-- CreateTable
CREATE TABLE "food_inventory" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(100) NOT NULL,
    "label" VARCHAR(150),
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "member_count" INTEGER NOT NULL DEFAULT 0,
    "last_activity_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_inventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_users" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "role" "InventoryRole" NOT NULL DEFAULT 'USER',
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "notification_settings" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "inventory_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "inventory_users_user_id_inventory_id_key" ON "inventory_users"("user_id", "inventory_id");

-- AddForeignKey
ALTER TABLE "inventory_users" ADD CONSTRAINT "inventory_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_users" ADD CONSTRAINT "inventory_users_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
