# MindWeave: Production Deployment & Operations Guide

This document defines the deployment, configuration, migration, and disaster recovery procedures for **MindWeave**, an AI-powered knowledge discovery platform and empirical hypothesis lab.

**Tagline:** *Weaving Knowledge Into Discovery.*

---

## 1. System Architecture & Prerequisites

- **Frontend & Server Engine:** Next.js 15.1.7 (App Router), React 19, TypeScript 5.
- **Design System:** Strict Four-Color Palette (Warm Cream `#FAF7F0`, Royal Blue `#315FE9`, Burnt Tangerine `#E97942`, Ink Black `#252525`).
- **State Management & Persistence:** Zustand with local client persistence + Supabase PostgreSQL 16.
- **Graph & Canvas Runtime:** `@xyflow/react` (React Flow 12).
- **Inference & Safety Engine:** Local deterministic 5-state policy classifier + Google Gemini API (`@google/genai`) fallback.
- **Runtime Environment:** Node.js `>= 20.x` (verified on Node.js v22.20.0).

---

## 2. Environment Variables & Secrets Management

Copy `.env.example` to `.env.local` for local development or set environment variables in your production hosting environment (Vercel, AWS ECS, or Fly.io).

| Variable | Required | Description | Example |
| :--- | :---: | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Optional | Supabase PostgreSQL project URL | `https://xyz.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional | Supabase client anon key | `eyJhbGciOiJIUzI1...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional | Server-side elevated database key (never exposed to client) | `eyJhbGciOiJIUzI1...` |
| `GEMINI_API_KEY` | Optional | Google Gemini API key for external LLM inference | `AIzaSy...` |
| `NODE_ENV` | Production | Node environment | `production` |
| `PORT` | Optional | Server listening port | `3000` |

> [!IMPORTANT]
> If `GEMINI_API_KEY` or `SUPABASE_URL` are not configured, MindWeave operates gracefully using its **deterministic rule-based discovery pipeline** and **local client-side workspace persistence**. No features crash or break.

---

## 3. Database Migration Guide (PostgreSQL 16 + pgvector)

The database schema and Row Level Security (RLS) policies are defined in [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql).

### Applying Migrations via Supabase CLI:
```bash
# Link to your Supabase project
npx supabase link --project-ref <your-project-ref>

# Apply the initial migration
npx supabase db push
```

### Applying Migrations via Supabase SQL Editor:
1. Open your Supabase Dashboard -> **SQL Editor**.
2. Paste the contents of `supabase/migrations/001_initial_schema.sql`.
3. Execute the script.
4. Verify table creation (`workspaces`, `sources`, `source_chunks`, `concepts`, `relationships`, `evidence_records`, `discovery_candidates`, `investigations`, `knowledge_revisions`, `safety_assessments`).
5. Confirm Row Level Security is active on all 11 tables.

---

## 4. Production Build & Execution

### Local Production Build:
```bash
# 1. Install dependencies
npm ci

# 2. Run automated verification test suite
npm test

# 3. Create optimized production build
npm run build

# 4. Start production server
npm start
```

### Docker Container Deployment:
```dockerfile
# Multi-stage production Dockerfile
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 5. System Health Monitoring & Telemetry

MindWeave provides a live health check and telemetry endpoint:

- **Endpoint:** `GET /api/health`
- **Response Format:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "mindweave-api",
  "timestamp": "2026-10-26T14:13:11.957Z",
  "uptimeSeconds": 142,
  "memory": {
    "rssMB": 76.62,
    "heapUsedMB": 33.98,
    "heapTotalMB": 37.11
  },
  "capabilities": {
    "autonomousDiscovery": true,
    "discoveryLab": true,
    "knowledgeUniverse": true,
    "safetyAndPolicyEngine": true,
    "multiWorkspaceIsolation": true
  }
}
```

Configure your infrastructure load balancer (AWS ALB, Cloudflare, or Vercel Health) to ping `/api/health` every 15–30 seconds.

---

## 6. Security & Policy Enforcement Runbook

The application enforces a 5-tier safety policy matrix:

1. **`ALLOW`**: Full access for legitimate research, system architecture, and defensive engineering.
2. **`RESTRICT`**: Dual-use topics permitted under boundary limits; executable exploitation disabled.
3. **`REVIEW_REQUIRED`**: Ambiguous, conflicting, or unpopulated signals held conservatively until researcher clarifies intent.
4. **`REFUSE_AND_REDIRECT`**: Operational harm and exploit generation refused; constructive safe alternatives provided.
5. **`BLOCK_SPECIFIC_OPERATION`**: Absolute barrier against catastrophic CBRN weaponization protocols.

### Bypass Defense Verification:
Direct API attempts to forge client `ALLOW` claims against `/api/investigations/promote` are re-evaluated independently on the server. Hostile requests are rejected with `HTTP 403 Forbidden` (`bypassAttemptDetected: true`).

---

## 7. Backup, Disaster Recovery & Export

1. **Researcher Self-Service Export:**
   - Click **Export** in the top navigation bar.
   - Select **Export as JSON** for a complete snapshot (`mindweave-[workspace].json`).
   - Select **Export as Markdown** for portable documentation (`mindweave-[workspace].md`).

2. **Automated Database Backups:**
   - Daily automated backups are managed via Supabase Point-in-Time Recovery (PITR).
   - On-demand backup command:
     ```bash
     pg_dump -h db.<ref>.supabase.co -U postgres -d postgres -F c -b -v -f mindweave_backup.dump
     ```
