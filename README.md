# GrowEasy CRM

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-8E75C2?style=flat-square&logo=googlegemini&logoColor=white)](https://ai.google.dev/)

An AI-powered CRM Lead Import platform that intelligently analyzes CSV files, maps arbitrary columns to CRM fields using Google Gemini AI, validates and normalizes data, detects duplicates, and imports leads into PostgreSQL using an enterprise-grade architecture.

---

## Key Features

- **AI-Powered CSV Mapping**: Automatically translates raw, arbitrary CSV columns into standard CRM schemas using `gemini-2.5-flash` with a localized schema hint builder.
- **Intelligent Header Detection**: Provides a pre-flight heuristic analysis on header names to decrease Gemini's mapping load.
- **Dynamic CSV Preview**: Instant schema validation, encoding detection, and 20-row sample parsing before pushing data.
- **Multi-Stage Validation**: Checks for required fields, phone numbers, and structural data anomalies.
- **O(1) Global Duplicate Detection**: Evaluates thousands of records for database email/phone conflicts in a single query pass.
- **Robust Import Sessions**: Tracks active jobs in memory behind an interface-driven repository abstraction.
- **State-of-the-Art Dashboard**: Features real-time KPI metrics, responsive TanStack tables, and live React Query progress tracking (300ms intervals).
- **Prisma Bulk Transactions**: Guarantees database integrity via all-or-nothing execution blocks during batch inserts.

---

## Tech Stack

| Domain | Technologies |
| --- | --- |
| **Frontend** | Next.js, React, React Query (TanStack), Tailwind CSS, shadcn/ui, TanStack Table, Axios, React Hook Form, Zod |
| **Backend** | Node.js, Express, TypeScript, PapaParse, Multer (Memory Storage), Helmet, Morgan |
| **Database & ORM** | Neon PostgreSQL, Prisma ORM |
| **AI Integration** | Google Generative AI SDK (`gemini-2.5-flash`) |

---

## Architecture Overview

### System Architecture Diagram

```mermaid
graph TD
    Client[Next.js Frontend] -->|HTTP Request| Express[Express API Gateway]
    Express -->|Ingests File| Multer[Multer MemoryStorage]
    Multer -->|Raw CSV Buffer| Parser[PapaParse / Parsing Service]
    Parser -->|Preview Session| Repository[(ImportSession Repository)]
    Repository -->|Launch Pipeline| Worker[ImportWorker Orchestrator]
    Worker -->|Prompt Assembly| Builder[Prompt Builder Service]
    Builder -->|Batch Rows + Hints| Gemini[Google Gemini API]
    Gemini -->|JSON Mapping DTO| Worker
    Worker -->|Extracted Payload| Normalizer[Lead Normalizer Service]
    Normalizer -->|Cleaned Entities| Deduplicator[Duplicate Detector Service]
    Deduplicator -->|Single DB Query| PostgreSQL[(Neon PostgreSQL DB)]
    Deduplicator -->|Lookup Map Cache| Worker
    Worker -->|Valid Leads + Skipped Records| Persistence[Bulk Import Service]
    Persistence -->|Transaction Block| PostgreSQL
    Worker -->|Update Status| Repository
    Client -->|Poll Status 300ms| Repository
```

### AI Import Pipeline Flow

```mermaid
sequenceDiagram
    autonumber
    participant U as User / UI
    participant C as Controller
    participant S as CsvPreviewService
    participant W as ImportWorker
    participant A as AiMappingService
    participant D as DuplicateDetector
    participant DB as Neon PostgreSQL

    U->>C: POST /api/v1/import/analyze-csv (File)
    C->>S: parseBuffer & validate schema
    S-->>C: Return 20-row Preview DTO & Import ID
    C-->>U: Render Preview Dialog
    U->>C: POST /api/v1/import/process (Import ID)
    C->>W: process(Import ID) [Async]
    W->>A: mapBatch(Dynamic Batch Size)
    A->>DB: Fetch hints & resolve schemas via Gemini
    A-->>W: Return Mapped Leads JSON
    W->>D: buildGlobalDuplicateCache(All Rows)
    D->>DB: SELECT * WHERE email/phone IN (...) [Single Query]
    D-->>W: Return O(1) Cache Lookups
    W->>W: Check duplicates & validate row-by-row
    W->>DB: createMany Leads + Skipped records (Transaction)
    W-->>C: Mark Session COMPLETED
    loop Every 300ms
        U->>C: GET /api/v1/import/session/:id
        C-->>U: Return status & progress percentage
    end
```

---

## Folder Structure

```
GrowEasy_CRM/
├── backend/
│   ├── prisma/                  # Prisma Database Schema and Migrations
│   ├── src/
│   │   ├── config/              # Environment validator (Zod) & DB connections
│   │   ├── constants/           # HTTP codes, status enums, constants
│   │   ├── controllers/         # Express Route Handlers (Leads, Imports)
│   │   ├── errors/              # Custom AppError implementation
│   │   ├── middlewares/         # CORS, error-handlers, request parsers
│   │   ├── repositories/        # Session stores (in-memory, Redis-ready)
│   │   ├── routes/              # Express Endpoints Definition
│   │   ├── services/
│   │   │   └── import/          # CORE IMPORT PIPELINE DOMAIN
│   │   │       ├── ai-mapping.service.ts
│   │   │       ├── batch-executor.service.ts
│   │   │       ├── bulk-import.service.ts
│   │   │       ├── csv-parsing.service.ts
│   │   │       ├── csv-preview.service.ts
│   │   │       ├── csv-validation.service.ts
│   │   │       ├── duplicate-detector.service.ts
│   │   │       ├── gemini.service.ts
│   │   │       ├── header-analyzer.service.ts
│   │   │       ├── import-worker.service.ts
│   │   │       ├── lead-normalizer.service.ts
│   │   │       └── prompt-builder.service.ts
│   │   ├── types/               # Pipeline Data Transfer Objects (DTOs)
│   │   └── app.ts               # Express Initialization
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI Components (Data Table, Layout)
│   │   ├── features/
│   │   │   └── leads/           # Leads dashboard, lists, and import components
│   │   ├── lib/                 # Axios configuration and TanStack Query
│   │   ├── schemas/             # Zod client schemas
│   │   └── app/                 # Next.js App Router Structure
```

---

## Database Schema

```mermaid
erDiagram
    IMPORT_BATCH ||--o{ LEAD : "contains"
    IMPORT_BATCH ||--o{ SKIPPED_LEAD : "logs"

    IMPORT_BATCH {
        string id PK
        string fileName
        int totalRows
        int importedRows
        int skippedRows
        ImportStatus status
        float processingTime
        dateTime createdAt
    }

    LEAD {
        string id PK
        string name
        string email
        string countryCode
        string mobileWithoutCountryCode
        string company
        string city
        string state
        string country
        string leadOwner
        CRMStatus crmStatus
        string crmNote
        DataSource dataSource
        dateTime possessionTime
        string description
        string importBatchId FK
        dateTime createdAt
        dateTime updatedAt
    }

    SKIPPED_LEAD {
        string id PK
        string reason
        json rawData
        string batchId FK
        dateTime createdAt
    }
```

### Table Specifications & Index Design

1. **`import_batches`**: Tracks metadata for bulk import operations.
2. **`leads`**: Holds normalized contact details.
   - `@@index([createdAt])`: Accelerates dashboard order sort queries.
   - `@@index([email])`: Speeds up single-record duplication audits.
   - `@@index([mobileWithoutCountryCode])`: Optimizes mobile deduplication.
   - `@@index([crmStatus])`, `@@index([company])`, `@@index([city])`: Facilitates rapid server-side filtering on the dashboard.
3. **`skipped_leads`**: Retains unimported rows (duplicates, empty name records) in a JSON configuration field for audit reports.

---

## Setup Guide

### Prerequisites
- **Node.js** v20.0.0 or higher
- **npm** v10.0.0 or higher
- **Neon PostgreSQL** database instance
- **Google AI Studio** Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/GrowEasy_CRM.git
   cd GrowEasy_CRM
   ```

2. **Setup Frontend:**
   ```bash
   cd frontend
   npm install
   ```

3. **Setup Backend:**
   ```bash
   cd ../backend
   npm install
   ```

---

## Environment Variables

### Backend Configuration (`backend/.env`)

Create a `.env` file in the `backend/` directory:

```ini
# Server Configuration
PORT=5000
NODE_ENV=development

# Database configuration (Neon PostgreSQL connection URL)
DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-crimson-leaf-ah9vxice-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# API Route Routing Config
API_PREFIX=/api
API_VERSION=v1

# AI Integration Config
GEMINI_API_KEY=AIzaSyYourGeminiApiKeyHere
```

### Frontend Configuration (`frontend/.env.local`)

Create a `.env.local` file in the `frontend/` directory:

```ini
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
```

---

## Database Setup

1. **Deploy Migrations**: Apply migrations to your Neon database using Prisma.
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate deploy
   ```

---

## Running Locally

To run both services concurrently, execute these commands in separate terminal shells:

### 1. Start the Backend API (Default Port: `5000`)
```bash
cd backend
npm run dev
```

### 2. Start the Frontend Client (Default Port: `3000`)
```bash
cd frontend
npm run dev
```

---

## API Documentation

### 1. GET `/api/v1/leads`
Retrieves a paginated list of leads with optional search, sorting, and filter params.

**Query Parameters:**
- `page`: Page index (default: `1`)
- `limit`: Records per page (default: `10`)
- `search`: Search name, email, or company
- `status`: Filter by `CRMStatus` (e.g. `GOOD_LEAD_FOLLOW_UP`)
- `city`: Filter by city

**Example Response:**
```json
{
  "success": true,
  "data": {
    "leads": [
      {
        "id": "1e86fd6d-e9c5-4ad9-bf9d-2101fe80b95b",
        "name": "Jane Smith",
        "email": "jane@company.com",
        "company": "Growth Inc",
        "crmStatus": "GOOD_LEAD_FOLLOW_UP",
        "createdAt": "2026-07-11T12:00:00Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 10,
      "totalPages": 1
    }
  }
}
```

### 2. GET `/api/v1/leads/statistics`
Provides aggregated metrics for dashboard KPI cards.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "totalLeads": 420,
    "goodLeads": 300,
    "didNotConnect": 50,
    "badLeads": 60,
    "saleDone": 10
  }
}
```

### 3. POST `/api/v1/import/analyze-csv`
Uploads a raw CSV file and generates a structured preview payload.

**Request Form-Data:**
- `file`: CSV Binary File

**Example Response:**
```json
{
  "success": true,
  "data": {
    "importId": "d748f2fa-cd78-4395-8120-94d075ad4f39",
    "fileName": "leads_2026.csv",
    "totalRows": 150,
    "detectedColumns": [
      { "name": "FullName", "type": "string" },
      { "name": "EmailAddr", "type": "string" }
    ],
    "previewRows": [
      { "FullName": "John Doe", "EmailAddr": "john@doe.com" }
    ]
  }
}
```

### 4. POST `/api/v1/import/process`
Confirms and initiates processing of a stored CSV import session.

**Request Body:**
```json
{
  "importId": "d748f2fa-cd78-4395-8120-94d075ad4f39"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Import session processing started."
}
```

### 5. GET `/api/v1/import/session/:importId`
Retrieves progress and diagnostic metrics of the import session.

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "d748f2fa-cd78-4395-8120-94d075ad4f39",
    "status": "COMPLETED",
    "progressPercent": 100,
    "currentStage": "Completed",
    "summary": {
      "totalRecords": 150,
      "importedCount": 145,
      "skippedCount": 5,
      "duplicateCount": 3,
      "invalidCount": 2,
      "metrics": {
        "totalProcessingTimeMs": 2840,
        "aiProcessingTimeMs": 1420
      }
    }
  }
}
```

---

## Performance Optimizations

1. **Adaptive Batch Sizes**: Slashes Gemini LLM cold start times. Small files (≤20 rows) run in a single wave, medium files (≤200 rows) use batches of 50, and large files default to 100-row chunks.
2. **Global Deduplication Check**: Collects all dataset emails and phone numbers to evaluate duplicates in **one optimized query** up front. Generates an in-memory lookup cache to validate rows in O(1) time.
3. **Prisma Bulk Insertion**: Minimizes database connection pool pressure by packing valid rows into a single `createMany()` call nested in a database transaction block.
4. **React Query Caching**: Keeps lead lists and dashboard analytics cache-valid, preventing stale queries.
5. **Memory-Based Multer Uploads**: Circumvents slow disk writing operations by retaining files as memory buffers during preview analysis.

---

## Enterprise Engineering Decisions

- **Repository Pattern**: Placed `ImportSession` behind a strict interface-driven store so that swapping the in-memory array database wrapper with a Redis cluster requires zero edits to business orchestrators.
- **Service Layer Separation**: Separated parsing, mapping, normalization, and db insertions into granular services to adhere to Single Responsibility Principles (SRP).
- **ImportSession State Machine**: The import lifecycle moves predictably through `PREVIEW_READY` → `AI_PROCESSING` → `VALIDATING` → `IMPORTING` → `COMPLETED` / `FAILED`.
- **Heuristic Fallback Modes**: If Gemini APIs fail due to quota exhaustion or timeouts, the orchestrator defaults to local heuristic header analysis to complete the import gracefully.

---

## Testing

Verify the application functionality using the target scenarios below:

1. **Ingest Testing**: Run an import with `backend/test-import.ts` to log console performance.
2. **AI Failure Tolerance**: Delete the `GEMINI_API_KEY` from `.env` to verify that heuristic fallback modes match and compile correctly without throwing 500 errors.
3. **Format Testing**: Upload standard dummy spreadsheets to confirm CSV parsing and duplicate warnings (e.g. duplicating emails present in the `leads` table).

---

## Deployment

### Backend
1. Deploy the Node API folder to **Railway** or **Render**.
2. Configure environment values (`DATABASE_URL`, `GEMINI_API_KEY`, `NODE_ENV=production`).

### Frontend
1. Connect the Next.js directory to **Vercel**.
2. Add environment parameter `NEXT_PUBLIC_API_URL` pointing to the deployed backend URL.

### Database
1. Provision a Serverless v2 PostgreSQL database on **Neon**.
2. Run database migrations to provision the schema tables.

---

## Screenshots Placeholder

### 1. Dashboard View
*(Placeholder for Leads Dashboard showing KPI cards and the leads list)*

### 2. CSV Upload Preview Dialog
*(Placeholder for File Upload drag-and-drop zone and Preview Table)*

### 3. Import Pipeline Progress
*(Placeholder for Live Pipeline Progress Bar)*

---

## Future Improvements

- **User Authentication**: Implement NextAuth with RBAC (Admin, Manager, Agent).
- **Import History Log**: Log metadata for all historical batch files.
- **Redis Queue Worker**: Shift `ImportWorker` into an asynchronous background queue (BullMQ) to handle heavy CSVs (>50k lines).
- **Interactive Match Editor**: Allow users to adjust AI mapping choices directly in the UI before confirming the import.

---

## Developer Information

- **Developer**: Suraj Sharma
- **GitHub**: [surajsharma](https://github.com/surajsharma)
- **Email**: suraj.sharma@example.com
- **LinkedIn**: [suraj-sharma](https://linkedin.com/in/suraj-sharma)

---
*GrowEasy CRM © 2026. Made for technical evaluation.*
