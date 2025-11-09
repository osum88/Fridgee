/*
  Warnings:

  - The `description` column on the `food_catalogs` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "food_catalogs" DROP COLUMN "description",
ADD COLUMN     "description" JSONB DEFAULT '{}';
