import { apiClient } from '@/lib/axios';
import { Lead, LeadStatistics } from '@/types/lead.types';

export interface GetLeadsParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  status?: string;
  company?: string;
  city?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      pages: number;
      total: number;
    };
  };
}

export interface StatisticsResponse {
  success: boolean;
  message: string;
  data: LeadStatistics;
}

import { PreviewDTO, ImportSession } from '@/types/import.types';

export const leadsApi = {
  getLeads: async (params: GetLeadsParams): Promise<PaginatedResponse<Lead>> => {
    const response = await apiClient.get('/leads', { params });
    return response.data;
  },

  getStatistics: async (): Promise<StatisticsResponse> => {
    const response = await apiClient.get('/leads/statistics');
    return response.data;
  },

  analyzeCsv: async (file: File): Promise<{ success: boolean; message: string; data: PreviewDTO }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/import/analyze-csv', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  confirmImport: async (importId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post('/import/process', { importId });
    return response.data;
  },

  getImportSession: async (importId: string): Promise<{ success: boolean; message: string; data: ImportSession }> => {
    const response = await apiClient.get(`/import/session/${importId}`);
    return response.data;
  },
};
