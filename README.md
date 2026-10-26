# MindWeave

> **An AI-Powered Knowledge Discovery Platform**  
> *Weaving Knowledge Into Discovery.*

[![Production Ready](https://img.shields.io/badge/status-production--ready-315FE9.svg)](#)
[![TypeScript 5.x](https://img.shields.io/badge/TypeScript-5.x-252525.svg?logo=typescript)](#)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.1.7-black.svg?logo=next.js)](#)
[![React 19](https://img.shields.io/badge/React-19.0.0-315FE9.svg?logo=react)](#)
[![Tests Passing](https://img.shields.io/badge/Vitest-95%20Passed-315FE9.svg?logo=vitest)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-E97942.svg)](#)

---

## Overview

Traditional digital workspaces store notes; modern AI copilots summarize documents. **MindWeave** operates on a fundamentally different paradigm: **Autonomous Epistemic Discovery**. 

MindWeave transforms fragmented research, raw notes, and domain insights into a dynamic, living knowledge universe. Rather than merely connecting what you already know, MindWeave actively identifies latent connections, surfaces cross-domain structural analogies, detects paradoxes, and guides researchers through formal empirical investigation protocols to turn tentative discoveries into verified graph relationships.

---

## Core Pillars & Capabilities

### 1. Interactive Knowledge Universe
- **High-Performance Canvas**: Visual graph workspace powered by `@xyflow/react` with custom physics and semantic zoom.
- **Epistemic Concept Nodes**: Categorized by domain (`Machine Learning`, `Neuroscience`, `Distributed Systems`, `Cognitive Science`) with confidence scoring, evidence linkage, and provenance badges.
- **Typed Relationships**: Directed edges with typed semantics (`causes`, `correlates`, `contradicts`, `analogous_to`, `synthesizes`) and real-time validation against circular dependencies or malformed schemas.

### 2. Autonomous Discovery Engine
- **Cross-Domain Discovery**: Detects bridges between disconnected subgraphs using structural graph algorithms and embedding distance.
- **Paradox & Anomaly Detection**: Highlights conflicting claims across independent notes.
- **Emergent Opportunity Scoring**: Scores candidates across novelty, epistemic relevance, plausibility, and testability.

### 3. Investigation & Discovery Lab
MindWeave introduces a 5-stage formal empirical investigation workflow:
1. **Hypothesis Formulation**: Formalizes a discovery candidate into a falsifiable proposition.
2. **Experiment Protocol Design**: Specifies controlled variables, measurable metrics, and success thresholds.
3. **Telemetry & Execution**: Simulates or captures empirical trial data and anomaly logging.
4. **Empirical Evidence Ingestion**: Attaches supporting or refuting empirical evidence records.
5. **Graph Reconciliation**: Automatically synchronizes confirmed findings back to the persistent knowledge graph as verified edges.

### 4. Enterprise Safety & Policy Engine
Multi-tiered safety classification protecting against harmful operational execution while permitting legitimate defensive research:
- **Safety Decisions**: `ALLOW`, `RESTRICT`, `REFUSE_AND_REDIRECT`, `REVIEW_REQUIRED`.
- **Server-Side Enforcement**: Strict API-level refusal gates preventing prompt injection, bypass attempts, or unauthorized execution.
- **Auditable Safety Disclosures**: Actionable rationales, permitted scopes, and safe pedagogical alternatives.

---

## Strict Four-Color Design System

MindWeave rejects visual clutter, arbitrary gradients, and generic dark-mode gimmicks in favor of a cohesive, accessible four-color palette:

| Color | Hex | Role | Distribution |
| :--- | :--- | :--- | :--- |
| **Warm Cream** | `#FAF7F0` | Main canvas, cards, panels, and backgrounds | ~70% |
| **Royal Blue** | `#315FE9` | Primary actions, navigation, active nodes, verified edges | ~15% |
| **Burnt Tangerine** | `#E97942` | Discovery candidates, breakthrough insights, badges | ~10% |
| **Ink Black** | `#252525` | High-contrast typography, icons, primary borders | ~5% |

---

## Architectural Stack

- **Framework**: [Next.js 15.1.7](https://nextjs.org/) App Router (Server & Client Components)
- **UI & State**: [React 19](https://react.dev/), [Tailwind CSS 3.4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Graph Visualization**: [`@xyflow/react`](https://reactflow.dev/) (React Flow v12)
- **State & Synchronization**: [Zustand 5](https://github.com/pmndrs/zustand) with dual-mode LocalStorage persistence and backward-compatible migration
- **Database**: [Supabase PostgreSQL 16](https://supabase.com/) with `pgvector` and Row-Level Security (RLS) across 11 tables
- **Testing**: [Vitest 5.0](https://vitest.dev/) with 95 unit, integration, and E2E tests

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20.x
- npm 9+ or pnpm 8+

### Installation

```bash
# 1. Clone repository
git clone https://github.com/your-username/mindweave.git
cd mindweave

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
```

### Environment Configuration

Edit `.env.local` with your database and model provider credentials:

```ini
# Supabase PostgreSQL + pgvector
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI Model Provider APIs (optional for live generation)
ANTHROPIC_API_KEY=your-anthropic-api-key
GEMINI_API_KEY=your-gemini-api-key
OPENAI_API_KEY=your-openai-api-key
```

### Running the Application

```bash
# Start local development server
npm run dev

# Run TypeScript typecheck
npm run typecheck

# Run test suite
npm test

# Build production bundle
npm run build

# Start production server
npm start
```

The application is accessible at [http://localhost:3000](http://localhost:3000).

---

## REST API Specification

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health status and service identifier (`mindweave-api`) |
| `/api/concepts` | `GET`, `POST` | List workspace concepts or persist new extracted nodes |
| `/api/relationships` | `GET`, `POST` | List and create verified graph edges with schema checks |
| `/api/discoveries/scan` | `POST` | Trigger autonomous discovery scan on current graph state |
| `/api/investigations/promote` | `POST` | Promote discovery candidate to formal Discovery Lab protocol |
| `/api/investigations/reconcile` | `POST` | Reconcile verified lab conclusions into permanent graph edges |
| `/api/safety/check` | `POST` | Audit text or candidate against the safety policy matrix |

---

## Quality Assurance & Testing

MindWeave enforces a comprehensive automated test matrix with 100% passing status:

- **Safety Policy & Enforcement**: 33 automated tests validating `ALLOW`, `RESTRICT`, `REFUSE_AND_REDIRECT`, and server bypass prevention.
- **Discovery Engine**: 8 tests covering analogical bridging, novelty scoring, and contradiction detection.
- **Investigation Lab**: 6 tests covering 5-stage lifecycle and graph edge reconciliation.
- **API & Security**: 13 route validation tests and 5 workspace authentication/isolation tests.
- **Concept & Relationship CRUD**: 15 tests covering extraction, deduplication, and relationship validation.

Run all tests:
```bash
npm test
```

---

## License

MIT License. See [LICENSE](LICENSE) for details.
