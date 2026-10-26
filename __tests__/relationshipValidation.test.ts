import { describe, it, expect } from 'vitest';
import { useKnowledgeStore } from '@/stores/knowledgeStore';

describe('MindWeave — Relationship Mutation & Topology Invariants', () => {
  it('prohibits self-referential relationship loops', () => {
    const store = useKnowledgeStore.getState();
    const result = store.createRelationship({
      sourceConceptId: 'c-raft-leases',
      targetConceptId: 'c-raft-leases',
      relationshipType: 'enables',
      rationale: 'Invalid self-loop',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Self-referential loops are prohibited');
  });

  it('prohibits duplicate identical relationships', () => {
    const store = useKnowledgeStore.getState();
    // c-raft-leases -> c-split-brain (inhibits) is an initial relationship
    const result = store.createRelationship({
      sourceConceptId: 'c-raft-leases',
      targetConceptId: 'c-split-brain',
      relationshipType: 'inhibits',
      rationale: 'Duplicate edge attempt',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('identical relationship already exists');
  });

  it('allows establishing valid novel relationships between distinct concepts', () => {
    const store = useKnowledgeStore.getState();
    const result = store.createRelationship({
      sourceConceptId: 'c-solid-state-battery',
      targetConceptId: 'c-decay-rates',
      relationshipType: 'analogous_to',
      rationale: 'Electrolyte interface impedance decay mirrors stigmergic decay mechanics.',
      confidenceScore: 0.82,
    });

    expect(result.success).toBe(true);
    expect(result.relationship).toBeDefined();
    expect(result.relationship?.relationshipType).toBe('analogous_to');

    // Revision logged
    const rev = useKnowledgeStore.getState().revisions.find((r) => r.entityId === result.relationship?.id);
    expect(rev).toBeDefined();
  });

  it('deletes an existing relationship and records an audit revision', () => {
    const store = useKnowledgeStore.getState();
    // Create a temporary relationship
    const res = store.createRelationship({
      sourceConceptId: 'c-gut-butyrate',
      targetConceptId: 'c-solid-state-battery',
      relationshipType: 'associated_with',
      rationale: 'Cross-domain test link',
    });
    expect(res.success).toBe(true);
    const relId = res.relationship!.id;

    store.deleteRelationship(relId);

    const postState = useKnowledgeStore.getState();
    expect(postState.relationships.some((r) => r.id === relId)).toBe(false);

    const delRev = postState.revisions.find((r) => r.entityId === relId && r.reason.includes('Manual relationship removal'));
    expect(delRev).toBeDefined();
  });
});
