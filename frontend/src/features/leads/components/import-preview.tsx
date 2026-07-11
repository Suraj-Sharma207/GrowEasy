import { PreviewDTO } from '@/types/import.types';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface ImportPreviewProps {
  preview: PreviewDTO;
}

export function ImportPreview({ preview }: ImportPreviewProps) {
  // Extract all unique headers from the detected columns
  const headers = preview.detectedColumns.map(col => col.name);

  return (
    <div className="space-y-6">
      {/* File Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">File Name</p>
              <p className="text-sm font-medium truncate max-w-[120px]" title={preview.fileName}>
                {preview.fileName}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CheckCircle2 className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Rows</p>
              <p className="text-sm font-medium">
                {preview.totalRows.toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <AlertCircle className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Columns</p>
              <p className="text-sm font-medium">
                {preview.detectedColumns.length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none border-border/60">
          <CardContent className="p-4 flex items-start gap-3">
            <div className={`p-2 rounded-lg ${
              preview.validationStatus === 'Valid' ? 'bg-emerald-500/10' : 
              preview.validationStatus === 'Warning' ? 'bg-amber-500/10' : 'bg-destructive/10'
            }`}>
              <AlertTriangle className={`h-4 w-4 ${
                preview.validationStatus === 'Valid' ? 'text-emerald-500' : 
                preview.validationStatus === 'Warning' ? 'text-amber-500' : 'text-destructive'
              }`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="text-sm font-medium">
                {preview.validationStatus}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Validation & Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Column Analysis */}
        <div className="border border-border/60 rounded-xl p-4 bg-muted/20">
          <h4 className="text-sm font-semibold mb-3 flex items-center">
            Detected Columns
          </h4>
          <div className="flex flex-wrap gap-2">
            {preview.detectedColumns.map((col, i) => (
              <Badge 
                key={i} 
                variant={col.isEmpty || col.isDuplicate || col.isSuspicious ? "destructive" : "secondary"}
                className={col.isEmpty || col.isDuplicate || col.isSuspicious ? "bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-500/20" : ""}
              >
                {col.name || '<Empty Header>'}
                {col.isDuplicate && ' (Duplicate)'}
                {col.isSuspicious && ' (Suspicious)'}
              </Badge>
            ))}
          </div>
        </div>

        {/* Validation Report */}
        <div className="border border-border/60 rounded-xl p-4 bg-muted/20 space-y-2">
          <h4 className="text-sm font-semibold mb-3">Validation Report</h4>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Valid Rows</span>
            <span className="font-medium">{preview.validationReport.validRowsCount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Invalid / Malformed</span>
            <span className={preview.validationReport.invalidRowsCount > 0 ? "text-amber-600 font-medium" : "font-medium"}>
              {preview.validationReport.invalidRowsCount.toLocaleString()}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Duplicate Headers</span>
            <span className={preview.validationReport.duplicateHeaders.length > 0 ? "text-amber-600 font-medium" : "font-medium"}>
              {preview.validationReport.duplicateHeaders.length}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <h4 className="text-sm font-semibold">Data Preview</h4>
          <span className="text-xs text-muted-foreground">Showing first {preview.previewRows.length} rows</span>
        </div>
        <div className="rounded-md border border-border/60 overflow-hidden relative">
          <div className="overflow-x-auto max-h-[300px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10 shadow-sm">
                <TableRow>
                  <TableHead className="w-[50px] text-center font-medium bg-muted/50 border-r border-border/40">#</TableHead>
                  {headers.map((h, i) => (
                    <TableHead key={i} className="whitespace-nowrap bg-muted/50 font-medium border-r border-border/40 last:border-0">{h || `Column ${i+1}`}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.previewRows.map((row, rowIndex) => (
                  <TableRow key={rowIndex}>
                    <TableCell className="text-center text-muted-foreground border-r border-border/40 bg-muted/10">{rowIndex + 1}</TableCell>
                    {headers.map((h, colIndex) => (
                      <TableCell key={colIndex} className="whitespace-nowrap border-r border-border/40 last:border-0 truncate max-w-[200px]" title={row[h]}>
                        {row[h] || <span className="text-muted-foreground/40 italic">empty</span>}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {preview.previewRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={headers.length + 1} className="h-24 text-center">
                      No data to preview.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  );
}
