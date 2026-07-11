import { z } from 'zod';

const getLeadsSchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  status: z.string().optional(),
  company: z.string().optional(),
  city: z.string().optional(),
});

try {
  const q1 = getLeadsSchema.parse({ page: "1", limit: "10" });
  console.log('q1:', q1);
} catch (e) {
  console.log('Error q1:', e);
}

try {
  const q2 = getLeadsSchema.parse({});
  console.log('q2:', q2);
} catch (e) {
  console.log('Error q2:', e);
}
