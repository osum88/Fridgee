-- CreateEnum
CREATE TYPE "ShoppingListStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "shopping_lists" (
    "id" SERIAL NOT NULL,
    "inventory_id" INTEGER NOT NULL,
    "title" VARCHAR(50) NOT NULL,
    "created_by" INTEGER,
    "status" "ShoppingListStatus" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopping_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopping_list_items" (
    "id" SERIAL NOT NULL,
    "shopping_list_id" INTEGER NOT NULL,
    "catalog_id" INTEGER,
    "variant_id" INTEGER,
    "default_label_id" INTEGER,
    "custom_title" VARCHAR(100),
    "custom_description" VARCHAR(250),
    "custom_variant_title" VARCHAR(40),
    "custom_barcode" VARCHAR(150),
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "amount" DOUBLE PRECISION DEFAULT 0,
    "unit" "Unit",
    "estimated_price" DOUBLE PRECISION DEFAULT 0,
    "currency" "Currency" DEFAULT 'CZK',
    "is_checked" BOOLEAN NOT NULL DEFAULT false,
    "checked_by" INTEGER,
    "checked_at" TIMESTAMP(3),
    "added_by" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "shopping_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "shopping_lists_inventory_id_idx" ON "shopping_lists"("inventory_id");

-- CreateIndex
CREATE INDEX "shopping_list_items_shopping_list_id_idx" ON "shopping_list_items"("shopping_list_id");

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_inventory_id_fkey" FOREIGN KEY ("inventory_id") REFERENCES "food_inventory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_lists" ADD CONSTRAINT "shopping_lists_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_shopping_list_id_fkey" FOREIGN KEY ("shopping_list_id") REFERENCES "shopping_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_catalog_id_fkey" FOREIGN KEY ("catalog_id") REFERENCES "food_catalogs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "food_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_default_label_id_fkey" FOREIGN KEY ("default_label_id") REFERENCES "food_labels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_added_by_fkey" FOREIGN KEY ("added_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopping_list_items" ADD CONSTRAINT "shopping_list_items_checked_by_fkey" FOREIGN KEY ("checked_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
