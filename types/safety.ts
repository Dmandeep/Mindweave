export type SafetyDecision = 
  | 'ALLOW' 
  | 'ALLOW_WITH_LIMITS' 
  | 'CLARIFY' 
  | 'REFUSE_AND_REDIRECT' 
  | 'BLOCK_SPECIFIC_OPERATION';

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
