import { describe, it, expect, beforeEach } from 'vitest';
import { useKnowledgeStore } from '../stores/knowledgeStore';

describe('Phase 3: Discovery Lab Workflow & Epistemic Reconciliation', () => {
  beforeEach(() => {
    // Reset store state
    useKnowledgeStore.setState({
      investigations: [],
      revisions: [],
      relationships: [],
      discoveryCandidates: [
        {
          id: 'disc-test-bridge',
          userId: 'user-default',
          conceptAId: 'c-1',
          conceptBId: 'c-2',
          conceptAName: 'Quorum Leases',
          conceptBName: 'Pheromone Evaporation',
          conceptADomain: 'Distributed Systems',
          conceptBDomain: 'Evolutionary Biology',
          discoveryType: 'cross_domain_analogy',
          proposedRelationship: 'analogous_to',
          explanation: 'Both rely on passive temporal expiration.',
          noveltyScore: 0.85,
          plausibilityScore: 0.90,
          compositeScore: 0.88,
          status: 'unread',
          safetyDecision: 'ALLOW',
          createdAt: new Date().toISOString(),
        },
      ],
    });
  });

  it('promotes a discovery candidate to an active investigation', () => {
    const store = useKnowledgeStore.getState();
    const invId = store.promoteDiscoveryToLab('disc-test-bridge');

    const updated = useKnowledgeStore.getState();
    expect(invId).toBeDefined();
    expect(updated.investigations.length).toBe(1);
    expect(updated.investigations[0].id).toBe(invId);
    expect(updated.investigations[0].discoveryId).toBe('disc-test-bridge');
    expect(updated.activeInvestigationId).toBe(invId);
    expect(updated.viewMode).toBe('lab');

    // Candidate status changes to 'investigating'
    const candidate = updated.discoveryCandidates.find((d) => d.id === 'disc-test-bridge');
    expect(candidate?.status).toBe('investigating');
  });

  it('updates hypothesis statement and foundational assumptions', () => {
    const store = useKnowledgeStore.getState();
    const invId = store.promoteDiscoveryToLab('disc-test-bridge');

    const newStatement = 'If lease decay is calibrated to physical clock skew, split-brain states are prevented.';
    const newAssumptions = [
      'Clock drift bounded < 50ms',
      'Network partition resolves within TTL window',
    ];

    useKnowledgeStore.getState().updateHypothesis(invId, newStatement, newAssumptions);

    const updated = useKnowledgeStore.getState().investigations.find((i) => i.id === invId);
    expect(updated?.hypothesisStatement).toBe(newStatement);
    expect(updated?.assumptions).toEqual(newAssumptions);
  });

  it('updates experiment plan with methodology and quantitative success criteria', () => {
    const store = useKnowledgeStore.getState();
    const invId = store.promoteDiscoveryToLab('disc-test-bridge');

    const criteria = [
      { id: 'c-1', metricName: 'Split-Brain Inconsistency', targetThreshold: '0.00%', operator: 'equals' as const },
      { id: 'c-2', metricName: 'Read Stale Rate', targetThreshold: '0.01%', operator: 'lte' as const },
    ];

    useKnowledgeStore.getState().updateExperimentPlan(
      invId,
      'Clock Jitter Fault Injection Protocol',
      'Inject 100ms artificial clock skew during concurrent write bursts.',
      criteria
    );

    const updated = useKnowledgeStore.getState().investigations.find((i) => i.id === invId);
    expect(updated?.experimentPlan.title).toBe('Clock Jitter Fault Injection Protocol');
    expect(updated?.experimentPlan.successCriteria.length).toBe(2);
    expect(updated?.experimentPlan.successCriteria[0].metricName).toBe('Split-Brain Inconsistency');
  });

  it('records empirical telemetry and observations log', () => {
    const store = useKnowledgeStore.getState();
    const invId = store.promoteDiscoveryToLab('disc-test-bridge');

    useKnowledgeStore.getState().recordObservation(invId, 'Iteration 1: Zero anomalies measured under 20ms drift.');
    useKnowledgeStore.getState().recordObservation(invId, 'Iteration 2: Stale read rate 0.00% under partition.');

    const updated = useKnowledgeStore.getState().investigations.find((i) => i.id === invId);
    expect(updated?.experimentPlan.observations).toContain('Iteration 2');
  });

  it('reconciles outcome as SUPPORTED: promotes edge to accepted in Knowledge Graph and writes audit revision', () => {
    const store = useKnowledgeStore.getState();
    const invId = store.promoteDiscoveryToLab('disc-test-bridge');

    useKnowledgeStore.getState().reconcileInvestigationOutcome(invId, 'supported');

    const finalState = useKnowledgeStore.getState();
    const inv = finalState.investigations.find((i) => i.id === invId);
    expect(inv?.stage).toBe('completed');
    expect(inv?.experimentPlan.outcome).toBe('supported');

    // New relationship created in graph with accepted status
    const rel = finalState.relationships.find((r) => r.sourceConceptId === 'c-1' && r.targetConceptId === 'c-2');
    expect(rel).toBeDefined();
    expect(rel?.status).toBe('accepted');
    expect(rel?.confidenceScore).toBe(0.88);

    // Knowledge revision logged
    expect(finalState.revisions.length).toBeGreaterThan(0);
    expect(finalState.revisions[0].reason).toContain('SUPPORTED');
  });

  it('reconciles outcome as REFUTED: updates status to rejected and writes audit revision without deleting concepts', () => {
    const store = useKnowledgeStore.getState();
    const invId = store.promoteDiscoveryToLab('disc-test-bridge');

    useKnowledgeStore.getState().reconcileInvestigationOutcome(invId, 'refuted');

    const finalState = useKnowledgeStore.getState();
    const inv = finalState.investigations.find((i) => i.id === invId);
    expect(inv?.stage).toBe('completed');
    expect(inv?.experimentPlan.outcome).toBe('refuted');

    const rel = finalState.relationships.find((r) => r.sourceConceptId === 'c-1' && r.targetConceptId === 'c-2');
    expect(rel?.status).toBe('rejected');
    expect(rel?.confidenceScore).toBe(0.15);

    expect(finalState.revisions[0].reason).toContain('REFUTED');
  });
});
