# 14. Research Sources and Evidentiary Bibliography

## 1. Primary Competitor References and Vendor Documentation

### 1.1 Obsidian
* **Title:** Obsidian Core Documentation & Graph View Specification
* **URL:** [https://obsidian.md/](https://obsidian.md/)
* **Publisher:** Dynalist Inc.
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Local-first plain text markdown vault; bidirectional linking via `[[Wikilinks]]`; global and local interactive graph view; 1,000+ community plugins.
* **Verified Limitations & Third-Party Assessment:** Graph view lacks typed semantic relationships out-of-the-box; graph visualization suffers from the "hairball problem" at scale (> 1,000 notes); AI capabilities are fragmented across third-party plugins (Smart Connections, Copilot) with no autonomous cross-domain bridge discovery.

### 1.2 TheBrain
* **Title:** TheBrain 14 Architecture & Associative Thought Mapping
* **URL:** [https://www.thebrain.com/](https://www.thebrain.com/)
* **Publisher:** TheBrain Technologies LP
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Dynamic mind-mapping network centered around active "Thoughts"; parent, child, and jump directional connections; integrated AI expansion suggestions.
* **Verified Limitations & Third-Party Assessment:** Proprietary binary/database format; closed ecosystem; rigid relational hierarchy (parent/child/jump) that cannot represent complex scientific ontologies (`inhibits`, `contradicts`, `analogous_to`); no empirical hypothesis testing lab.

### 1.3 Heptabase
* **Title:** Heptabase Product Documentation & Spatial Research Workflows
* **URL:** [https://heptabase.com/](https://heptabase.com/)
* **Publisher:** Heptabase Inc.
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Visual whiteboard workspace for complex research; atomic card creation from PDF highlights; seamless PDF coordinate citation anchoring.
* **Verified Limitations & Third-Party Assessment:** High manual maintenance overhead; 100% human-driven connection placement; zero autonomous background discovery; lacks graph-theoretic topological analytics.

### 1.4 Capacities
* **Title:** Capacities: A Studio for Your Mind
* **URL:** [https://capacities.io/](https://capacities.io/)
* **Publisher:** Capacities GmbH
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Object-oriented note-taking; explicit entity schemas (Objects, Collections, Tags); daily notes integration; embedded AI Assistant.
* **Verified Limitations & Third-Party Assessment:** Requires disciplined manual upfront schema planning; AI features are restricted to inline conversational assistance; graph view is descriptive rather than an active discovery engine.

### 1.5 Tana
* **Title:** Tana: The Everything OS & Supertag Documentation
* **URL:** [https://tana.inc/](https://tana.inc/)
* **Publisher:** Tana Inc.
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Outliner where everything is a node; dynamic Supertags acting as relational schemas and AI command runners; voice-to-data parsing via Tana Paste.
* **Verified Limitations & Third-Party Assessment:** Steep learning curve; outliner-only interface (lacks spatial 2D knowledge canvas); closed cloud infrastructure; lacks an empirical hypothesis-testing and experiment-tracking framework.

### 1.6 Kumu
* **Title:** Kumu Systems Mapping and Network Analysis Guide
* **URL:** [https://kumu.io/](https://kumu.io/)
* **Publisher:** Kumu Inc.
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Industrial network visualization; computation of degree, betweenness, and eigenvector centrality; causal loop diagramming.
* **Verified Limitations & Third-Party Assessment:** High barrier to entry; manual data authoring (spreadsheets); no generative AI integration; lacks note capture and hypothesis evolution workflows.

### 1.7 NotebookLM
* **Title:** Google NotebookLM Documentation & Grounded Gemini RAG
* **URL:** [https://notebooklm.google.com/](https://notebooklm.google.com/)
* **Publisher:** Google LLC
* **Access Date:** 2026-10-26
* **Key Claims & Capabilities (Vendor):** Grounded document comprehension over up to 50 uploaded sources; precise verbatim citations; audio overview generation.
* **Verified Limitations & Third-Party Assessment:** Siloed project notebooks; no persistent knowledge graph; insights remain trapped in conversational chat streams; no hypothesis validation or long-term knowledge evolution tracking.

---

## 2. Open-Source Repositories & Technical Frameworks

### 2.1 Firecrawl
* **Title:** Firecrawl: Turn Entire Websites into Clean Markdown for LLMs
* **URL:** [https://github.com/firecrawl/firecrawl](https://github.com/firecrawl/firecrawl)
* **Publisher:** Mendable / Firecrawl Open Source Team
* **License:** AGPL-3.0 (Core)
* **Access Date:** 2026-10-26
* **Key Claims:** Programmatic web scraping API converting dynamic SPAs and PDFs into clean Markdown; handles proxies, anti-bot protection, and rate limiting; official MCP server integration.
* **Assessment & Classification:** Verified gold standard for Phase 1/Scope B document ingestion. Recommended.

### 2.2 Get Shit Done (GSD Core)
* **Title:** GSD: Spec-Driven Development & Context Engineering for AI Coding Agents
* **URL:** [https://github.com/gsd-build/get-shit-done](https://github.com/gsd-build/get-shit-done)
* **Publisher:** Open-GSD Team
* **License:** MIT
* **Access Date:** 2026-10-26
* **Key Claims:** Disciplined phase loop (Discuss, Plan, Execute, Verify, Ship) preventing agent context rot.
* **Assessment & Classification:** Verified highly effective for managing agent development sessions without context drift. Recommended.

### 2.3 Taste Skill & UI/UX Pro Max Skill
* **Title:** Taste Skill: Anti-Slop Frontend Framework & UI/UX Pro Max Design Intelligence
* **URL:** [https://www.tasteskill.dev/](https://www.tasteskill.dev/) | [https://github.com/nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill)
* **Publisher:** Taste Skill / NextLevelBuilder
* **License:** MIT / Open Resource
* **Access Date:** 2026-10-26
* **Key Claims:** Eliminates generic AI boilerplate styles; enforces disciplined color tokens, typography scales, and layout rules for Tailwind and React.
* **Assessment & Classification:** Verified essential for styling the Cognitive Observatory design system. Recommended.

### 2.4 React Flow (@xyflow/react)
* **Title:** React Flow: Wire Your Ideas
* **URL:** [https://reactflow.dev/](https://reactflow.dev/)
* **Publisher:** webkid GmbH / xyflow
* **License:** MIT
* **Access Date:** 2026-10-26
* **Key Claims:** Node-based UI library for React; highly customizable HTML node rendering; built-in panning, zooming, minimap, and edge routing.
* **Assessment & Classification:** Verified primary candidate for Web of Thoughts interactive canvas. Recommended.

### 2.5 Supabase & pgvector
* **Title:** Supabase Architecture & pgvector Extension Documentation
* **URL:** [https://supabase.com/docs/guides/database/extensions/pgvector](https://supabase.com/docs/guides/database/extensions/pgvector)
* **Publisher:** Supabase Inc.
* **License:** Apache-2.0
* **Access Date:** 2026-10-26
* **Key Claims:** Native vector similarity search directly within PostgreSQL using HNSW indexes; unified relational + vector querying under Row-Level Security.
* **Assessment & Classification:** Verified primary database and vector engine. Recommended.

---

## 3. Classification of Claims and Rigor

To uphold the highest academic and engineering standards, assertions throughout this research are categorized as follows:
* **[Verified Fact]:** Documented in official API specifications, verified in live repository code, or validated via database query benchmarks.
* **[Vendor Claim]:** Stated on product marketing homepages; evaluated critically for real-world limitations.
* **[Third-Party Assessment]:** Documented in independent user reviews, Reddit/Hacker News engineering discussions, and academic comparisons.
* **[Engineering Recommendation]:** Formal technical synthesis and architecture proposals formulated by this research team.
