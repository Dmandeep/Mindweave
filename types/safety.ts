export type SafetyDecision = 
  | 'ALLOW' 
  | 'RESTRICT'
  | 'ALLOW_WITH_LIMITS' 
  | 'REVIEW_REQUIRED'
  | 'CLARIFY' 
  | 'REFUSE_AND_REDIRECT' 
  | 'BLOCK_SPECIFIC_OPERATION';

export type CanonicalSafetyDecision = 
  | 'ALLOW' 
  | 'RESTRICT' 
  | 'REFUSE_AND_REDIRECT' 
  | 'REVIEW_REQUIRED' 
  | 'BLOCK_SPECIFIC_OPERATION';

export function toCanonicalDecision(decision?: string | null): CanonicalSafetyDecision {
  if (!decision) return 'REVIEW_REQUIRED';
  const upper = decision.toUpperCase().trim();
  if (upper === 'ALLOW') return 'ALLOW';
  if (upper === 'RESTRICT' || upper === 'ALLOW_WITH_LIMITS') return 'RESTRICT';
  if (upper === 'REFUSE_AND_REDIRECT' || upper === 'REFUSE') return 'REFUSE_AND_REDIRECT';
  if (upper === 'REVIEW_REQUIRED' || upper === 'CLARIFY') return 'REVIEW_REQUIRED';
  if (upper === 'BLOCK_SPECIFIC_OPERATION' || upper === 'BLOCK') return 'BLOCK_SPECIFIC_OPERATION';
  return 'REVIEW_REQUIRED';
}

export type SafetyCategory = 
  | 'benign' 
  | 'cybersecurity_defensive' 
  | 'cybersecurity_offensive' 
  | 'cbrn' 
  | 'harmful_action' 
  | 'dual_use_research' 
  | 'ambiguous';

export type AssessmentMethod = 
  | 'deterministic_rule' 
  | 'llm_classifier' 
  | 'fallback_default';

export interface SafetyAssessment {
  id: string;
  userId: string;
  targetEntityType: 'source' | 'concept' | 'discovery' | 'investigation' | 'experiment';
  targetEntityId: string;
  policyVersion: string;
  decision: SafetyDecision;
  category: SafetyCategory;
  rationaleSummary: string;
  permittedScope?: string;
  safeAlternative?: string;
  assessmentMethod: AssessmentMethod;
  createdAt: string;
}

export interface SafetyAuditLog {
  id: string;
  timestamp: string;
  assessment: SafetyAssessment;
  inputExcerpt: string;
  userOverridden?: boolean;
}
