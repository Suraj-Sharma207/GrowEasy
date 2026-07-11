'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface ManualImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Manual Import dialog — placeholder for Phase 2 implementation.
 */
export function ManualImportDialog({ open, onOpenChange }: ManualImportDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">Manual Import</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Manually add individual lead records to your CRM. This feature will be
            available in Phase 2 with form validation and field mapping.
          </DialogDescription>
        </DialogHeader>
        <div className="rounded-lg border border-dashed border-border/60 bg-muted/20 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            🚧 Coming in Phase 2
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Manual lead entry form with AI-assisted field mapping
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
