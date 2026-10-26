# Architecture Decision Records (ADRs)

**Project:** Web of Thoughts  
**Date:** 2026-10-26  
**Status:** Approved for Implementation

---

## Index of Architecture Decision Records

* [ADR-001: Strategic Product Direction (Path C: Autonomous Discovery + Lab)](#adr-001-strategic-product-direction-path-c)
* [ADR-002: Interactive Graph Rendering Engine Selection](#adr-002-interactive-graph-rendering-engine-selection)
* [ADR-003: Unified Relational & Vector Persistence Architecture](#adr-003-unified-relational--vector-persistence-architecture)
* [ADR-004: 3-Tier Hybrid Discovery Pipeline Design](#adr-004-3-tier-hybrid-discovery-pipeline-design)
* [ADR-005: Reified Knowledge Edges with Explicit Lifecycle States](#adr-005-reified-knowledge-edges-with-explicit-lifecycle-states)
* [ADR-006: Provenance & Deterministic Byte-Offset Citation Anchoring](#adr-006-provenance--deterministic-byte-offset-citation-anchoring)
* [ADR-007: Multi-Provider AI Foundation Strategy (Claude / Gemini / BYOK)](#adr-007-multi-provider-ai-foundation-strategy)
* [ADR-008: Progressive Level-of-Detail (LOD) to Eliminate Graph Hairballs](#adr-008-progressive-level-of-detail-lod-to-eliminate-graph-hairballs)
* [ADR-009: Document Ingestion Pipeline Strategy (Native Parsing & Firecrawl)](#adr-009-document-ingestion-pipeline-strategy)
* [ADR-010: Discovery Lab State Machine & Knowledge Reconciliation](#adr-010-discovery-lab-state-machine--knowledge-reconciliation)
* [ADR-011: First-Class Safety & Policy Engine Integration](#adr-011-first-class-safety--policy-engine-integration)

---

## ADR-001: Strategic Product Direction (Path C)

### Status
**Accepted**

### Context
Personal knowledge management applications either function as passive note archives (Obsidian, Notion) where the user must do all linking manually, or as conversational chat assistants (ChatGPT, NotebookLM) where insights remain ephemeral. We needed to choose between:
* *Path A:* Pure Knowledge Graph visualization tool.
* *Path B:* Conversational AI assistant with file search.
* *Path C:* Autonomous Discovery Engine + Discovery Lab.

### Decision
Adopt **Path C: Autonomous Discovery Engine + Discovery Lab**. The application serves as an active research collaborator that autonomously surfaces non-obvious cross-domain connections and provides a structured empirical workbench to formulate hypotheses, design experiments, and reconcile validated findings back into a persistent knowledge graph.

### Consequences
* **Positive:** Establishes defensible product differentiation against generic LLM chatbots and static PKM tools. Solves the "note graveyard" problem.
* **Negative:** Requires building both a high-performance graph interface and a multi-step investigation state machine, increasing engineering scope.

---

## ADR-002: Interactive Graph Rendering Engine Selection

### Status
**Accepted**

### Context
The interactive knowledge canvas requires rendering nodes and typed edges smoothly while allowing users to interact with rich UI controls (buttons, badges, tags, citations) inside each node. We evaluated:
1. Pure WebGL / 3D (Three.js, 3d-force-graph).
2. WebGL 2D (Sigma.js / Graphology).
3. Canvas 2D (Cytoscape.js).
4. DOM/SVG Hybrid (React Flow / `@xyflow/react`).

### Decision
Adopt **`@xyflow/react` (React Flow v12)** as the primary canvas engine, paired with **`graphology`** executing inside a Web Worker for background force-directed layout computation.

### Consequences
* **Positive:** Every node is a full React component with complete accessibility, rich Tailwind styling, custom buttons, and smooth hover drawers. World-class pan, zoom, and selection handling.
* **Negative:** DOM rendering has lower absolute node limits (~1,500 nodes) compared to WebGL (100,000+ nodes). We mitigate this via Level-of-Detail (LOD) node virtualization and cluster aggregation.
* **Alternatives Rejected:** Three.js was rejected because 3D graphs cause user disorientation and spatial fatigue; Sigma.js was rejected because building rich interactive card UI inside WebGL textures introduces extreme development overhead.

---

## ADR-003: Unified Relational & Vector Persistence Architecture

### Status
**Accepted**

### Context
We required a database system capable of storing relational entity metadata, traversing multi-hop graph edges, executing high-dimensional vector similarity searches, and enforcing multi-tenant security.

### Decision
Standardize on **PostgreSQL 16 via Supabase** with the **`pgvector`** extension, utilizing Recursive Common Table Expressions (CTEs) for graph queries and Row-Level Security (RLS) for tenant isolation.

### Consequences
* **Positive:** Eliminates the operational complexity of managing a polyglot persistence architecture (e.g., Neo4j + Pinecone + Postgres). ACID transactions guarantee that concepts, edges, and vector embeddings mutate atomically.
* **Negative:** Deep graph traversals (> 6 hops) require optimized SQL CTEs rather than Cypher queries.
* **Alternatives Rejected:** Neo4j was rejected due to high hosting costs and complex vector integration; Pinecone was rejected to prevent data synchronization drift with relational records.

---

## ADR-004: 3-Tier Hybrid Discovery Pipeline Design

### Status
**Accepted**

### Context
Passing thousands of raw notes into an LLM context window to find "novel connections" is cost-prohibitive ($10–$30 per query), slow, and produces trivial or hallucinated results.

### Decision
Implement a **3-Tier Discovery Pipeline**:
* **Tier 1 (Graph Topology):** Evaluates community clusters and betweenness centrality to isolate cross-cluster candidate pairs.
* **Tier 2 (Vector Filtering):** Uses `pgvector` to screen candidate pairs, selecting only those in the "Goldilocks Zone" ($0.45 \le \text{Cosine Similarity} \le 0.75$).
* **Tier 3 (Constrained LLM Synthesis):** Evaluates the top candidate pairs using Claude 3.5 Sonnet / Gemini 1.5 Pro to extract structural analogies, tension, novelty, and plausibility scores.

### Consequences
* **Positive:** Discovery execution costs $< \$0.01$ per scan, executes in $< 3.5$ seconds, and eliminates semantically trivial suggestions.
* **Negative:** Requires tuning vector distance thresholds across diverse user domains.

---

## ADR-005: Reified Knowledge Edges with Explicit Lifecycle States

### Status
**Accepted**

### Context
In traditional tools, graph edges are simple strings or untyped visual lines. A system that recommends speculative connections cannot treat proposed links as established facts.

### Decision
Model relationships as **first-class reified database entities** with typed semantics (`causes`, `contradicts`, `analogous_to`, `enables`, `depends_on`, `inhibits`) and explicit lifecycle states:
* `proposed`: Generated by AI discovery engine; unverified.
* `accepted`: Validated by user or confirmed via experiment.
* `rejected`: Falsified; retained to prevent duplicate recommendations.
* `disputed`: Conflicted by opposing source claims.
* `superseded`: Replaced by a more refined version.

### Consequences
* **Positive:** Prevents misinformation from polluting canonical knowledge; provides complete transparency into the epistemic state of every connection.
* **Negative:** Requires extra UI controls to display and transition edge states.

---

## ADR-006: Provenance & Deterministic Byte-Offset Citation Anchoring

### Status
**Accepted**

### Context
LLMs frequently hallucinate citations, quoting text that does not exist or attributing claims to the wrong document.

### Decision
Implement a **Deterministic Byte-Offset Citation Anchoring Engine**. Every extracted claim and relationship must link to a `source_chunk` storing exact `start_char` and `end_char` offsets. The server validates that quoted text matches the source document verbatim before saving.

### Consequences
* **Positive:** 100% verifiable citations. Clicking any claim in the UI instantly highlights the exact source text. Zero hallucinated citations tolerated.
* **Negative:** Text edits to source documents require recalculating character offsets or invalidating cached chunks.

---

## ADR-007: Multi-Provider AI Foundation Strategy

### Status
**Accepted**

### Context
Relying exclusively on a single AI vendor introduces lock-in, rate-limit vulnerability, and pricing risk.

### Decision
Implement a provider-agnostic AI abstraction layer supporting **Anthropic Claude 3.5 Sonnet** and **Google Gemini 1.5 Pro**, with support for Bring-Your-Own-Key (BYOK) AES-256 encrypted storage and client-side ONNX embeddings for local search.

### Consequences
* **Positive:** High availability; allows users to use their preferred API provider; protects user privacy.
* **Negative:** Requires maintaining prompt adapters and output parsers across two distinct provider SDKs.

---

## ADR-008: Progressive Level-of-Detail (LOD) to Eliminate Graph Hairballs

### Status
**Accepted**

### Context
Standard graph visualizations become unreadable "hairballs" once node counts exceed 500, displaying an impenetrable tangle of overlapping lines and labels.

### Decision
Implement a **Progressive Level-of-Detail (LOD) Rendering System**:
* Zoom $< 0.4\times$: Nodes collapse into soft, glowing density clusters; text is hidden.
* Zoom $0.4\times - 0.9\times$: Nodes render as compact capsules showing canonical names and primary edges.
* Zoom $> 0.9\times$: Full interactive cards expand, revealing badges, action triggers, and connection counts.

### Consequences
* **Positive:** Completely eliminates visual clutter; preserves high frame rates at any zoom level.
* **Negative:** Requires managing zoom-dependent rendering states in React Flow.

---

## ADR-009: Document Ingestion Pipeline Strategy

### Status
**Accepted**

### Context
Users need to ingest plain text, Markdown, web URLs, and multi-page PDFs. Parsing raw HTML or complex multi-column PDFs with standard regex produces noisy boilerplate that breaks LLM extraction.

### Decision
Adopt a phased ingestion strategy:
* **Scope A (MVP):** Native server-side parsing for plain text and Markdown notes.
* **Scope B (Demo):** Integrate **Firecrawl API** for turning dynamic JavaScript web pages and complex PDFs into token-optimized, clean Markdown.

### Consequences
* **Positive:** Keeps Scope A implementation lean, rapid, and dependency-free, while providing a clear, high-quality path for PDF/web ingestion in Scope B.
* **Negative:** Scope A users cannot directly upload PDFs until Milestone 5/Scope B.

---

## ADR-010: Discovery Lab State Machine & Knowledge Reconciliation

### Status
**Accepted**

### Context
PKM tools allow users to write down hypotheses, but provide no mechanism to track validation, record empirical results, or update the knowledge graph when an assumption is falsified.

### Decision
Implement an **11-Step Investigation State Machine** in the Discovery Lab. When an investigation concludes, an atomic database transaction updates the associated relationship status and writes an immutable audit record to `knowledge_revisions`.

### Consequences
* **Positive:** Closes the intellectual loop from idea to verification; creates a self-correcting, evolving knowledge base.
* **Negative:** Requires rigorous state transition validation and database rollbacks to ensure graph consistency.

---

## ADR-011: First-Class Safety & Policy Engine Integration

### Status
**Proposed — Pending Stakeholder Sign-Off**

### Context
Researchers exploring frontier cybersecurity, biomedicine, or energy materials frequently handle sensitive or dual-use concepts. Naive keyword filtering blocks legitimate educational or defensive research, while naive LLM execution risks generating actionable exploit instructions. We needed an engine that preserves legitimate research while strictly preventing actionable harm.

### Decision
Integrate a dedicated, cross-cutting **Safety & Policy Engine** across the Knowledge Universe, Discovery Engine, and Discovery Lab. The engine uses a 5-outcome policy decision model (`ALLOW`, `ALLOW_WITH_LIMITS`, `CLARIFY`, `REFUSE_AND_REDIRECT`, `BLOCK_SPECIFIC_OPERATION`). It enforces strict epistemic separation between Safety Decisions and Scientific Truth / Evidence Quality.

### Consequences
* **Positive:** Legitimate defensive and academic research on malware, vulnerabilities, and dual-use topics proceeds without overblocking; actionable harm instructions are refused calmly with constructive alternatives; prompt injections in ingested files are neutralized.
* **Negative:** Requires an extra assessment step on high-risk operations and maintenance of a dedicated 12-category test benchmark.
* **Alternatives Rejected:** Keyword blocklists were rejected due to unacceptable false positives on defensive research; relying solely on base LLM alignment was rejected due to lack of explainability, auditability, and deterministic failure modes.

