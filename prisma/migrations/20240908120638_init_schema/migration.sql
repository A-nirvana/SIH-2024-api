/*
  Warnings:

  - You are about to drop the column `bankDetails` on the `Documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Applicant` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Documents_id_key";

-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "bankDetails";

-- CreateTable
CREATE TABLE "BankDetails" (
    "id" SERIAL NOT NULL,
    "IFSC" TEXT NOT NULL,
    "BRANCH_NAME" TEXT NOT NULL,
    "ACCOUNT_NO" TEXT NOT NULL,
    "applicantId" INTEGER NOT NULL,

    CONSTRAINT "BankDetails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BankDetails_applicantId_key" ON "BankDetails"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_id_key" ON "Applicant"("id");

-- AddForeignKey
ALTER TABLE "BankDetails" ADD CONSTRAINT "BankDetails_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
