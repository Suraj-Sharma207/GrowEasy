import { Prisma, Lead } from '@prisma/client';
import { prisma } from '../config/db';

export class LeadRepository {
  async create(data: Prisma.LeadCreateInput): Promise<Lead> {
    return await prisma.lead.create({ data });
  }

  async findMany(params: {
    skip?: number;
    take?: number;
    where?: Prisma.LeadWhereInput;
    orderBy?: Prisma.LeadOrderByWithRelationInput;
  }): Promise<Lead[]> {
    return await prisma.lead.findMany(params);
  }

  async count(where?: Prisma.LeadWhereInput): Promise<number> {
    return await prisma.lead.count({ where });
  }

  async findById(id: string): Promise<Lead | null> {
    return await prisma.lead.findUnique({ where: { id } });
  }

  async update(id: string, data: Prisma.LeadUpdateInput): Promise<Lead> {
    return await prisma.lead.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Lead> {
    return await prisma.lead.delete({ where: { id } });
  }

  async getStatistics() {
    const totalLeads = await this.count();
    // Assuming successfully imported means they have an importBatchId
    const successfullyImported = await this.count({
      importBatchId: { not: null }
    });
    
    // Total skipped records
    const skippedRecords = await prisma.skippedLead.count();

    return {
      totalLeads,
      successfullyImported,
      skippedRecords,
    };
  }
}

export const leadRepository = new LeadRepository();
