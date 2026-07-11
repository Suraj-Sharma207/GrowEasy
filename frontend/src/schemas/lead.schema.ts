import { z } from 'zod';

/**
 * Lead validation schema — used for form validation in Phase 2.
 */
export const leadSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone is required').max(20, 'Phone is too long'),
  company: z.string().min(1, 'Company is required').max(100, 'Company is too long'),
  city: z.string().min(1, 'City is required').max(100, 'City is too long'),
  status: z.enum(['new', 'contacted', 'qualified', 'lost', 'converted']).default('new'),
});

export type LeadFormData = z.infer<typeof leadSchema>;
