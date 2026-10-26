export type RelationshipType = 
  | 'causes' 
  | 'contradicts' 
  | 'analogous_to' 
  | 'enables' 
  | 'depends_on' 
  | 'inhibits' 
  | 'is_a' 
  | 'associated_with';

export type RelationshipStatus = 
  | 'proposed' 
  | 'accepted' 
  | 'rejected' 
  | 'disputed' 
  | 'superseded';

export type DiscoveryType = 
  | 'cross_domain_analogy' 
  | 'structural_hole_bridge' 
  | 'latent_contradiction' 
  | 'knowledge_gap'
  | 'research_question';

export type ProvenanceType = 
  | 'OBSERVED' 
  | 'CALCULATED' 
  | 'EXTERNAL' 
  | 'INFERRED' 
  | 'HYPOTHESIS';

export type DiscoveryStatus = 
  | 'unread' 
  | 'pinned' 
  | 'investigating' 
  | 'dismissed';

export type InvestigationStage = 
  | 'hypothesis' 
  | 'design' 
  | 'execution' 
  | 'evaluation' 
  | 'completed';

export type InvestigationOutcome = 
  | 'supported' 
  | 'refuted' 
  | 'inconclusive';

export interface Source {
  id: string;
  userId: string;
  title: string;
  sourceType: 'text' | 'markdown' | 'pdf' | 'url';
  content: string;
  contentHash: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface Concept {
  id: string;
  userId: string;
  canonicalName: string;
  aliases: string[];
  description: string;
  domainCategory: string;
  color?: string;
  embedding?: number[];
  createdAt: string;
}

export interface Relationship {
  id: string;
  userId: string;
  sourceConceptId: string;
  targetConceptId: string;
  relationshipType: RelationshipType;
  directional: boolean;
  confidenceScore: number;
  status: RelationshipStatus;
  rationale: string;
  createdAt: string;
}

export interface EvidenceRecord {
  id: string;
  userId: string;
  relationshipId?: string;
  hypothesisId?: string;
  sourceId: string;
  sourceTitle: string;
  verbatimQuote: string;
  startChar: number;
  endChar: number;
  stance: 'supports' | 'refutes' | 'neutral';
  createdAt: string;
}

export interface StructuredExplanation {
  summary: string;
  mechanism: string;
  whyItMatters: string;
  whatSupportsIt: string[];
  uncertainty: string;
  investigationAngle: string;
  falsificationCondition: string;
}

export interface DiscoveryCandidate {
  id: string;
  userId: string;
  dedupKey?: string;
  conceptAId: string;
  conceptBId: string;
  conceptAName: string;
  conceptBName: string;
  conceptADomain: string;
  conceptBDomain: string;
  discoveryType: DiscoveryType;
  proposedRelationship: RelationshipType;
  provenanceType?: ProvenanceType;
  discoveryMethod?: 'deterministic_topology' | 'goldilocks_semantic' | 'llm_reasoner';
  explanation: string;
  whyItMatters?: string;
  uncertainty?: string;
  investigationAngle?: string;
  structuredExplanation?: StructuredExplanation;
  safetyDecision?: 'ALLOW' | 'ALLOW_WITH_LIMITS' | 'CLARIFY' | 'REFUSE_AND_REDIRECT' | 'BLOCK_SPECIFIC_OPERATION';
  noveltyScore: number;
  plausibilityScore: number;
  compositeScore: number;
  status: DiscoveryStatus;
  dismissedReason?: string;
  evidenceQuotes?: {
    sourceId: string;
    sourceTitle: string;
    quote: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface SuccessCriterion {
  id: string;
  metricName: string;
  targetThreshold: string;
  operator: 'gte' | 'lte' | 'equals' | 'contains';
}

export interface ExperimentPlan {
  id: string;
  title: string;
  methodology: string;
  successCriteria: SuccessCriterion[];
  observations?: string;
  outcome?: InvestigationOutcome;
  completedAt?: string;
}

export interface Investigation {
  id: string;
  userId: string;
  discoveryId?: string;
  title: string;
  summary: string;
  stage: InvestigationStage;
  hypothesisStatement: string;
  assumptions: string[];
  experimentPlan: ExperimentPlan;
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeRevision {
  id: string;
  userId: string;
  entityType: 'concept' | 'relationship' | 'hypothesis';
  entityId: string;
  previousState: any;
  newState: any;
  reason: string;
  timestamp: string;
}
