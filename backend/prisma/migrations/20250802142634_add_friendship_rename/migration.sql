/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `receiverId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `senderId` on the `Friendship` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Friendship` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[sender_id,receiver_id]` on the table `Friendship` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `receiver_id` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sender_id` to the `Friendship` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Friendship` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "Friendship" DROP CONSTRAINT "Friendship_senderId_fkey";

-- DropIndex
DROP INDEX "Friendship_senderId_receiverId_key";

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "createdAt",
DROP COLUMN "receiverId",
DROP COLUMN "senderId",
DROP COLUMN "updatedAt",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "receiver_id" INTEGER NOT NULL,
ADD COLUMN     "sender_id" INTEGER NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Friendship_sender_id_receiver_id_key" ON "Friendship"("sender_id", "receiver_id");

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
