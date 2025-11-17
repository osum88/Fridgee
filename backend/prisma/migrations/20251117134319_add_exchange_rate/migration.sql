/*
  Warnings:

  - You are about to alter the column `custom_title` on the `food_labels` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(40)`.
  - You are about to alter the column `custom_description` on the `food_labels` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `custom_food_image_url` on the `food_labels` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(250)`.
  - You are about to drop the column `amount` on the `prices` table. All the data in the column will be lost.
  - The `exchange_rate` column on the `prices` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "food_labels" ALTER COLUMN "custom_title" SET DATA TYPE VARCHAR(40),
ALTER COLUMN "custom_description" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "custom_food_image_url" SET DATA TYPE VARCHAR(250);

-- AlterTable
ALTER TABLE "prices" DROP COLUMN "amount",
ADD COLUMN     "exchange_amount" JSONB NOT NULL DEFAULT '{}',
ADD COLUMN     "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
DROP COLUMN "exchange_rate",
ADD COLUMN     "exchange_rate" JSONB NOT NULL DEFAULT '{}';

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" SERIAL NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "country" VARCHAR(50) NOT NULL,
    "currency_code" VARCHAR(3) NOT NULL,
    "converted_currency_code" VARCHAR(3) NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "exchange_rate_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_currency_code_converted_currency_code_key" ON "exchange_rates"("currency_code", "converted_currency_code");
