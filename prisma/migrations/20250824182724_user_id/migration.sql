/*
  Warnings:

  - Added the required column `UserId` to the `Project` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Project" ADD COLUMN     "UserId" TEXT NOT NULL;
