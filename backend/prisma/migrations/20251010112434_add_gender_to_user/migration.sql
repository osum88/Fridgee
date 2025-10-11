-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER', 'UNSPECIFIED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "gender" "Gender" DEFAULT 'UNSPECIFIED';
