/*
  Warnings:

  - You are about to drop the `HomeGridSlot` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "homeImage" TEXT;

-- DropTable
DROP TABLE "HomeGridSlot";
