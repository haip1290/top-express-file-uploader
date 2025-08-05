/*
  Warnings:

  - Added the required column `size` to the `File` table without a default value. This is not possible if the table is not empty.
  - Added the required column `uploadAt` to the `File` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "File" ADD COLUMN     "size" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "uploadAt" TIMESTAMP(3) NOT NULL;
