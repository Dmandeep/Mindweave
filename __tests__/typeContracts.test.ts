import { describe, it, expect } from 'vitest';
import type {
  Source,
  Concept,
  Relationship,
  DiscoveryCandidate,
  Investigation,
  EvidenceRecord,
  KnowledgeRevision,
  RelationshipType,
  RelationshipStatus,
  DiscoveryType,
  DiscoveryStatus,
  InvestigationStage,
  InvestigationOutcome,
} from '../types/knowledge';
import type {
  SafetyDecision,
  SafetyCategory,
  SafetyAssessment,
  AssessmentMethod,
} from '../types/safety';

describe('TypeScript Type Contracts', () => {
  it('Source interface satisfies required fields', () => {
    const src: Source = {
      id: 'src-1',
      userId: 'user-1',
      title: 'Test Source',
      sourceType: 'text',
      content: 'Hello world',
      contentHash: 'abc123',
      createdAt: new Date().toISOString(),
    };

    expect(src.id).toBe('src-1');
    expect(src.sourceType).toBe('text');
    expect(['text', 'markdown', 'pdf', 'url']).toContain(src.sourceType);
  });

  it('Concept interface satisfies required fields', () => {
    const concept: Concept = {
      id: 'c-1',
      userId: 'user-1',
      canonicalName: 'Test',
      aliases: ['alias1'],
      description: 'desc',
      domainCategory: 'General',
      createdAt: new Date().toISOString(),
    };

    expect(concept.canonicalName).toBe('Test');
    expect(concept.aliases).toEqual(['alias1']);
  });

  it('Relationship interface enforces valid types and status', () => {
    const rel: Relationship = {
      id: 'r-1',
      userId: 'user-1',
      sourceConceptId: 'c-1',
      targetConceptId: 'c-2',
      relationshipType: 'causes',
      directional: true,
      confidenceScore: 0.85,
      status: 'proposed',
      rationale: 'test',
      createdAt: new Date().toISOString(),
    };

    const validTypes: RelationshipType[] = [
      'causes', 'contradicts', 'analogous_to', 'enables',
      'depends_on', 'inhibits', 'is_a', 'associated_with',
    ];
    const validStatuses: RelationshipStatus[] = [
      'proposed', 'accepted', 'rejected', 'disputed', 'superseded',
    ];

    expect(validTypes).toContain(rel.relationshipType);
    expect(validStatuses).toContain(rel.status);
    expect(rel.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(rel.confidenceScore).toBeLessThanOrEqual(1);
  });

  it('DiscoveryCandidate interface enforces score bounds', () => {
    const disc: DiscoveryCandidate = {
      id: 'disc-1',
      userId: 'user-1',
      conceptAId: 'c-1',
      conceptBId: 'c-2',
      conceptAName: 'A',
      conceptBName: 'B',
      conceptADomain: 'D1',
      conceptBDomain: 'D2',
      discoveryType: 'cross_domain_analogy',
      proposedRelationship: 'analogous_to',
      explanation: 'test',
      noveltyScore: 0.75,
      plausibilityScore: 0.65,
      compositeScore: 0.69,
      status: 'unread',
      createdAt: new Date().toISOString(),
    };

    const validTypes: DiscoveryType[] = [
      'cross_domain_analogy', 'structural_hole_bridge',
      'latent_contradiction', 'knowledge_gap',
    ];
    const validStatuses: DiscoveryStatus[] = ['unread', 'pinned', 'investigating', 'dismissed'];

    expect(validTypes).toContain(disc.discoveryType);
    expect(validStatuses).toContain(disc.status);
    expect(disc.noveltyScore).toBeGreaterThanOrEqual(0);
    expect(disc.noveltyScore).toBeLessThanOrEqual(1);
  });

  it('SafetyAssessment interface enforces valid decisions and categories', () => {
    const assessment: SafetyAssessment = {
      id: 'sa-1',
      userId: 'user-1',
      targetEntityType: 'source',
      targetEntityId: 'src-1',
      policyVersion: 'v1.0',
      decision: 'ALLOW',
      category: 'benign',
      rationaleSummary: 'Safe content.',
      assessmentMethod: 'deterministic_rule',
      createdAt: new Date().toISOString(),
    };

    const validDecisions: SafetyDecision[] = [
      'ALLOW', 'ALLOW_WITH_LIMITS', 'CLARIFY',
      'REFUSE_AND_REDIRECT', 'BLOCK_SPECIFIC_OPERATION',
    ];
    const validCategories: SafetyCategory[] = [
      'benign', 'cybersecurity_defensive', 'cybersecurity_offensive',
      'cbrn', 'harmful_action', 'dual_use_research', 'ambiguous',
    ];
    const validMethods: AssessmentMethod[] = [
      'deterministic_rule', 'llm_classifier', 'fallback_default',
    ];

    expect(validDecisions).toContain(assessment.decision);
    expect(validCategories).toContain(assessment.category);
    expect(validMethods).toContain(assessment.assessmentMethod);
  });

  it('Investigation interface enforces valid stages and outcomes', () => {
    const stages: InvestigationStage[] = [
      'hypothesis', 'design', 'execution', 'evaluation', 'completed',
    ];
    const outcomes: InvestigationOutcome[] = [
      'supported', 'partially_supported', 'refuted', 'inconclusive', 'not_completed',
    ];

    expect(stages.length).toBe(5);
    expect(outcomes.length).toBe(5);
  });
});
