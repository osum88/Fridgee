/*
  Warnings:

  - You are about to drop the column `label` on the `food_inventory` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "FoodAction" ADD VALUE 'MEMBER_LEFT';
ALTER TYPE "FoodAction" ADD VALUE 'USER_JOINED';

-- AlterTable
ALTER TABLE "food_inventory" DROP COLUMN "label";
