-- CreateEnum
CREATE TYPE "CRMStatus" AS ENUM ('GOOD_LEAD_FOLLOW_UP', 'DID_NOT_CONNECT', 'BAD_LEAD', 'SALE_DONE');

-- CreateEnum
CREATE TYPE "DataSource" AS ENUM ('leads_on_demand', 'meridian_tower', 'eden_park', 'varah_swamy', 'sarjapur_plots');

-- CreateEnum
CREATE TYPE "ImportStatus" AS ENUM ('PROCESSING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "import_batches" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "totalRows" INTEGER NOT NULL DEFAULT 0,
    "importedRows" INTEGER NOT NULL DEFAULT 0,
    "skippedRows" INTEGER NOT NULL DEFAULT 0,
    "status" "ImportStatus" NOT NULL DEFAULT 'PROCESSING',
    "processingTime" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "import_batches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "countryCode" TEXT,
    "mobileWithoutCountryCode" TEXT,
    "company" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "leadOwner" TEXT,
    "crmStatus" "CRMStatus" NOT NULL DEFAULT 'GOOD_LEAD_FOLLOW_UP',
    "crmNote" TEXT,
    "dataSource" "DataSource",
    "possessionTime" TIMESTAMP(3),
    "description" TEXT,
    "importBatchId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skipped_leads" (
    "id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "rawData" JSONB NOT NULL,
    "batchId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "skipped_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "leads_createdAt_idx" ON "leads"("createdAt");

-- CreateIndex
CREATE INDEX "leads_email_idx" ON "leads"("email");

-- CreateIndex
CREATE INDEX "leads_mobileWithoutCountryCode_idx" ON "leads"("mobileWithoutCountryCode");

-- CreateIndex
CREATE INDEX "leads_crmStatus_idx" ON "leads"("crmStatus");

-- CreateIndex
CREATE INDEX "leads_company_idx" ON "leads"("company");

-- CreateIndex
CREATE INDEX "leads_city_idx" ON "leads"("city");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_importBatchId_fkey" FOREIGN KEY ("importBatchId") REFERENCES "import_batches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "skipped_leads" ADD CONSTRAINT "skipped_leads_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "import_batches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
