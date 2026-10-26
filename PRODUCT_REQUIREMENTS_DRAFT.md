# Product Requirements Document (PRD)

**Product Name:** Web of Thoughts  
**Target Release:** Scope A (Minimum Working Product)  
**Document Version:** 1.0.0-DRAFT  
**Author:** Coordinated Senior Product & Engineering Team  
**Status:** Ready for Baseline Approval

---

## 1. Product Vision & Problem Statement

### 1.1 Product Vision
Web of Thoughts is an intelligent, knowledge-centric platform that transforms static notes, research documents, and intellectual observations into a persistent, living knowledge graph, autonomously uncovers non-obvious cross-domain relationships, and provides an empirical investigation laboratory to validate discoveries through structured hypotheses and experiments.

### 1.2 Problem Statement
Knowledge workers, scientific researchers, and technology strategists capture vast amounts of unstructured information. However:
1. **The Note Graveyard:** Existing PKM tools (Obsidian, Notion) require manual linking and organization. As databases grow, over 90% of notes are never revisited, and graph views degrade into unusable visual "hairballs."
2. **Ephemeral AI Context:** Conversational AI assistants (ChatGPT, Claude, NotebookLM) offer brilliant synthesis, but their output is trapped in isolated chat sessions. When the session ends, the insights are lost, and the AI cannot remember them next week.
3. **The Speculation Trap:** Ideas generated in notes or AI chats remain untested speculations without a disciplined bridge to empirical validation.

---

## 2. Target Personas & Core User Needs

| Persona | Role | Primary Objective | Critical Pain Point |
| :--- | :--- | :--- | :--- |
| **Dr. Elena Rostova** | Interdisciplinary Academic Researcher (Biomedical) | Identify novel biological pathways across immunology and neurology literature. | Different scientific fields use disparate vocabularies, making keyword search useless for finding common mechanisms. |
| **Marcus Vance** | Frontier Technology Architect | Evaluate architectural trade-offs across distributed consensus and edge computing. | Brainstorming insights with LLMs vanish into chat logs; hard to track invalidated assumptions over time. |
| **Sarah Lin** | Investigative Market & Policy Analyst | Map global clean-tech supply chain vulnerabilities from regulatory filings. | High risk of hallucinated citations in standard AI tools; requires 100% verifiable source provenance. |

---

## 3. Core Product Principles

1. **The Graph is the Cumulative Asset:** Conversational interactions are ephemeral tools; the persistent, typed knowledge graph is the durable source of truth.
2. **Deterministic Provenance First:** No relationship or concept exists without an auditable link back to an exact text chunk and source document.
3. **Discovery Over Retrieval:** The system does not merely answer questions; it actively scans for structural holes, weak ties, and cross-domain analogies that the user did not think to ask for.
4. **Empirical Validation Over Mere Speculation:** A compelling idea is only the beginning. The product guides the user from discovery to testable hypothesis and real-world outcome recording.
5. **Calm, High-Precision Aesthetics:** The interface reflects a "Cognitive Observatory"—deep visual calm, zero clutter, and purposeful color coding.

---

## 4. Key Differentiators: The "Why Choose Us?" Mandate

```
+---------------------------------------------------------------------------------------+
|  WHY CHOOSE WEB OF THOUGHTS OVER "OBSIDIAN + CHATGPT"?                                |
+---------------------------------------------------------------------------------------+
| 1. Persistent Topological Reasoning vs. Ephemeral Chat Logs:                          |
|    ChatGPT forgets previous sessions. Web of Thoughts stores every concept, edge, and |
|    finding in a durable PostgreSQL relational graph that compounds over years.        |
|                                                                                       |
| 2. Non-Obvious Cross-Domain Analogies vs. Trivial Similarity:                         |
|    Standard AI plugins use cosine similarity, connecting words that sound alike.      |
|    Our 3-Tier Discovery Engine identifies structural bridges across distant domains.   |
|                                                                                       |
| 3. The Discovery Lab vs. Write-Only Notes:                                            |
|    Instead of letting interesting thoughts die in a bulleted list, our 11-step Lab     |
|    forces hypotheses through an empirical validation funnel with measurable criteria. |
+---------------------------------------------------------------------------------------+
```

---

## 5. Functional Requirements (Scope A: MVP)

### 5.1 Pillar 1: Information Capture (`FR-CAP`)
* **FR-CAP-01:** System shall provide a fast-capture modal allowing plain text and Markdown input.
* **FR-CAP-02:** System shall generate a unique cryptographic hash (SHA-256) and timestamp for every ingested record.
* **FR-CAP-03:** System shall partition submitted text into token-bounded chunks (500–1,000 tokens) with recorded byte offsets.

### 5.2 Pillar 2: Concept & Relationship Extraction (`FR-EXT`)
* **FR-EXT-01:** System shall parse ingested text using an LLM pipeline to extract atomic concepts (canonical name, domain category, short description).
* **FR-EXT-02:** System shall extract typed relationships between extracted concepts (`causes`, `contradicts`, `analogous_to`, `enables`, `depends_on`, `inhibits`).
* **FR-EXT-03:** System shall assign an initial confidence score ($0.00 - 1.00$) to every extracted relationship.
* **FR-EXT-04:** Extracted relationships shall be initialized with `status: proposed`.

### 5.3 Pillar 3: Interactive Knowledge Canvas (`FR-CAN`)
* **FR-CAN-01:** System shall render an interactive 2D node-edge canvas using `@xyflow/react`.
* **FR-CAN-02:** Canvas shall support fluid zoom, pan, node dragging, and viewport recentering.
* **FR-CAN-03:** Nodes shall visually display concept canonical name, domain category badge, and connection count.
* **FR-CAN-04:** Edges shall display directional arrows with stroke colors and styles mapped to relationship types.
* **FR-CAN-05:** Selecting a node or edge shall open the Contextual Inspector displaying properties and citations.

### 5.4 Pillar 4: Autonomous Discovery Engine (`FR-DISC`)
* **FR-DISC-01:** System shall execute a 3-Tier Discovery Pipeline evaluating concept pairs across disparate clusters.
* **FR-DISC-02:** System shall filter candidate concept pairs within the target semantic vector distance ($0.45 \le \text{Cosine Similarity} \le 0.75$).
* **FR-DISC-03:** System shall generate Discovery Candidates containing: proposed relationship, rationale explanation, novelty score, and plausibility score.
* **FR-DISC-04:** System shall present ranked discovery candidates in the Left Navigation Feed.
* **FR-DISC-05:** User shall be able to dismiss, pin, or promote any discovery candidate to the Discovery Lab.

### 5.5 Pillar 5: Evidence Explorer (`FR-EVID`)
* **FR-EVID-01:** Every discovery candidate shall link to exact verbatim source excerpts from the underlying source chunks.
* **FR-EVID-02:** Inspector shall highlight source excerpts side-by-side to allow the user to immediately verify claim validity.
* **FR-EVID-03:** System shall strictly prohibit the creation of ungrounded or hallucinated citation markers.

### 5.6 Pillar 6: Discovery Lab & Investigation (`FR-LAB`)
* **FR-LAB-01:** Promoting a discovery shall create a dedicated Investigation workspace.
* **FR-LAB-02:** Lab shall guide the user to identify underlying assumptions and formulate at least one testable, falsifiable hypothesis.
* **FR-LAB-03:** Lab shall provide fields to define an experiment/validation plan with measurable success criteria.
* **FR-LAB-04:** Lab shall allow the user to record empirical observations and data logs.
* **FR-LAB-05:** User shall be able to record a final evaluation outcome: `Supported`, `Refuted`, or `Inconclusive`.

### 5.7 Pillar 7: Knowledge Evolution (`FR-EVO`)
* **FR-EVO-01:** When an investigation is evaluated as `Supported`, the associated relationship shall update from `status: proposed` to `status: accepted` in the canonical graph.
* **FR-EVO-02:** When an investigation is evaluated as `Refuted`, the relationship shall update to `status: rejected`, visually muting the edge and preventing future duplicate recommendations.
* **FR-EVO-03:** Every status transition shall record an entry in the `knowledge_revisions` audit log.

### 5.8 Pillar 8: Safety & Policy Engine (`FR-SAF`)
* **FR-SAF-01:** System shall evaluate submitted inputs, requested operations, generated discoveries, and experiment plans using a 5-outcome policy model: `ALLOW`, `ALLOW_WITH_LIMITS`, `CLARIFY`, `REFUSE_AND_REDIRECT`, and `BLOCK_SPECIFIC_OPERATION`.
* **FR-SAF-02:** System shall distinguish legitimate educational, defensive, and academic study of sensitive/dangerous topics from operational requests that facilitate harm. Keyword matching alone shall never be the basis of a refusal.
* **FR-SAF-03:** When an operational request facilitates harm, the system shall refuse the actionable request without moralizing and immediately provide a constructive, safe alternative.
* **FR-SAF-04:** Untrusted document content and web pages shall be quarantined as inert data inside XML boundaries and prohibited from overriding governing system instructions.
* **FR-SAF-05:** Safety classifications shall be strictly separated from factual truth, evidence quality, and concept validity; sensitive concepts shall never be marked as false or prohibited in the graph.

---

## 6. Non-Functional Requirements (NFRs)

* **NFR-PERF-01 (Canvas Rendering):** The interactive canvas shall maintain 60 FPS during pan and zoom interactions for graphs containing up to 1,000 nodes.
* **NFR-PERF-02 (Discovery Latency):** An incremental discovery scan triggered by note ingestion shall complete within $\le 3.5$ seconds.
* **NFR-SEC-01 (Tenant Isolation):** Multi-tenant data isolation shall be enforced via PostgreSQL Row-Level Security (RLS) across 100% of tables.
* **NFR-SEC-02 (Injection Defense):** Untrusted document text passed to LLMs must be structurally delimited within XML blocks and stripped of executable scripts.
* **NFR-A11Y-01 (Accessibility):** The interface shall satisfy WCAG 2.1 AA contrast requirements and fully respect `prefers-reduced-motion` settings.
* **NFR-REL-01 (Offline Resilience):** If external LLM APIs fail, the user must retain full ability to create notes, view the graph, search lexically, and edit hypotheses without data loss.

---

## 7. User Stories & Acceptance Criteria (Gherkin Format)

### US-01: Proactive Cross-Domain Discovery
* **As a** researcher studying distributed systems,  
* **I want** the system to alert me when an uploaded biological paper shares structural consensus mechanics with a computer science note,  
* **So that** I can explore innovative cross-disciplinary architectures.

```gherkin
Scenario: Autonomous detection of cross-domain structural bridge
  Given the user has an existing concept "Raft Quorum Leases" in Cluster "Distributed Systems"
  When the user ingests a note describing "Bacterial Quorum Sensing" in Cluster "Biology"
  Then the Discovery Engine detects intermediate vector distance (0.45 <= Cosine <= 0.75)
  And generates a Discovery Candidate with type "cross_domain_analogy"
  And displays the discovery card in the navigation feed with an explanation and source citations
```

### US-02: Discovery Lab Investigation
* **As a** systems architect,  
* **I want** to promote a discovery candidate into the Discovery Lab,  
* **So that** I can define a concrete validation benchmark and record the results.

```gherkin
Scenario: Completing an empirical investigation in Discovery Lab
  Given the user promotes the "Quorum Sensing" discovery to an Investigation
  When the user enters a falsifiable hypothesis and defines a benchmark plan with success criteria
  And executes the benchmark and logs observations
  And marks the investigation outcome as "Supported"
  Then the system updates the relationship status from "proposed" to "accepted"
  And the edge on the Cognitive Canvas transitions to a solid green line with a verified badge
  And a record is appended to the knowledge_revisions table
```

---

## 8. MVP Scope Boundary & Out-of-Scope Items

### Scope A (In-Scope MVP):
* Plain text and Markdown note capture.
* LLM concept extraction and relationship identification.
* React Flow interactive 2D canvas with node inspection.
* 3-Tier Discovery Pipeline generating ranked discovery cards.
* Side-by-side evidence excerpt viewer.
* Discovery Lab MVP: 1 hypothesis, 1 experiment plan, outcome evaluation.
* Relationship status updates (`proposed` $\rightarrow$ `accepted` / `rejected`).

### Explicitly Out-of-Scope for MVP:
* Automated PDF parsing and web scraping (Deferred to Scope B / Firecrawl).
* Topological community auto-layout algorithms (Deferred to Scope B / Graphology).
* Multi-user team collaboration and sharing (Deferred to Scope C).
* 3D WebGL / Three.js galaxy rendering (Deferred to Scope C).
* Automated code spike PR generation on GitHub (Deferred to Scope C).
