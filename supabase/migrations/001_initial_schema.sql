-- Web of Thoughts: Initial Database Schema Migration
-- Compatible with Supabase PostgreSQL 16 + pgvector

-- Enable UUID extension and pgvector
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

--------------------------------------------------------------------------------
-- 1. RAW INGESTION & DOCUMENT PROVENANCE
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    source_type TEXT NOT NULL CHECK (source_type IN ('text', 'markdown', 'pdf', 'url')),
    raw_content TEXT NOT NULL,
    content_hash CHAR(64) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_sources_user_created ON public.sources(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sources_hash ON public.sources(user_id, content_hash);

CREATE TABLE IF NOT EXISTS public.source_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_id UUID NOT NULL REFERENCES public.sources(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    chunk_text TEXT NOT NULL,
    start_char INT NOT NULL,
    end_char INT NOT NULL,
    embedding vector(1536),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_chunks_source ON public.source_chunks(source_id, chunk_index);
CREATE INDEX IF NOT EXISTS idx_chunks_embedding ON public.source_chunks USING hnsw (embedding vector_cosine_ops);

--------------------------------------------------------------------------------
-- 2. CONCEPTS & REIFIED RELATIONSHIPS (Knowledge Graph)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.concepts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    canonical_name TEXT NOT NULL,
    aliases TEXT[] DEFAULT ARRAY[]::TEXT[],
    description TEXT,
    domain_category TEXT NOT NULL DEFAULT 'General',
    embedding vector(1536),
    color TEXT DEFAULT '#8B5CF6',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT uq_user_concept UNIQUE (user_id, canonical_name)
);

CREATE INDEX IF NOT EXISTS idx_concepts_user_domain ON public.concepts(user_id, domain_category);
CREATE INDEX IF NOT EXISTS idx_concepts_embedding ON public.concepts USING hnsw (embedding vector_cosine_ops);

CREATE TABLE IF NOT EXISTS public.relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    source_concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    target_concept_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN (
        'causes', 'contradicts', 'analogous_to', 'enables', 'depends_on', 'inhibits', 'is_a', 'associated_with'
    )),
    directional BOOLEAN NOT NULL DEFAULT TRUE,
    confidence_score NUMERIC(3,2) NOT NULL DEFAULT 0.75 CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
    status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN (
        'proposed', 'accepted', 'rejected', 'disputed', 'superseded'
    )),
    rationale TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    CONSTRAINT chk_no_self_edges CHECK (source_concept_id != target_concept_id)
);

CREATE INDEX IF NOT EXISTS idx_rel_user_concepts ON public.relationships(user_id, source_concept_id, target_concept_id);
CREATE INDEX IF NOT EXISTS idx_rel_status ON public.relationships(user_id, status);

CREATE TABLE IF NOT EXISTS public.evidence_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE,
    source_chunk_id UUID NOT NULL REFERENCES public.source_chunks(id) ON DELETE CASCADE,
    verbatim_quote TEXT NOT NULL,
    stance TEXT NOT NULL CHECK (stance IN ('supports', 'refutes', 'neutral')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_evidence_rel ON public.evidence_records(relationship_id);

--------------------------------------------------------------------------------
-- 3. AUTONOMOUS DISCOVERY & DISCOVERY LAB (Investigation Workflow)
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.discovery_candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    concept_a_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    concept_b_id UUID NOT NULL REFERENCES public.concepts(id) ON DELETE CASCADE,
    discovery_type TEXT NOT NULL CHECK (discovery_type IN (
        'cross_domain_analogy', 'structural_hole_bridge', 'latent_contradiction', 'knowledge_gap'
    )),
    proposed_relationship TEXT NOT NULL,
    explanation TEXT NOT NULL,
    novelty_score NUMERIC(3,2) NOT NULL CHECK (novelty_score >= 0.0 AND novelty_score <= 1.0),
    plausibility_score NUMERIC(3,2) NOT NULL CHECK (plausibility_score >= 0.0 AND plausibility_score <= 1.0),
    composite_score NUMERIC(3,2) NOT NULL CHECK (composite_score >= 0.0 AND composite_score <= 1.0),
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN (
        'unread', 'pinned', 'investigating', 'dismissed'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE INDEX IF NOT EXISTS idx_disc_user_composite ON public.discovery_candidates(user_id, status, composite_score DESC);

CREATE TABLE IF NOT EXISTS public.investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    discovery_id UUID REFERENCES public.discovery_candidates(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    summary TEXT,
    stage TEXT NOT NULL DEFAULT 'hypothesis' CHECK (stage IN (
        'hypothesis', 'design', 'execution', 'evaluation', 'completed'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.hypotheses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    statement TEXT NOT NULL,
    assumptions TEXT[] DEFAULT ARRAY[]::TEXT[],
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'validated', 'falsified', 'inconclusive'
    )),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.experiment_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hypothesis_id UUID NOT NULL REFERENCES public.hypotheses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    methodology TEXT NOT NULL,
    success_criteria JSONB NOT NULL DEFAULT '[]'::jsonb,
    observations TEXT,
    outcome TEXT CHECK (outcome IN ('supported', 'refuted', 'inconclusive')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS public.knowledge_revisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('concept', 'relationship', 'hypothesis')),
    entity_id UUID NOT NULL,
    previous_state JSONB NOT NULL,
    new_state JSONB NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- 4. SAFETY & POLICY ASSESSMENTS
--------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.safety_assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    target_entity_type TEXT NOT NULL CHECK (target_entity_type IN ('source', 'concept', 'discovery', 'investigation', 'experiment')),
    target_entity_id UUID NOT NULL,
    policy_version TEXT NOT NULL DEFAULT 'v1.0',
    decision TEXT NOT NULL CHECK (decision IN ('ALLOW', 'ALLOW_WITH_LIMITS', 'CLARIFY', 'REFUSE_AND_REDIRECT', 'BLOCK_SPECIFIC_OPERATION')),
    category TEXT NOT NULL CHECK (category IN ('benign', 'cybersecurity_defensive', 'cybersecurity_offensive', 'cbrn', 'harmful_action', 'dual_use_research', 'ambiguous')),
    rationale_summary TEXT NOT NULL,
    permitted_scope TEXT,
    assessment_method TEXT NOT NULL CHECK (assessment_method IN ('deterministic_rule', 'llm_classifier', 'fallback_default')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

--------------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY (RLS) POLICIES
--------------------------------------------------------------------------------
ALTER TABLE public.sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.source_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.concepts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discovery_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hypotheses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_assessments ENABLE ROW LEVEL SECURITY;
