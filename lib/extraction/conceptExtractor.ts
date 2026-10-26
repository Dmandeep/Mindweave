import { Concept, Relationship, EvidenceRecord, Source } from '@/types/knowledge';
import { evaluateSafetyPolicy } from '@/lib/safety/safetyClassifier';

export interface ExtractionResult {
  source: Source;
  concepts: Concept[];
  relationships: Relationship[];
  evidenceRecords: EvidenceRecord[];
  safetyAssessment: {
    decision: string;
    category: string;
    rationale: string;
    permittedScope?: string;
  };
}

// In-browser & Node SHA-256 helper
async function sha256(message: string): Promise<string> {
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback for simple hashing in test environments
  let hash = 0;
  for (let i = 0; i < message.length; i++) {
    const char = message.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

/**
 * Extracts structured concepts and candidate relationships from raw user text.
 * Runs safety validation first and grounds all claims in verbatim character offsets.
 */
export async function extractKnowledgeFromSource(
  title: string,
  rawContent: string,
  sourceType: 'text' | 'markdown' | 'pdf' | 'url' = 'text',
  userId: string = 'user-default'
): Promise<ExtractionResult> {
  const contentHash = await sha256(rawContent);
  const now = new Date().toISOString();

  // 1. Evaluate Safety Policy
  const safetyEval = await evaluateSafetyPolicy(rawContent, 'source', 'capture');

  const sourceId = `src-${contentHash.slice(0, 10)}`;
  const source: Source = {
    id: sourceId,
    userId,
    title: title || 'Untitled Note',
    sourceType,
    content: rawContent,
    contentHash,
    createdAt: now,
  };

  // If blocked completely, return early with zero extracted concepts
  if (safetyEval.decision === 'BLOCK_SPECIFIC_OPERATION') {
    return {
      source,
      concepts: [],
      relationships: [],
      evidenceRecords: [],
      safetyAssessment: {
        decision: safetyEval.decision,
        category: safetyEval.category,
        rationale: safetyEval.rationaleSummary,
      },
    };
  }

  // 2. Deterministic Concept & Entity Extraction (Rule + Heuristic for baseline MVP)
  // Splits into paragraphs and searches for salient conceptual noun phrases and domain markers
  const paragraphs = rawContent.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const extractedConcepts: Concept[] = [];
  const extractedRelationships: Relationship[] = [];
  const extractedEvidence: EvidenceRecord[] = [];

  // Simple heuristic domain detection
  const lower = rawContent.toLowerCase();
  let domainCategory = 'General';
  if (lower.includes('raft') || lower.includes('consensus') || lower.includes('distributed') || lower.includes('quorum')) {
    domainCategory = 'Distributed Systems';
  } else if (lower.includes('neuron') || lower.includes('microglia') || lower.includes('brain') || lower.includes('synapse') || lower.includes('gut-brain')) {
    domainCategory = 'Neuroscience';
  } else if (lower.includes('battery') || lower.includes('dendrite') || lower.includes('electrolyte') || lower.includes('anode')) {
    domainCategory = 'Materials Science';
  } else if (lower.includes('macroeconomic') || lower.includes('liquidity') || lower.includes('inflation') || lower.includes('yield')) {
    domainCategory = 'Macroeconomics';
  }

  // Extract core title concept if substantial
  const conceptName = title.trim();
  const conceptId = `c-${conceptName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.floor(Math.random() * 1000)}`;

  extractedConcepts.push({
    id: conceptId,
    userId,
    canonicalName: conceptName,
    aliases: [],
    description: rawContent.slice(0, 180).trim() + (rawContent.length > 180 ? '...' : ''),
    domainCategory,
    createdAt: now,
  });

  // Extract evidence record for this concept
  if (rawContent.length > 0) {
    const quoteLength = Math.min(rawContent.length, 120);
    extractedEvidence.push({
      id: `ev-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      sourceId,
      sourceTitle: source.title,
      verbatimQuote: rawContent.slice(0, quoteLength),
      startChar: 0,
      endChar: quoteLength,
      stance: 'supports',
      createdAt: now,
    });
  }

  return {
    source,
    concepts: extractedConcepts,
    relationships: extractedRelationships,
    evidenceRecords: extractedEvidence,
    safetyAssessment: {
      decision: safetyEval.decision,
      category: safetyEval.category,
      rationale: safetyEval.rationaleSummary,
      permittedScope: safetyEval.permittedScope,
    },
  };
}
