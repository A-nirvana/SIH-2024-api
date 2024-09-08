/*
  Warnings:

  - Added the required column `fundsAmount` to the `Applicant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "fundsAmount" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Documents" ADD COLUMN     "bankDetails" TEXT;
