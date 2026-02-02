-- DropForeignKey
ALTER TABLE "food_labels" DROP CONSTRAINT "food_labels_user_id_fkey";

-- AlterTable
ALTER TABLE "food_labels" ALTER COLUMN "user_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "food_labels" ADD CONSTRAINT "food_labels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
