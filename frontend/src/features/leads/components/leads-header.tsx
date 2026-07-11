'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/ui/page-header';
import { BulkImportDialog } from './bulk-import-dialog';
import { LEADS_PAGE } from '../constants/leads.constants';
import { Upload } from 'lucide-react';

/**
 * Leads page header with import action buttons wired to dialogs.
 */
export function LeadsHeader() {
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <>
      <PageHeader
        title={LEADS_PAGE.title}
        subtitle={LEADS_PAGE.subtitle}
        actions={
          <>
            <Button
              onClick={() => setBulkOpen(true)}
              className="gap-2 shadow-md hover:shadow-lg transition-shadow"
            >
              <Upload className="h-4 w-4" />
              Bulk Import
            </Button>
          </>
        }
      />

      <BulkImportDialog open={bulkOpen} onOpenChange={setBulkOpen} />
    </>
  );
}
