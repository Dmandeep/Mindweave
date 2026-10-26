# MindWeave Architecture Specification

## 1. System Philosophy & Epistemic Progression

MindWeave is structured around the principle that human knowledge progresses through distinct epistemic thresholds:

```
[ Unstructured Thought / Raw Notes ]
               │
               ▼ Concept Extraction
     [ Knowledge Universe ] ◄───────────────┐
     • Concept Nodes                        │
     • Typed Relationships                  │
               │                            │
               ▼ Autonomous Scan            │ 5. Graph Reconciliation
     [ Discovery Candidates ]               │    (Verified Edge Generation)
     • Novelty & Relevance                  │
     • Paradox / Analogical Bridge          │
               │                            │
               ▼ Promotion & Safety Audit   │
     [ Investigation Lab ] ─────────────────┘
     1. Hypothesis Formulation
     2. Experiment Protocol Design
     3. Telemetry & Execution Simulation
     4. Empirical Evidence Accumulation
     5. Conclusion Derivation
```

---

## 2. Component Architecture

### Frontend Layer (Next.js 15 App Router & React 19)
- **`app/page.tsx`**: Master shell managing active workspace tabs (`Universe Canvas`, `Discovery Engine`, `Investigation Lab`).
- **`components/canvas/KnowledgeCanvas.tsx`**: Visual interactive DAG and graph visualization powered by `@xyflow/react` (v12).
- **`components/canvas/nodes/ConceptNode.tsx`**: Accessible, custom-rendered node cards with domain tagging and confidence halos adhering to the strict 4-color palette.
- **`components/canvas/edges/TypedEdge.tsx`**: Directional SVG edges rendering semantic labels (`causes`, `correlates`, `contradicts`, `analogous_to`, `synthesizes`).
- **`components/discoveries/DiscoveriesWorkspace.tsx`**: Autonomous discovery review console with multi-dimensional filtering, safety state indicators, and one-click lab promotion.
- **`components/lab/DiscoveryLabWorkbench.tsx`**: 5-stage empirical investigation protocol workbench with real-time status progression, telemetry monitoring, and graph reconciliation banners.
- **`components/capture/CaptureModal.tsx`**: Modal for rapid thought capture and live concept/relationship extraction.

### State Management & Persistence (`stores/knowledgeStore.ts`)
- Implemented with **Zustand** using durable local persistence.
- Key: `mindweave-knowledge-store` with automatic fallback read capability for legacy keys (`web-of-thoughts-knowledge-store`).
- In-memory optimistic updates paired with server API synchronization.

---

## 3. Server Architecture & API Routes

All endpoints reside in `app/api/` and enforce strict type contracts, sanitization, and safety checks:

```
app/api/
├── health/route.ts                    # Liveness probe & identity verification
├── concepts/route.ts                  # REST operations for Concept entities
├── relationships/route.ts             # REST operations for Relationship entities
├── discoveries/scan/route.ts          # Discovery Engine execution endpoint
├── investigations/promote/route.ts    # Epistemic promotion to Investigation Lab
├── investigations/reconcile/route.ts  # Verification & graph mutation endpoint
└── safety/check/route.ts              # Safety classifier & policy gate
```

---

## 4. Multi-Tiered Safety & Policy Engine

MindWeave enforces safety at both the application store and server API boundaries:

1. **Classification Tier** (`lib/safety/safetyClassifier.ts`):
   - Audits requests against harm vectors: Cyber Exploit/Malware Generation, CBRN (chemical, biological, radiological, nuclear), Self-Harm, Hate Speech.
   - **Nuanced Educational Boundary**: Distinguishes between legitimate defensive security/scientific analysis and operational harm enablement.
2. **Policy Outcomes**:
   - `ALLOW`: Full operational liberty.
   - `RESTRICT`: Allowed under constrained parameters or educational guardrails.
   - `REFUSE_AND_REDIRECT`: Prohibited harmful operations; returns pedagogical alternative.
   - `REVIEW_REQUIRED`: Ambiguous or dual-use queries held for researcher confirmation.
3. **Server-Side Enforcement Gate**:
   - `/api/investigations/promote` rejects blocked candidates with HTTP 403.
   - Store action `promoteDiscoveryToLab` verifies safety status before instantiating protocols.

---

## 5. Persistence & Database Design

### Supabase PostgreSQL 16 with `pgvector`
- Full schema defined in `supabase/migrations/001_initial_schema.sql`.
- 11 structured tables:
  1. `workspaces`: Multi-tenant workspace isolation.
  2. `sources`: Raw ingested documents and cryptographic content hashes.
  3. `source_chunks`: Text chunks with 1536-dimensional vector embeddings (`HNSW` index).
  4. `concepts`: Extracted entities with domain classification and provenance.
  5. `relationships`: Directed, typed graph edges.
  6. `discoveries`: Machine-generated candidate connections.
  7. `hypotheses`: Falsifiable scientific propositions.
  8. `experiment_protocols`: Controlled variable definitions and thresholds.
  9. `experiment_trials`: Execution telemetry and trial data.
  10. `evidence_records`: Empirical findings linked to source chunks.
  11. `conclusions`: Synthesized outcomes tied back to graph relationships.

### Row-Level Security (RLS)
- Strict RLS policies enabled on all tables:
  ```sql
  ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
  CREATE POLICY "Users can only access their own workspaces"
      ON public.workspaces FOR ALL
      USING (auth.uid() = user_id);
  ```
- No cross-tenant data leakage is permitted.

---

## 6. Strict Four-Color Design System

MindWeave implements a focused visual language:
- **Warm Cream (`#FAF7F0`)**: Primary surface and canvas canvas tone.
- **Royal Blue (`#315FE9`)**: Focus states, active navigation, primary CTAs, confirmed findings.
- **Burnt Tangerine (`#E97942`)**: Emergent discoveries, paradox warnings, novelty badges.
- **Ink Black (`#252525`)**: High-legibility typography and crisp architectural borders.
