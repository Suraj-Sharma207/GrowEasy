import { MappedLeadRow, ProcessedLead, ImportWarning } from '../../types/import.types';

/**
 * Service responsible for data cleansing and normalization.
 * Formats phone country codes, trims white space, parses dates, and checks mapping confidence scores.
 */
export class LeadNormalizerService {
  private LOW_CONFIDENCE_THRESHOLD = 0.7;

  /**
   * Normalizes a raw AI-mapped lead record and compiles confidence warnings.
   * 
   * @param mappedRow - Mapped fields from AI extractor.
   * @param rowNumber - Index row number for warnings tracing.
   * @returns Cleaned lead entity ready for database validation.
   */
  normalizeRow(
    mappedRow: MappedLeadRow,
    rowNumber: number
  ): { lead: ProcessedLead; warnings: ImportWarning[] } {
    const warnings: ImportWarning[] = [];

    // Helper to extract value and record low-confidence warnings
    const extract = (field: keyof MappedLeadRow, defaultValue: string | null = null): string | null => {
      const data = mappedRow[field];
      if (!data) return defaultValue;
      
      const value = data.extractedValue;
      if (value === null || value === undefined) return defaultValue;

      if (data.confidenceScore < this.LOW_CONFIDENCE_THRESHOLD) {
        warnings.push({
          rowNumber,
          field,
          message: `Mapping for field '${field}' has low confidence (${Math.round(data.confidenceScore * 100)}%).`,
          confidenceScore: data.confidenceScore,
        });
      }

      return value.trim();
    };

    const rawName = extract('name') || '';
    const rawEmail = extract('email') || '';
    const rawPhone = extract('phone') || '';
    const rawCompany = extract('company');
    const rawCity = extract('city');
    const rawState = extract('state');
    const rawCountry = extract('country');
    const rawLeadOwner = extract('leadOwner') || 'Admin User';
    const rawCrmNote = extract('crmNote');
    const rawDescription = extract('description');
    const rawDataSource = extract('dataSource') || 'leads_on_demand';
    const rawPossessionTime = extract('possessionTime');
    const rawCreatedDate = extract('createdDate');

    // Email Normalization
    const email = rawEmail.toLowerCase().trim();

    // Phone Normalization
    let countryCode = '+91';
    let mobileWithoutCountryCode = '';

    const digitsOnly = rawPhone.replace(/\D/g, '');
    if (rawPhone.startsWith('+')) {
      // starts with country code, e.g. +919876543210
      if (digitsOnly.startsWith('91') && digitsOnly.length === 12) {
        countryCode = '+91';
        mobileWithoutCountryCode = digitsOnly.slice(2);
      } else if (digitsOnly.length > 10) {
        // dynamic country code
        const ccLength = digitsOnly.length - 10;
        countryCode = '+' + digitsOnly.slice(0, ccLength);
        mobileWithoutCountryCode = digitsOnly.slice(ccLength);
      } else {
        mobileWithoutCountryCode = digitsOnly;
      }
    } else {
      if (digitsOnly.length === 12 && digitsOnly.startsWith('91')) {
        countryCode = '+91';
        mobileWithoutCountryCode = digitsOnly.slice(2);
      } else {
        mobileWithoutCountryCode = digitsOnly;
      }
    }

    // Default possessionTime & createdAt dates
    let possessionTime: Date | null = null;
    if (rawPossessionTime) {
      const pDate = new Date(rawPossessionTime);
      if (!isNaN(pDate.getTime())) {
        possessionTime = pDate;
      }
    }

    let createdAt = new Date();
    if (rawCreatedDate) {
      const cDate = new Date(rawCreatedDate);
      if (!isNaN(cDate.getTime())) {
        createdAt = cDate;
      }
    }

    // Default crmStatus mapping
    // We default to 'GOOD_LEAD_FOLLOW_UP' since it maps to Prisma CRMStatus enum
    const crmStatus = 'GOOD_LEAD_FOLLOW_UP';

    // Data Source mapping (fallback to leads_on_demand if invalid)
    const validDataSources = ['leads_on_demand', 'meridian_tower', 'varah_swamy', 'eden_park', 'sarjapur_plots'];
    const dataSource = validDataSources.includes(rawDataSource) ? rawDataSource : 'leads_on_demand';

    const lead: ProcessedLead = {
      name: rawName,
      email,
      countryCode,
      mobileWithoutCountryCode,
      company: rawCompany,
      city: rawCity,
      state: rawState,
      country: rawCountry,
      leadOwner: rawLeadOwner,
      crmStatus,
      crmNote: rawCrmNote,
      description: rawDescription,
      dataSource,
      possessionTime,
      createdAt,
    };

    return { lead, warnings };
  }
}

export const leadNormalizerService = new LeadNormalizerService();
