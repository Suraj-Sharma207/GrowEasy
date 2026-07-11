import { prisma } from '../../config/db';
import { ProcessedLead, SkippedLeadRecord } from '../../types/import.types';

/**
 * Service responsible for database deduplication checks.
 * Compiles unique batch emails/phones and performs a single optimized query to detect conflicts.
 */
export class DuplicateDetectorService {
  /**
   * Pre-fetches all potentially conflicting records from the database in a single optimized query.
   * 
   * @param leads - All cleansed leads from the entire CSV import.
   * @returns In-memory Set collections for O(1) duplicate lookups.
   */
  async buildGlobalDuplicateCache(
    leads: ProcessedLead[]
  ): Promise<{ existingEmails: Set<string>; existingPhones: Set<string> }> {
    // Extract all emails and phones across the whole dataset
    const emails = leads.map((l) => l.email).filter(Boolean) as string[];
    const phones = leads.map((l) => l.mobileWithoutCountryCode).filter(Boolean) as string[];

    if (emails.length === 0 && phones.length === 0) {
      return { existingEmails: new Set(), existingPhones: new Set() };
    }

    // Single optimized query to fetch existing leads matching ANY email or phone from the dataset
    const existing = await prisma.lead.findMany({
      where: {
        OR: [
          { email: { in: emails, mode: 'insensitive' } },
          { mobileWithoutCountryCode: { in: phones } },
        ],
      },
      select: {
        email: true,
        mobileWithoutCountryCode: true,
      },
    });

    const existingEmails = new Set(
      existing
        .map((e) => e.email)
        .filter((email): email is string => !!email)
        .map((email) => email.toLowerCase())
    );
    const existingPhones = new Set(
      existing
        .map((e) => e.mobileWithoutCountryCode)
        .filter((phone): phone is string => !!phone)
    );

    return { existingEmails, existingPhones };
  }

  /**
   * Identifies leads in the batch that duplicate an email or phone number using the pre-fetched cache.
   * 
   * @param leads - Cleansed batch leads to inspect.
   * @param batchOffset - Index offset of current batch relative to complete CSV.
   * @param cache - Pre-fetched global database cache.
   * @returns Map of batch index to duplicate SkippedLeadRecord mappings.
   */
  detectDuplicatesWithCache(
    leads: ProcessedLead[],
    batchOffset: number,
    cache: { existingEmails: Set<string>; existingPhones: Set<string> }
  ): { duplicates: Map<number, SkippedLeadRecord> } {
    const duplicates = new Map<number, SkippedLeadRecord>();
    const { existingEmails, existingPhones } = cache;

    leads.forEach((lead, index) => {
      const rowNumber = batchOffset + index + 1;
      
      if (lead.email && existingEmails.has(lead.email.toLowerCase())) {
        duplicates.set(index, {
          rowNumber,
          email: lead.email,
          phone: lead.mobileWithoutCountryCode,
          reason: 'DUPLICATE_EMAIL',
          details: `Email '${lead.email}' already exists in database.`,
        });
      } else if (lead.mobileWithoutCountryCode && existingPhones.has(lead.mobileWithoutCountryCode)) {
        duplicates.set(index, {
          rowNumber,
          email: lead.email,
          phone: lead.mobileWithoutCountryCode,
          reason: 'DUPLICATE_PHONE',
          details: `Phone number '${lead.mobileWithoutCountryCode}' already exists in database.`,
        });
      }
    });

    return { duplicates };
  }
}

export const duplicateDetectorService = new DuplicateDetectorService();
