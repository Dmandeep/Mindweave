# Final Decision Register: Web of Thoughts

**Document Version:** 1.0.0-FINAL-REGISTER  
**Date:** 2026-10-26  
**Status:** Baseline Alignment Complete — Pending Stakeholder Sign-Off  
**Scope:** Authoritative register of all technical, product, and architectural decisions, reconciling ADR statuses with stakeholder sign-off gates.

---

## Reconciliation of Decision Statuses

> [!IMPORTANT]
> In Phase 0, the engineering and architecture team marked internal consensus as "Accepted" within `ARCHITECTURE_DECISION_RECORDS.md`. For governance clarity in Phase 0.5, all items are classified into two definitive categories:
> 1. **Engineering Consensus (Internal Baseline):** Recommended architectural choices validated by technical research.
> 2. **Stakeholder Approval Required:** High-impact choices that dictate scope, cost, vendor dependencies, and product boundaries requiring explicit user sign-off.

---

## Complete Decision Register

### DEC-001: Strategic Product Direction (Path C)
* **Decision:** Selection of product operating model and core value loop.
* **Recommended Option:** **Path C: Autonomous Discovery Engine + Discovery Lab**.
* **Alternatives Considered:**
  * *Path A (Static Knowledge Graph):* Pure note-taking and manual graph mapping (like Obsidian/TheBrain). Rejected because it perpetuates the "collector's fallacy" and note graveyard.
  * *Path B (Conversational RAG Assistant):* Chatbot with document upload (like NotebookLM/ChatGPT). Rejected because insights remain ephemeral and do not accumulate into a persistent graph asset.
* **Reasoning & Evidence:** Market research demonstrated an unaddressed vacuum between static graphs and ephemeral chat tools. Combining proactive topological discovery with an empirical investigation lab creates a defensible competitive moat.
* **Trade-offs:** Requires engineering both a high-performance interactive graph canvas and an empirical state machine in the first release.
* **Approval Status:** **APPROVED BY USER IN INITIAL MISSION PROMPT** (Path C explicitly selected).
* **Consequences for Implementation:** Governs the entire 8-stage lifecycle and ensures the Discovery Lab is treated as a core pillar, not an afterthought.

---

### DEC-002: Interactive Graph Canvas Rendering Engine
* **Decision:** Selection of graph visualization library for the primary user interface.
* **Recommended Option:** **`@xyflow/react` (React Flow v12)** paired with **`graphology`** in a Web Worker for automatic layout calculation.
* **Alternatives Considered:**
  * *Three.js / 3D-Force-Graph:* Evaluated and rejected due to spatial disorientation, user nausea, and extreme difficulty in rendering readable UI cards.
  * *Sigma.js / WebGL:* Evaluated for extreme scale (100k nodes), but rejected because rendering rich HTML buttons, badges, and drawers inside WebGL textures requires massive custom shader development.
  * *Cytoscape.js:* Viable 2D canvas option, but weaker native React integration than React Flow.
* **Reasoning & Evidence:** Official xyflow v12 documentation verifies native React 19 compatibility. React Flow enables every node to be an accessible, styled React component with interactive handles and buttons.
* **Trade-offs:** Maximum interactive node capacity is capped at ~1,500 nodes in the immediate DOM viewport. For larger graphs, level-of-detail (LOD) node culling and clustering must be applied.
* **Approval Status:** **PENDING STAKEHOLDER SIGN-OFF**.
* **Consequences for Implementation:** Dictates frontend component architecture in Milestone 4.

---

### DEC-003: Database and Persistence Architecture
* **Decision:** Unified relational database vs. polyglot graph/vector architecture.
* **Recommended Option:** **PostgreSQL 16 via Supabase** with `pgvector` for semantic embeddings, recursive Common Table Expressions (CTEs) for graph queries, and Row-Level Security (RLS) for multi-tenant isolation.
* **Alternatives Considered:**
  * *Polyglot Stack (PostgreSQL + Neo4j + Pinecone):* Rejected due to extreme operational overhead, synchronization drift, high cloud hosting costs, and distributed transaction failure modes.
  * *Pure Local SQLite (CRDT-based):* Evaluated for local-first, but rejected for MVP due to complex sync conflict resolution; deferred to Scope C.
* **Reasoning & Evidence:** PostgreSQL 16 with `pgvector` v0.7+ supports sub-millisecond HNSW cosine search. Recursive CTEs handle directional traversals under 6 hops with index efficiency. Single ACID transactions guarantee that nodes, edges, and embeddings mutate together.
* **Trade-offs:** Very deep network graph algorithms (> 8 hops) are slower in SQL than native graph stores, but our 3-Tier engine isolates traversals to local neighborhoods.
* **Approval Status:** **PENDING STAKEHOLDER SIGN-OFF**.
* **Consequences for Implementation:** Dictates database migrations and Supabase SDK integration in Milestone 2.

---

### DEC-004: Multi-Provider AI Foundation Strategy
* **Decision:** Selection of foundation models for extraction, discovery synthesis, and interactive assistance.
* **Recommended Option:** **Multi-Provider AI Abstraction Layer**:
  * *High-Reasoning Tier:* **Claude 3.5 Sonnet** (Anthropic) or **Gemini 1.5 Pro** (Google) for extraction and Tier 3 analogy synthesis.
  * *High-Speed / Low-Cost Tier:* **Gemini 1.5 Flash** ($0.075/M input, $0.30/M output) for candidate screening and fast assistance.
  * *Embedding Tier:* **`text-embedding-3-small`** ($0.02/M tokens, 1536d).
  * *Privacy Mode:* Bring-Your-Own-Key (BYOK) AES-256-GCM encrypted client storage.
* **Alternatives Considered:**
  * *OpenAI-Exclusive (GPT-4o only):* Rejected to eliminate vendor lock-in and rate-limit vulnerability.
  * *Local-Only LLMs (Ollama / Llama-3-8B):* Evaluated as attractive for privacy, but client hardware constraints (GPU requirements) make it unfeasible as a mandatory baseline. Local ONNX embeddings remain an optional privacy enhancement.
* **Reasoning & Evidence:** Official pricing verified: Gemini 1.5 Flash is 20x–40x cheaper than premier models, making high-throughput candidate scanning economically sustainable.
* **Trade-offs:** Requires maintaining prompt adapters and output schemas across two vendor SDKs.
* **Approval Status:** **PENDING STAKEHOLDER SIGN-OFF**.
* **Consequences for Implementation:** Dictates `lib/ai` module design in Milestone 3.

---

### DEC-005: Scope A MVP Feature Boundary
* **Decision:** Defining the exact functional scope for the initial implementation.
* **Recommended Option:** **Strict 10-Step Verifiable Vertical Slice (Scope A)**:
  1. Plain text & Markdown capture.
  2. Concept & typed relationship extraction.
  3. Interactive 2D React Flow canvas.
  4. 3-Tier Discovery Engine (Vector filtering + LLM structural reasoning).
  5. Evidence Explorer with verbatim source text excerpts.
  6. Discovery Lab MVP: 1 hypothesis builder, 1 experiment plan with success criteria, observation logger.
  7. Knowledge Evolution: Edge status update (`proposed` $\rightarrow$ `accepted` / `rejected`) + audit revision logging.
* **Features Explicitly Deferred to Scope B/C:**
  * Automated web scraping & PDF parsing via Firecrawl (Scope B).
  * Topological community detection via Graphology algorithms (Scope B).
  * Contradiction & stance classification engine (Scope B).
  * Multi-user team collaboration & sharing (Scope C).
  * 3D WebGL / Three.js galaxy rendering (Scope C).
* **Reasoning & Evidence:** Delivering an end-to-end working loop is vastly superior to half-building complex web scrapers or 3D visuals. The core product thesis must be validated first.
* **Trade-offs:** Users cannot directly upload PDFs or web links in Scope A (text/markdown only).
* **Approval Status:** **PENDING STAKEHOLDER SIGN-OFF**.
* **Consequences for Implementation:** Establishes the hard boundaries for Milestones 1 through 9 in `IMPLEMENTATION_ROADMAP.md`.

---

### DEC-006: Epistemic Confidence Calibration Policy
* **Decision:** How relationship confidence scores are updated when an investigation is completed.
* **Recommended Option:** **Human Evaluation Capping**:
  * Marking an investigation as `supported` updates edge status to `accepted`, but sets the confidence score to the user's explicit confidence rating (or caps it at a conservative `0.85` default), recording the evidence trail in `knowledge_revisions`.
  * Marking an outcome as `refuted` updates status to `rejected`, keeping the edge in the database with a visual strike-through to prevent the discovery engine from recommending it again.
* **Alternatives Considered:**
  * *Automatic 0.95 Elevation:* Rejected because single qualitative user tests do not statistically prove an empirical claim.
* **Reasoning & Evidence:** Scientific and investigative integrity requires separating human approval (`status: accepted`) from absolute statistical certainty (`confidence_score: 1.00`).
* **Trade-offs:** Requires users to optionally provide a confidence score or accept a default conservative threshold.
* **Approval Status:** **PENDING STAKEHOLDER SIGN-OFF**.
* **Consequences for Implementation:** Governs the reconciliation logic in Milestone 8.

---

### DEC-007: Safety & Policy Engine Integration
* **Decision:** Architecture and policy model for handling sensitive, dual-use, and hazardous research topics.
* **Recommended Option:** **5-Outcome Contextual Policy Engine (`ALLOW`, `ALLOW_WITH_LIMITS`, `CLARIFY`, `REFUSE_AND_REDIRECT`, `BLOCK_SPECIFIC_OPERATION`)**.
  * Preserves legitimate educational, defensive, and academic research.
  * Restricts assistance that meaningfully facilitates actionable harm.
  * Strict epistemic separation: safety decisions do not alter factual truth or evidence quality.
  * Fails safe: low-risk local note storage remains available during AI outages; high-risk code generation is deferred.
* **Alternatives Considered:**
  * *Keyword-based Blocklists:* Rejected due to unacceptable overblocking of defensive cybersecurity and medical research.
  * *Unconstrained / Passive Passthrough:* Rejected due to high legal, ethical, and safety hazards regarding actionable cyberattacks and physical harm.
* **Reasoning & Evidence:** Evaluates requested action in context rather than vocabulary alone. Documented in full in `SAFETY_AND_POLICY_ENGINE.md`.
* **Trade-offs:** Adds an assessment step before sensitive generations and requires maintaining a `safety_assessments` table.
* **Approval Status:** **PROPOSED — PENDING STAKEHOLDER SIGN-OFF**.
* **Consequences for Implementation:** Integrates policy gates into Milestones 3, 5, 7, and 9.

---

## Summary of Decisions Pending User Approval

| Decision ID | Description | Recommended Option | Implementation Impact |
| :---: | :--- | :--- | :--- |
| **DEC-002** | Graph Rendering Canvas | `@xyflow/react` (React Flow v12) + Web Worker | Milestone 4 |
| **DEC-003** | Unified Relational Persistence | PostgreSQL 16 via Supabase + pgvector | Milestone 2 |
| **DEC-004** | AI Provider Strategy | Claude 3.5 Sonnet / Gemini 1.5 Pro + Gemini Flash + BYOK | Milestone 3 |
| **DEC-005** | MVP Scope Boundary | Strict 10-Step Workflow (Text/MD capture, 2D Canvas, Lab MVP) | Milestones 1–9 |
| **DEC-006** | Epistemic Confidence Policy | Separate Status from Confidence; Cap single-test elevation at 0.85 | Milestone 8 |
| **DEC-007** | Safety & Policy Engine | 5-Outcome Contextual Policy Engine + Epistemic Separation | Milestones 3, 5, 7, 9 |

