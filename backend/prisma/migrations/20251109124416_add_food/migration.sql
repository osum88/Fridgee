/*
  Warnings:

  - You are about to alter the column `title` on the `food_inventory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(100)` to `VarChar(50)`.
  - You are about to alter the column `label` on the `food_inventory` table. The data in that column could be lost. The data in that column will be cast from `VarChar(150)` to `VarChar(100)`.

*/
-- CreateEnum
CREATE TYPE "Unit" AS ENUM ('MG', 'G', 'DG', 'KG', 'ML', 'CL', 'DL', 'L');

-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('CZK', 'EUR');

-- CreateEnum
CREATE TYPE "FoodAction" AS ENUM ('ADD', 'CONSUME', 'UPDATE', 'EXPIRE', 'REMOVE');

-- DropForeignKey
ALTER TABLE "inventory_users" DROP CONSTRAINT "inventory_users_inventory_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory_users" DROP CONSTRAINT "inventory_users_user_id_fkey";

-- AlterTable
ALTER TABLE "food_inventory" ALTER COLUMN "title" SET DATA TYPE VARCHAR(50),
ALTER COLUMN "label" SET DATA TYPE VARCHAR(100);

-- CreateTable
CREATE TABLE "food_catalogs" (
    "id" SERIAL NOT NULL,
    "barcode" VARCHAR(150),
    "title" JSONB NOT NULL DEFAULT '{}',
    "description" TEXT DEFAULT '{}',
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "unit" "Unit",
    "added_by" INTEGER,
    "is_global" BOOLEAN NOT NULL DEFAULT false,
    "food_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_catalogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "foods" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "category_id" INTEGER,
    "catalog_id" INTEGER NOT NULL,
    "variant_id" INTEGER,
    "quantity" INTEGER NOT NULL,
    "minimal_quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "foods_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_instances" (
    "id" SERIAL NOT NULL,
    "food_id" INTEGER NOT NULL,
    "price_id" INTEGER,
    "expiration_date" TIMESTAMP(3),
    "added_by" INTEGER,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remove_by" INTEGER,
    "remove_at" TIMESTAMP(3),
    "unit" "Unit",
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_instances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_variants" (
    "id" SERIAL NOT NULL,
    "food_catalog_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_categories" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "food_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prices" (
    "id" SERIAL NOT NULL,
    "amount" JSONB NOT NULL DEFAULT '{}',
    "base_currency" "Currency" NOT NULL DEFAULT 'CZK',
    "exchange_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exchange_rate_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_histories" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "food_id" INTEGER,
    "food_instance_id" INTEGER,
    "action" "FoodAction" NOT NULL DEFAULT 'ADD',
    "changed_by" INTEGER,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "quantity_before" INTEGER NOT NULL DEFAULT 0,
    "quantity_after" INTEGER NOT NULL,

    CONSTRAINT "food_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "food_labels" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "catalog_id" INTEGER NOT NULL,
    "custom_title" TEXT,
    "custom_description" TEXT,
    "custom_food_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "food_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "food_catalogs_barcode_added_by_key" ON "food_catalogs"("barcode", "added_by");

-- CreateIndex
CREATE INDEX "foods_inventory_id_idx" ON "foods"("inventory_id");

-- CreateIndex
CREATE INDEX "foods_catalog_id_idx" ON "foods"("catalog_id");

-- CreateIndex
CREATE UNIQUE INDEX "foods_inventory_id_catalog_id_variant_id_key" ON "foods"("inventory_id", "catalog_id", "variant_id");

-- CreateIndex
CREATE UNIQUE INDEX "food_labels_user_id_catalog_id_key" ON "food_labels"("user_id", "catalog_id");

-- AddForeignKey
ALTER TABLE "inventory_users" ADD CONSTRAINT "inventory_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_users" ADD CONSTRAINT "inventory_users_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_catalogs" ADD CONSTRAINT "food_catalogs_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "food_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "foods" ADD CONSTRAINT "foods_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "food_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_instances" ADD CONSTRAINT "food_instances_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_instances" ADD CONSTRAINT "food_instances_remove_by_fkey" FOREIGN KEY ("remove_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_instances" ADD CONSTRAINT "food_instances_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_instances" ADD CONSTRAINT "food_instances_price_id_fkey" FOREIGN KEY ("price_id") REFERENCES "prices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_variants" ADD CONSTRAINT "food_variants_food_catalog_id_fkey" FOREIGN KEY ("food_catalog_id") REFERENCES "food_catalogs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_categories" ADD CONSTRAINT "food_categories_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_food_id_fkey" FOREIGN KEY ("food_id") REFERENCES "foods"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_histories" ADD CONSTRAINT "food_histories_food_instance_id_fkey" FOREIGN KEY ("food_instance_id") REFERENCES "food_instances"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
