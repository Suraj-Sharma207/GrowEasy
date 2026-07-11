import { ProcessedLead, SkippedLeadRecord } from '../../types/import.types';

/**
 * Service responsible for validating individual normalized lead records.
 * Checks structural bounds (presence, format, allowed values) against database constrains.
 */
export class LeadValidationService {
  private emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  private phoneRegex = /^\d{10}$/; // standard 10 digit number

  /**
   * Evaluates if a normalized record is fit for bulk persistence.
   * 
   * @param lead - Cleansed processed lead object.
   * @param rowNumber - Row index representation.
   * @returns SkippedLeadRecord if validation fails, else null.
   */
  validateRow(
    lead: ProcessedLead,
    rowNumber: number
  ): SkippedLeadRecord | null {
    if (!lead.name) {
      return {
        rowNumber,
        reason: 'MISSING_REQUIRED',
        details: 'Name is a required field.',
      };
    }

    if (!lead.email) {
      return {
        rowNumber,
        reason: 'MISSING_REQUIRED',
        details: 'Email is a required field.',
      };
    }

    if (!this.emailRegex.test(lead.email)) {
      return {
        rowNumber,
        email: lead.email,
        phone: lead.mobileWithoutCountryCode,
        reason: 'INVALID_FORMAT',
        details: `Email address '${lead.email}' has an invalid format.`,
      };
    }

    if (!lead.mobileWithoutCountryCode) {
      return {
        rowNumber,
        email: lead.email,
        reason: 'MISSING_REQUIRED',
        details: 'Mobile phone number is a required field.',
      };
    }

    if (!this.phoneRegex.test(lead.mobileWithoutCountryCode)) {
      return {
        rowNumber,
        email: lead.email,
        phone: lead.mobileWithoutCountryCode,
        reason: 'INVALID_FORMAT',
        details: `Phone number '${lead.mobileWithoutCountryCode}' must be a valid 10-digit number.`,
      };
    }

    // Validate enum constraints
    const validDataSources = ['leads_on_demand', 'meridian_tower', 'varah_swamy', 'eden_park', 'sarjapur_plots'];
    if (!validDataSources.includes(lead.dataSource)) {
      return {
        rowNumber,
        email: lead.email,
        phone: lead.mobileWithoutCountryCode,
        reason: 'INVALID_FORMAT',
        details: `Data source '${lead.dataSource}' is invalid. Allowed: ${validDataSources.join(', ')}`,
      };
    }

    return null;
  }
}

export const leadValidationService = new LeadValidationService();
