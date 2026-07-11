'use client';

import { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  Upload, 
  FileType, 
  AlertCircle, 
  Loader2, 
  CheckCircle2, 
  Sparkles, 
  FileSpreadsheet, 
  Users, 
  Copy, 
  Activity,
  AlertTriangle
} from 'lucide-react';
import { useAnalyzeCsv, useConfirmImport, useImportSession } from '../hooks/useLeads';
import { PreviewDTO, ImportSession } from '@/types/import.types';
import { ImportPreview } from './import-preview';
import { toast } from 'sonner';

interface BulkImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type DialogState = 'IDLE' | 'ANALYZING' | 'PREVIEW' | 'PROCESSING' | 'SUCCESS' | 'FAILED';

export function BulkImportDialog({ open, onOpenChange }: BulkImportDialogProps) {
  const [dialogState, setDialogState] = useState<DialogState>('IDLE');
  const [previewData, setPreviewData] = useState<PreviewDTO | null>(null);
  const [activeImportId, setActiveImportId] = useState<string>('');

  const analyzeMutation = useAnalyzeCsv();
  const confirmMutation = useConfirmImport();

  // Poll the import session when dialogState is in 'PROCESSING'
  const isPolling = dialogState === 'PROCESSING' && !!activeImportId;
  const { data: sessionResponse } = useImportSession(activeImportId, isPolling);
  const session: ImportSession | undefined = sessionResponse?.data;

  // Handle session updates
  useEffect(() => {
    if (!session) return;

    if (session.status === 'COMPLETED') {
      setDialogState('SUCCESS');
    } else if (session.status === 'FAILED') {
      setDialogState('FAILED');
    }
  }, [session]);

  const handleClose = () => {
    if (dialogState === 'PROCESSING') return;
    onOpenChange(false);
    
    // Reset state after dialog animation completes
    setTimeout(() => {
      setDialogState('IDLE');
      setPreviewData(null);
      setActiveImportId('');
    }, 300);
  };

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];

      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size exceeds 10MB limit.');
        return;
      }

      setDialogState('ANALYZING');
      try {
        const response = await analyzeMutation.mutateAsync(file);
        if (response.success && response.data) {
          setPreviewData(response.data);
          setDialogState('PREVIEW');
        } else {
          throw new Error(response.message);
        }
      } catch (error: any) {
        toast.error(error.message || 'Failed to analyze CSV');
        setDialogState('IDLE');
      }
    },
    [analyzeMutation]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    multiple: false,
    disabled: dialogState !== 'IDLE',
  });

  const handleConfirm = async () => {
    if (!previewData) return;
    try {
      setActiveImportId(previewData.importId);
      setDialogState('PROCESSING');
      await confirmMutation.mutateAsync(previewData.importId);
    } catch (error: any) {
      toast.error(error.message || 'Failed to start import pipeline');
      setDialogState('PREVIEW');
    }
  };

  const currentStage = session?.currentStage || 'Initializing';
  const progressPercent = session?.progressPercent || 0;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* SUCCESS SUMMARY */}
        {dialogState === 'SUCCESS' && session?.summary && (
          <div className="py-6 flex flex-col gap-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center flex flex-col items-center">
              <div className="h-16 w-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold">Import Completed Successfully</h2>
              <p className="text-muted-foreground mt-1 max-w-md">
                Your data import is complete. The dashboard statistics and leads table have updated.
              </p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 border border-border/55 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-primary">
                  {session.summary.importedCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Imported Records</p>
              </div>

              <div className="bg-muted/30 border border-border/55 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-amber-500">
                  {session.summary.duplicateCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Duplicates Skipped</p>
              </div>

              <div className="bg-muted/30 border border-border/55 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-destructive">
                  {session.summary.invalidCount.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Malformed Skipped</p>
              </div>

              <div className="bg-muted/30 border border-border/55 p-4 rounded-xl text-center">
                <p className="text-2xl font-bold text-muted-foreground">
                  {Math.round(session.summary.processingTimeMs / 1000)}s
                </p>
                <p className="text-xs text-muted-foreground mt-1">Processing Time</p>
              </div>
            </div>

            {/* Warnings list if any */}
            {session.warnings.length > 0 && (
              <div className="border border-amber-500/25 bg-amber-500/5 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-amber-700 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="h-4 w-4" />
                  Import Warnings ({session.warnings.length})
                </h4>
                <div className="max-h-[150px] overflow-y-auto space-y-1.5 text-xs text-amber-800">
                  {session.warnings.map((w, index) => (
                    <div key={index} className="flex justify-between items-start gap-4">
                      <span>Row {w.rowNumber}: {w.message}</span>
                      <span className="font-semibold whitespace-nowrap">Score: {Math.round(w.confidenceScore * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skipped Details */}
            {session.summary.skippedRecords.length > 0 && (
              <div className="border border-border/60 rounded-xl p-4">
                <h4 className="text-sm font-semibold mb-2">Skipped Records Details</h4>
                <div className="max-h-[150px] overflow-y-auto space-y-2 text-xs">
                  {session.summary.skippedRecords.map((r, index) => (
                    <div key={index} className="flex justify-between items-start gap-4 border-b border-border/30 pb-1.5 last:border-0 last:pb-0">
                      <div>
                        <span className="font-semibold">Row {r.rowNumber}</span>
                        <span className="text-muted-foreground ml-2">({r.reason})</span>
                        <p className="text-muted-foreground mt-0.5">{r.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button onClick={handleClose} size="lg">
                Done
              </Button>
            </div>
          </div>
        )}

        {/* FAILED STATE */}
        {dialogState === 'FAILED' && (
          <div className="py-12 text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <div className="h-20 w-20 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Import Pipeline Failed</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              {session?.errors[session.errors.length - 1] || 'An unexpected error occurred during import processing.'}
            </p>
            <Button onClick={() => setDialogState('PREVIEW')} size="lg" variant="outline">
              Back to Preview
            </Button>
          </div>
        )}

        {/* PROCESSING WORKER STATE */}
        {dialogState === 'PROCESSING' && (
          <div className="py-12 px-6 flex flex-col gap-6 animate-in fade-in duration-300">
            <DialogHeader>
              <DialogTitle className="text-xl">AI Import Processing</DialogTitle>
              <DialogDescription>
                Running intelligence mapping, data cleansing, and validation checks.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center text-sm font-semibold">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {currentStage}
                </span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 dark:bg-slate-800">
                <div 
                  className="bg-primary h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Steps Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
              <div className={`p-4 border rounded-xl flex items-center gap-3 transition-colors ${
                progressPercent >= 45 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700' : 'bg-muted/10 border-border/60 text-muted-foreground'
              }`}>
                <Sparkles className="h-5 w-5" />
                <div className="text-xs">
                  <p className="font-semibold">AI mapping</p>
                  <p className="opacity-80">{progressPercent >= 45 ? 'Completed' : 'Processing...'}</p>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center gap-3 transition-colors ${
                progressPercent >= 60 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700' : 
                progressPercent >= 45 ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/10 border-border/60 text-muted-foreground'
              }`}>
                <FileSpreadsheet className="h-5 w-5" />
                <div className="text-xs">
                  <p className="font-semibold">Normalization</p>
                  <p className="opacity-80">{progressPercent >= 60 ? 'Completed' : progressPercent >= 45 ? 'Cleansing data...' : 'Waiting...'}</p>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center gap-3 transition-colors ${
                progressPercent >= 85 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700' : 
                progressPercent >= 60 ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/10 border-border/60 text-muted-foreground'
              }`}>
                <Copy className="h-5 w-5" />
                <div className="text-xs">
                  <p className="font-semibold">Deduplication</p>
                  <p className="opacity-80">{progressPercent >= 85 ? 'Completed' : progressPercent >= 60 ? 'Analyzing DB...' : 'Waiting...'}</p>
                </div>
              </div>

              <div className={`p-4 border rounded-xl flex items-center gap-3 transition-colors ${
                progressPercent >= 100 ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-700' : 
                progressPercent >= 85 ? 'bg-primary/5 border-primary/20 text-primary' : 'bg-muted/10 border-border/60 text-muted-foreground'
              }`}>
                <Activity className="h-5 w-5" />
                <div className="text-xs">
                  <p className="font-semibold">Bulk Insert</p>
                  <p className="opacity-80">{progressPercent >= 100 ? 'Completed' : progressPercent >= 85 ? 'Inserting...' : 'Waiting...'}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PREVIEW STATE */}
        {dialogState === 'PREVIEW' && previewData && (
          <div className="flex flex-col h-full animate-in fade-in duration-300 gap-6">
            <DialogHeader>
              <DialogTitle className="text-xl">Preview Import</DialogTitle>
              <DialogDescription>
                Review the parsed data and column analysis before continuing.
              </DialogDescription>
            </DialogHeader>
            
            <ImportPreview preview={previewData} />

            <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleConfirm}>
                Confirm Import
              </Button>
            </div>
          </div>
        )}

        {/* IDLE / ANALYZING STATE */}
        {(dialogState === 'IDLE' || dialogState === 'ANALYZING') && (
          <>
            <DialogHeader>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-3">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <DialogTitle className="text-xl">Import Leads</DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Upload a CSV file to import multiple leads at once. Maximum file size is 10MB.
              </DialogDescription>
            </DialogHeader>

            <div
              {...getRootProps()}
              className={`
                mt-4 rounded-xl border-2 border-dashed p-10 text-center transition-all duration-200 cursor-pointer
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-border/60 hover:border-primary/50 hover:bg-muted/30'}
                ${isDragReject ? 'border-destructive bg-destructive/5' : ''}
                ${dialogState === 'ANALYZING' ? 'pointer-events-none opacity-60' : ''}
              `}
            >
              <input {...getInputProps()} />
              
              <div className="flex flex-col items-center justify-center space-y-4">
                {dialogState === 'ANALYZING' ? (
                  <>
                    <Loader2 className="h-10 w-10 text-primary animate-spin" />
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Analyzing CSV File...</p>
                      <p className="text-xs text-muted-foreground">Parsing rows and validating columns</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-background rounded-full shadow-sm border border-border/40">
                      <FileType className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        <span className="text-primary font-semibold">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-muted-foreground">CSV (max. 10MB)</p>
                    </div>
                  </>
                )}

                {isDragReject && (
                  <div className="flex items-center text-destructive text-sm mt-2">
                    <AlertCircle className="w-4 h-4 mr-1.5" />
                    File type not supported. Please upload a CSV.
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
