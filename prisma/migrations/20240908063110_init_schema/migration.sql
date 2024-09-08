/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Status" AS ENUM ('submitted', 'notSubmitted', 'verified', 'notVerified', 'rejected');

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Applicant" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "fundsReceived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Funds" (
    "id" SERIAL NOT NULL,
    "funds" BIGINT NOT NULL,

    CONSTRAINT "Funds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Documents" (
    "id" SERIAL NOT NULL,
    "incomeCertificate" "Status" NOT NULL DEFAULT 'notSubmitted',
    "pwdCertificate" "Status" NOT NULL DEFAULT 'notSubmitted',
    "casteCertificate" "Status" NOT NULL DEFAULT 'notSubmitted',
    "collegeId" "Status" NOT NULL DEFAULT 'notSubmitted',
    "applicantId" INTEGER NOT NULL,

    CONSTRAINT "Documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_phone_key" ON "Applicant"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_email_key" ON "Applicant"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_phone_key" ON "Admin"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- AddForeignKey
ALTER TABLE "Documents" ADD CONSTRAINT "Documents_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
