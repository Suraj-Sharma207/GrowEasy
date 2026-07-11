import { leadService } from './src/services/lead.service';

async function test() {
  try {
    const res = await leadService.getLeads({ page: 1, limit: 10 });
    console.log('Success:', res);
  } catch (err) {
    console.error('Raw Error:', err);
  }
}

test();
