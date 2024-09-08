/*
  Warnings:

  - You are about to drop the column `collegeId` on the `Documents` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Documents` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[applicantId]` on the table `Documents` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Documents" DROP COLUMN "collegeId",
ADD COLUMN     "instituteId" "Status" NOT NULL DEFAULT 'notSubmitted',
ALTER COLUMN "incomeCertificate" DROP NOT NULL,
ALTER COLUMN "pwdCertificate" DROP NOT NULL,
ALTER COLUMN "casteCertificate" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Documents_id_key" ON "Documents"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Documents_applicantId_key" ON "Documents"("applicantId");
