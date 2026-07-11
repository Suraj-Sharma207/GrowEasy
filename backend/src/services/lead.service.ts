import { leadRepository } from '../repositories/lead.repository';
import { Prisma } from '@prisma/client';

interface GetLeadsParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  company?: string;
  city?: string;
}

export class LeadService {
  async getLeads(params: GetLeadsParams) {
    const { page, limit, search, sortBy, sortOrder, status, company, city } = params;
    const skip = (page - 1) * limit;

    // Build the where clause
    const where: Prisma.LeadWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
        { mobileWithoutCountryCode: { contains: search } },
      ];
    }

    if (status) {
      // @ts-ignore
      where.crmStatus = status;
    }
    if (company) {
      where.company = { contains: company, mode: 'insensitive' };
    }
    if (city) {
      where.city = { contains: city, mode: 'insensitive' };
    }

    // Build order by
    let orderBy: Prisma.LeadOrderByWithRelationInput = {};
    if (sortBy) {
      orderBy = { [sortBy]: sortOrder || 'desc' };
    } else {
      // Default sort by createdAt desc to show new leads at top
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      leadRepository.findMany({
        skip,
        take: limit,
        where,
        orderBy,
      }),
      leadRepository.count(where),
    ]);

    const pages = Math.ceil(total / limit);

    return {
      items,
      pagination: {
        page,
        limit,
        pages,
        total,
      },
    };
  }

  async getStatistics() {
    return await leadRepository.getStatistics();
  }
}

export const leadService = new LeadService();
