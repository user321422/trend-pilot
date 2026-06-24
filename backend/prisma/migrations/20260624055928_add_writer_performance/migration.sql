/*
  Warnings:

  - You are about to drop the column `status` on the `Trend` table. All the data in the column will be lost.
  - You are about to drop the column `expertiseTags` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `historicalRating` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `maxLoad` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Brief" ADD COLUMN     "publishingGuidance" TEXT;

-- AlterTable
ALTER TABLE "Trend" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "expertiseTags",
DROP COLUMN "historicalRating",
DROP COLUMN "maxLoad",
DROP COLUMN "role";

-- DropEnum
DROP TYPE "Role";
