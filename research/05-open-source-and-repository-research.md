# 05. Open-Source and Repository Research

## 1. Executive Summary & Selection Philosophy

To build Web of Thoughts efficiently and securely without drowning in external dependencies, we conducted an empirical audit of 12 open-source repositories, agent frameworks, and web scraping utilities.

### Selection Principles:
1. **Zero Runtime Bloat:** Development skills and meta-prompting frameworks should guide the development lifecycle and agent behavior, but must **not** be baked into the end-user production runtime bundle.
2. **Deterministic Architecture Over Fragile Agent Chains:** We reject brittle multi-agent frameworks that pass unconstrained natural language in loops. Core data structures (graphs, provenance, hypothesis records) must reside in typed PostgreSQL schemas.
3. **Supply Chain & Security Vigilance:** External scraping and document retrieval tools must be strictly sandboxed, credentials must never leak into client code, and untrusted web content must be sanitized before ingestion.

---

## 2. In-Depth Repository Evaluation

### 2.1 Engineering & Workflow Resources

#### 1. `gsd-build/get-shit-done` (open-gsd/gsd-core)
* **What it Provides:** A disciplined meta-prompting and context engineering framework designed to combat "context rot" in AI coding agents. Enforces structured development phases: Discuss $\rightarrow$ Plan $\rightarrow$ Execute $\rightarrow$ Verify $\rightarrow$ Ship.
* **Maintenance & Community:** Active, widely adopted across developer communities.
* **License:** MIT.
* **Dependencies & Compatibility:** Zero runtime dependencies. Fully compatible with Windows, CLI agents, Claude Code, Cursor, and Google Antigravity.
* **Security & Supply Chain:** Zero risk; operates entirely as markdown instruction sets and agent rules.
* **Value to Project:** Extremely high for Phase 1 implementation. Enforces vertical-slice execution and prevents agents from writing sloppy, incomplete code.
* **Classification:** **RECOMMENDED FOR INITIAL WORKFLOW** (Development phase orchestrator).

#### 2. `obra/superpowers` & `anthonylee991/gemini-superpowers-antigravity`
* **What it Provides:** Systematic agent skills for test-driven development (TDD), disciplined git branching (worktrees), architecture brainstorming, and automated peer review.
* **Maintenance & Community:** High activity, maintained by veteran open-source authors.
* **License:** MIT.
* **Dependencies & Compatibility:** Markdown/agent playbooks. Fully compatible with Google Antigravity and standard shell environments.
* **Security & Supply Chain:** Zero risk.
* **Value to Project:** Essential for maintaining rigorous test coverage across the discovery algorithms and database migration layers.
* **Classification:** **RECOMMENDED FOR INITIAL WORKFLOW** (Quality assurance and TDD discipline).

#### 3. `nextlevelbuilder/ui-ux-pro-max-skill`
* **What it Provides:** A curated design intelligence database and prompt injection skill covering visual styles, color tokens, typography pairings, and layout conventions tailored for modern React/Next.js/Tailwind stacks.
* **Maintenance & Community:** Highly active, popular design reference.
* **License:** MIT / Open resource.
* **Dependencies & Compatibility:** Plain markdown/json datasets. Zero runtime overhead.
* **Security & Supply Chain:** Zero risk.
* **Value to Project:** Substantial value in Phase 1 for styling the "Cognitive Canvas" and Discovery Lab, preventing generic "AI boilerplate" looks.
* **Classification:** **RECOMMENDED FOR INITIAL WORKFLOW** (UI/UX design system guide).

#### 4. `hotaro6754/ZeroSlop` (and manavmishra/ZeroSlop) & `tasteskill.dev` (Leonxlnx/taste-skill)
* **What it Provides:** Anti-slop prompt constraints and styling rules that eliminate corporate filler, unnecessary code wrappers, redundant comments, and cliché UI patterns.
* **Maintenance & Community:** Active community projects.
* **License:** MIT.
* **Dependencies & Compatibility:** Development-time agent prompt guidelines.
* **Security & Supply Chain:** Zero risk.
* **Value to Project:** High value for LLM prompt engineering within our concept extraction and discovery explanation pipelines, ensuring the system outputs concise, intellectually dense rationales rather than conversational fluff.
* **Classification:** **RECOMMENDED FOR INITIAL WORKFLOW** (Prompt design constraints for LLM pipelines).

#### 5. `msitarzewski/agency-agents`
* **What it Provides:** A large catalog of pre-configured agent personas (e.g., project manager, security auditor, frontend specialist).
* **Maintenance & Community:** Moderate activity.
* **License:** MIT.
* **Dependencies & Compatibility:** Persona prompts.
* **Security & Supply Chain:** Zero risk.
* **Value to Project:** Redundant. While conceptually interesting, managing dozens of disparate personas adds prompt overhead without improving code quality beyond what `get-shit-done` and `superpowers` already enforce.
* **Classification:** **NOT RECOMMENDED** (Redundant with selected workflow tools).

#### 6. `sickn33/antigravity-awesome-skills` (agentic-awesome-skills)
* **What it Provides:** A vast directory of community `SKILL.md` playbooks covering multiple programming languages and external APIs.
* **Maintenance & Community:** High community contribution rate.
* **License:** MIT.
* **Dependencies & Compatibility:** Markdown instruction playbooks.
* **Security & Supply Chain:** Low, but variable quality across individual community contributions.
* **Value to Project:** Useful as an on-demand reference catalog when encountering specific library quirks (e.g., specific Cytoscape or Next.js edge runtime configurations).
* **Classification:** **OPTIONAL ALTERNATIVE** (Reference library for targeted technical lookups).

---

### 2.2 Additional Research, Ingestion, and Scraping Resources

#### 7. `firecrawl/firecrawl`
* **What it Provides:** An open-source web scraping engine and API built specifically for AI and RAG pipelines. Converts complex, JS-rendered web pages and PDFs into clean, token-optimized Markdown, stripped of navbars, ads, and footers. Includes `/scrape`, `/crawl`, and `/map` endpoints.
* **Maintenance & Community:** Exceptionally high activity; backed by an active engineering team and strong open-source community.
* **License:** AGPL-3.0 (Self-hosted core) / Cloud API available.
* **Dependencies & Compatibility:** Node.js, Puppeteer/Playwright, Redis. Can be consumed via official cloud API or self-hosted in a Docker container.
* **Security & Supply Chain:** Secure if using hosted API or properly isolated worker. Protects against SSRF and malicious scripts on target websites.
* **Value to Project:** Essential for the Ingestion Pipeline. Ingesting raw web URLs or research links without a robust scraper produces messy HTML boilerplate that corrupts concept extraction.
* **Classification:** **RECOMMENDED FOR SPECIFIC LATER TASK (Scope B / Ingestion Milestone)** (Primary web and article ingestion engine).

#### 8. `Panniantong/Agent-Reach`
* **What it Provides:** An agent skill / CLI tool for scraping public social platforms (Twitter/X, Reddit, YouTube transcripts, Bilibili) without paid API keys.
* **Maintenance & Community:** Active community project.
* **License:** Apache-2.0 / MIT.
* **Dependencies & Compatibility:** Python, lightweight headless scrapers.
* **Security & Supply Chain:** High maintenance fragility; scrapers break whenever target social platforms update their frontends. Potential IP-blocking risk on residential/server IPs.
* **Value to Project:** Outside primary core scope. Web of Thoughts is focused on deep research, academic papers, books, notes, and technical specs, not social media scraping.
* **Classification:** **NOT RECOMMENDED** (High maintenance fragility; misaligned with core scholarly/strategic use cases).

#### 9. `ssssssss-team/spider-flow`
* **What it Provides:** A Java-based visual drag-and-drop web scraping platform with SQL execution, XPath, and flowcharts.
* **Maintenance & Community:** Low/stagnant recent maintenance; legacy Java/Spring Boot architecture.
* **License:** Apache-2.0.
* **Dependencies & Compatibility:** Java, Spring Boot, MySQL. Severely incompatible with our TypeScript / Next.js / Node.js development stack.
* **Security & Supply Chain:** High complexity; introduces an entire secondary backend runtime for minimal benefit.
* **Value to Project:** Very poor. We require lightweight programmatic scraping in TypeScript/Node, not a heavyweight Java UI.
* **Classification:** **NOT RECOMMENDED** (Incompatible technology stack and high architectural overhead).

#### 10. `x1xhlol/system-prompts-and-models-of-ai-tools`
* **What it Provides:** Leaked system prompts and internal tool definitions from major commercial AI tools (Cursor, Claude, Perplexity, v0).
* **Maintenance & Community:** Maintained as an archival reference.
* **License:** Unlicensed / Public repository.
* **Dependencies & Compatibility:** Text documentation only.
* **Security & Supply Chain:** Zero runtime risk.
* **Value to Project:** High educational value for reverse-engineering how premier AI tools enforce source grounding, citation formats, and tool-calling discipline.
* **Classification:** **USEFUL FOR A SPECIFIC TASK (Prompt Engineering Milestone)** (Reference material for prompt architecture).

---

## 3. Final Open-Source Selection & Classification Summary

| Candidate Repository / Tool | Purpose in Project | Final Classification | Rationale |
| :--- | :--- | :---: | :--- |
| **`gsd-build/get-shit-done`** | Phase management & context control | **RECOMMENDED (Initial Workflow)** | Eliminates agent context drift and enforces strict milestone delivery. |
| **`obra/superpowers`** | TDD & verification discipline | **RECOMMENDED (Initial Workflow)** | Ensures discovery algorithms and graph schemas have automated tests. |
| **`ui-ux-pro-max-skill`** | Visual tokens & UI design | **RECOMMENDED (Initial Workflow)** | Prevents generic AI look; enforces cohesive dark-mode aesthetic. |
| **`tasteskill.dev` / `ZeroSlop`** | Anti-slop prompt engineering | **RECOMMENDED (Initial Workflow)** | Guarantees discovery explanations are crisp, technical, and non-generic. |
| **`x1xhlol/system-prompts`** | Prompt design reference | **USEFUL (Prompt Milestone)** | Provides real-world patterns for citation anchoring and tool-calling. |
| **`firecrawl/firecrawl`** | Web & PDF document ingestion | **RECOMMENDED (Scope B / Milestone 5)**| Gold standard for turning dirty web pages into clean, token-efficient Markdown. |
| **`antigravity-awesome-skills`** | Community skill lookup | **OPTIONAL ALTERNATIVE** | Secondary reference for specific integration playbooks. |
| **`agency-agents`** | Role-playing agent personas | **NOT RECOMMENDED** | Unnecessary prompt overhead; redundant with GSD framework. |
| **`Panniantong/Agent-Reach`** | Social media scraping | **NOT RECOMMENDED** | High fragility and misaligned with deep technical/scientific research. |
| **`ssssssss-team/spider-flow`** | Visual Java web crawler | **NOT RECOMMENDED** | Heavyweight Java runtime incompatible with Next.js/TypeScript stack. |
