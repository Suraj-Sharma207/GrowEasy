
import { importWorker } from './src/services/import/import-worker.service';
import { importSessionRepository } from './src/repositories/import-session.repository';
import { ImportSession } from './src/types/import.types';

async function run() {
  console.log('Setting up fake session...');
  
  const fakeSession: ImportSession = {
    id: 'test-session-123',
    fileName: 'test.csv',
    uploadedAt: new Date(),
    expiresAt: new Date(Date.now() + 1000000),
    status: 'PREVIEW_READY',
    progressPercent: 100,
    currentStage: 'Ready',
    metadata: { fileSize: 100, encoding: 'UTF-8' },
    preview: {
      importId: 'test-session-123',
      fileName: 'test.csv',
      fileSize: 100,
      totalRows: 4,
      encoding: 'UTF-8',
      validationStatus: 'VALID',
      detectedColumns: [
        { name: 'Name', type: 'string', sampleValue: 'John Doe', missingCount: 0, distinctCount: 4 },
        { name: 'Email', type: 'string', sampleValue: 'john@example.com', missingCount: 0, distinctCount: 4 }
      ],
      validationReport: {
        isValid: true,
        errors: [],
        warnings: [],
        summary: { totalRows: 4, validRows: 4, invalidRows: 0, emptyRows: 0 }
      },
      previewRows: [
        { Name: 'John Doe', Email: 'john1@example.com' },
        { Name: 'Jane Smith', Email: 'jane2@example.com' },
        { Name: 'Bob Brown', Email: 'bob3@example.com' },
        { Name: 'Alice Green', Email: 'alice4@example.com' }
      ]
    },
    validationReport: {
      isValid: true,
      errors: [],
      warnings: [],
      summary: { totalRows: 4, validRows: 4, invalidRows: 0, emptyRows: 0 }
    },
    possibleMappings: {},
    parsedRows: [
        { Name: 'John Doe', Email: 'john1@example.com' },
        { Name: 'Jane Smith', Email: 'jane2@example.com' },
        { Name: 'Bob Brown', Email: 'bob3@example.com' },
        { Name: 'Alice Green', Email: 'alice4@example.com' }
    ],
    mappedRows: [],
    normalizedRows: [],
    skippedRows: [],
    warnings: [],
    errors: [],
    summary: null
  };

  await importSessionRepository.create(fakeSession);

  console.log('Running importWorker.process...');
  const start = Date.now();
  await importWorker.process('test-session-123');
  const end = Date.now();
  console.log('Total time:', end - start, 'ms');
}

run().catch(console.error).finally(() => process.exit(0));

