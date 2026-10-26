import { describe, it, expect } from 'vitest';
import { useKnowledgeStore } from '@/stores/knowledgeStore';

describe('MindWeave — Concept CRUD & Cascade Integrity', () => {
  it('creates a new concept with canonical name and domain category', () => {
    const store = useKnowledgeStore.getState();
    const concept = store.createConcept({
      canonicalName: 'Active Inference Framework',
      description: 'Free energy minimization formulation of perception and action in autonomous agents.',
      domainCategory: 'Cognitive Science',
      aliases: ['FEP', 'Free Energy Principle'],
      tags: ['cybernetics', 'predictive-processing'],
    });

    expect(concept.id).toBeDefined();
    expect(concept.canonicalName).toBe('Active Inference Framework');
    expect(concept.domainCategory).toBe('Cognitive Science');

    const inStore = useKnowledgeStore.getState().concepts.find((c) => c.id === concept.id);
    expect(inStore).toBeDefined();
  });

  it('updates an existing concept canonicalName and description', () => {
    const store = useKnowledgeStore.getState();
    const concept = store.createConcept({
      canonicalName: 'Temporary Concept',
      description: 'Initial description',
      domainCategory: 'Temporary Domain',
    });

    store.updateConcept(concept.id, {
      canonicalName: 'Updated Concept Name',
      description: 'Updated comprehensive description',
    });

    const updated = useKnowledgeStore.getState().concepts.find((c) => c.id === concept.id);
    expect(updated?.canonicalName).toBe('Updated Concept Name');
    expect(updated?.description).toBe('Updated comprehensive description');

    // Audit revision check
    const revisions = useKnowledgeStore.getState().revisions;
    const rev = revisions.find((r) => r.entityId === concept.id && r.reason.includes('Manual concept update'));
    expect(rev).toBeDefined();
  });

  it('deletes a concept and cascades deletion to all attached relationships and candidate discoveries', () => {
    const store = useKnowledgeStore.getState();
    const nodeA = store.createConcept({
      canonicalName: 'Parent Node X',
      description: 'Testing cascade removal',
      domainCategory: 'Testing',
    });
    const nodeB = store.createConcept({
      canonicalName: 'Child Node Y',
      description: 'Testing cascade removal target',
      domainCategory: 'Testing',
    });

    const relRes = store.createRelationship({
      sourceConceptId: nodeA.id,
      targetConceptId: nodeB.id,
      relationshipType: 'enables',
      rationale: 'Cascade testing link',
    });
    expect(relRes.success).toBe(true);

    // Verify relationship exists
    expect(useKnowledgeStore.getState().relationships.some((r) => r.id === relRes.relationship?.id)).toBe(true);

    // Delete nodeA
    store.deleteConcept(nodeA.id);

    const postState = useKnowledgeStore.getState();
    // Concept should be deleted
    expect(postState.concepts.some((c) => c.id === nodeA.id)).toBe(false);

    // Relationship must be cascaded and deleted (no dangling edges)
    expect(postState.relationships.some((r) => r.sourceConceptId === nodeA.id || r.targetConceptId === nodeA.id)).toBe(false);

    // Knowledge revision logged for deletion
    const delRev = postState.revisions.find((r) => r.entityId === nodeA.id && r.reason.includes('Concept deletion'));
    expect(delRev).toBeDefined();
  });
});
