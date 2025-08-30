-- CreateEnum
CREATE TYPE "public"."ProjectStatus" AS ENUM ('PENDING', 'COMPLETED', 'ERROR');

-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "status" "public"."ProjectStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "name" DROP NOT NULL;
