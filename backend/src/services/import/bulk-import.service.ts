import { prisma } from '../../config/db';
import { ProcessedLead, SkippedLeadRecord } from '../../types/import.types';
import { AppError } from '../../errors/app-error';
import { HttpStatus } from '../../constants/http-status.constants';

/**
 * Service responsible for database persistence.
 * Creates an ImportBatch registry and inserts leads and skipped records in a single database transaction.
 */
export class BulkImportService {
  /**
   * Execute bulk inserts inside a Prisma transaction block.
   * 
   * @param fileName - Original name of the imported file.
   * @param validLeads - Array of cleansed, validated processed leads.
   * @param skippedLeads - Array of duplicate or malformed records.
   * @param processingTimeMs - Execution duration metrics.
   * @returns Created batch UUID reference.
   */
  async execute(
    fileName: string,
    validLeads: ProcessedLead[],
    skippedLeads: SkippedLeadRecord[],
    processingTimeMs: number
  ): Promise<string> {
    try {
      return await prisma.$transaction(async (tx) => {
        // Create ImportBatch
        const batch = await tx.importBatch.create({
          data: {
            fileName,
            totalRows: validLeads.length + skippedLeads.length,
            importedRows: validLeads.length,
            skippedRows: skippedLeads.length,
            status: 'COMPLETED',
            processingTime: processingTimeMs / 1000,
          },
        });

        // 1. Bulk Insert Leads
        if (validLeads.length > 0) {
          const leadsData = validLeads.map((lead) => ({
            name: lead.name,
            email: lead.email,
            countryCode: lead.countryCode,
            mobileWithoutCountryCode: lead.mobileWithoutCountryCode,
            company: lead.company,
            city: lead.city,
            state: lead.state,
            country: lead.country,
            leadOwner: lead.leadOwner,
            crmStatus: lead.crmStatus as any, // Cast to match Prisma schema enum
            crmNote: lead.crmNote,
            description: lead.description,
            dataSource: lead.dataSource as any, // Cast to match Prisma schema enum
            possessionTime: lead.possessionTime,
            importBatchId: batch.id,
            createdAt: lead.createdAt,
          }));

          await tx.lead.createMany({
            data: leadsData,
          });
        }

        // 2. Bulk Insert Skipped Leads
        if (skippedLeads.length > 0) {
          const skippedData = skippedLeads.map((skipped) => ({
            reason: skipped.reason,
            rawData: {
              email: skipped.email,
              phone: skipped.phone,
              details: skipped.details,
              rowNumber: skipped.rowNumber,
            } as any,
            batchId: batch.id,
          }));

          await tx.skippedLead.createMany({
            data: skippedData,
          });
        }

        return batch.id;
      });
    } catch (error: any) {
      console.error('[BulkImportService] Transaction failed:', error);
      throw new AppError(
        `Failed to persist bulk import to database: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}

export const bulkImportService = new BulkImportService();
