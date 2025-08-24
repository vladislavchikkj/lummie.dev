/*
  Warnings:

  - You are about to drop the column `UserId` on the `Project` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Project" DROP COLUMN "UserId",
ADD COLUMN     "userId" TEXT NOT NULL;
