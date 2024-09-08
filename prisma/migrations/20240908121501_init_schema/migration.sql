/*
  Warnings:

  - You are about to drop the column `fundsAmount` on the `Applicant` table. All the data in the column will be lost.
  - Added the required column `amount` to the `BankDetails` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Applicant" DROP COLUMN "fundsAmount";

-- AlterTable
ALTER TABLE "BankDetails" ADD COLUMN     "amount" INTEGER NOT NULL;
