import { MainLayout } from '@/components/layout/main-layout';
import { LeadsDashboard } from '@/features/leads';

/**
 * Home page — renders the Leads Dashboard as the single application view.
 */
export default function HomePage() {
  return (
    <MainLayout>
      <LeadsDashboard />
    </MainLayout>
  );
}
