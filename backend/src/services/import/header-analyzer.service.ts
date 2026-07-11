export class HeaderAnalyzerService {
  private mappings: Record<string, RegExp[]> = {
    name: [/name/i, /customer/i, /lead/i, /contact/i],
    email: [/email/i, /mail/i, /e-mail/i],
    phone: [/phone/i, /mobile/i, /contact.*num/i, /cell/i, /tel/i],
    company: [/company/i, /organization/i, /corp/i, /business/i],
    city: [/city/i, /town/i],
    state: [/state/i, /province/i, /region/i],
    country: [/country/i, /nation/i],
    leadOwner: [/owner/i, /agent/i, /assign/i],
    crmNote: [/note/i, /comment/i, /remark/i],
    description: [/desc/i, /about/i, /detail/i],
    dataSource: [/source/i],
    possessionTime: [/possession/i],
    createdDate: [/date/i, /created/i, /time/i],
  };

  analyze(headers: string[]): Record<string, string> {
    const hints: Record<string, string> = {};

    for (const header of headers) {
      const cleanHeader = header.trim();
      for (const [crmField, regexes] of Object.entries(this.mappings)) {
        const matches = regexes.some((regex) => regex.test(cleanHeader));
        if (matches) {
          hints[cleanHeader] = crmField;
          break; // move to next header once matched
        }
      }
    }

    return hints;
  }
}

export const headerAnalyzerService = new HeaderAnalyzerService();
