import { describe, it, expect, beforeEach } from 'vitest';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { AutonomousDiscoveryEngine } from '@/lib/discovery/discoveryEngine';

describe('MindWeave — Complete 12-Step End-to-End User Journey Audit', () => {
  let mockStorage: Record<string, string> = {};

  beforeEach(() => {
    mockStorage = {};
  });

  it('executes the complete 12-step user workflow with epistemic reconciliation and persistence', async () => {
    // -------------------------------------------------------------
    // STEP 1: Create or access an authorized workspace
    // -------------------------------------------------------------
    const store = useKnowledgeStore.getState();
    const newWs = store.createWorkspace(
      'Synthetic Biology & Cybernetics',
      'Investigating closed-loop genetic control systems',
      ['Synthetic Biology', 'Cybernetics', 'Systems Theory']
    );
    expect(newWs).toBeDefined();
    expect(newWs.id).toBeDefined();
    expect(useKnowledgeStore.getState().currentWorkspaceId).toBe(newWs.id);

    // -------------------------------------------------------------
    // STEP 2: Create several ideas / concepts
    // -------------------------------------------------------------
    const conceptA = store.createConcept({
      canonicalName: 'Genetic Toggle Switch',
      description: 'Bistable gene-regulatory network engineered from mutually inhibitory transcriptional repressors.',
      domainCategory: 'Synthetic Biology',
      tags: ['bistability', 'transcription', 'circuits'],
    });

    const conceptB = store.createConcept({
      canonicalName: 'Feedback Shift Register',
      description: 'Sequential digital logic circuit generating pseudorandom state sequences via linear feedback.',
      domainCategory: 'Cybernetics',
      tags: ['logic', 'linear-feedback', 'sequential-circuit'],
    });

    const conceptToDiscard = store.createConcept({
      canonicalName: 'Ephemeral Draft Idea',
      description: 'Temporary sketch meant for deletion testing.',
      domainCategory: 'Scratchpad',
    });

    expect(conceptA.id).toBeDefined();
    expect(conceptB.id).toBeDefined();
    expect(conceptToDiscard.id).toBeDefined();
    expect(useKnowledgeStore.getState().concepts.some((c) => c.id === conceptA.id)).toBe(true);
    expect(useKnowledgeStore.getState().concepts.some((c) => c.id === conceptB.id)).toBe(true);
    expect(useKnowledgeStore.getState().concepts.some((c) => c.id === conceptToDiscard.id)).toBe(true);

    // -------------------------------------------------------------
    // STEP 3: Edit and delete an idea
    // -------------------------------------------------------------
    store.updateConcept(conceptA.id, {
      description: 'Engineered bistable transcriptional network demonstrating hysteretic switching behavior.',
    });
    const editedConceptA = useKnowledgeStore.getState().concepts.find((c) => c.id === conceptA.id);
    expect(editedConceptA?.description).toContain('hysteretic switching');

    // Delete ephemeral concept
    store.deleteConcept(conceptToDiscard.id);
    expect(useKnowledgeStore.getState().concepts.some((c) => c.id === conceptToDiscard.id)).toBe(false);

    // -------------------------------------------------------------
    // STEP 4: Create and inspect relationships between ideas
    // -------------------------------------------------------------
    const initialRelRes = store.createRelationship({
      sourceConceptId: conceptA.id,
      targetConceptId: conceptB.id,
      relationshipType: 'analogous_to',
      rationale: 'Both systems implement discrete state transitions via feedback loop topology.',
      confidenceScore: 0.84,
    });
    expect(initialRelRes.success).toBe(true);
    expect(initialRelRes.relationship).toBeDefined();

    // Inspect relationship
    const foundRel = useKnowledgeStore.getState().relationships.find((r) => r.id === initialRelRes.relationship?.id);
    expect(foundRel).toBeDefined();
    expect(foundRel?.relationshipType).toBe('analogous_to');
    expect(foundRel?.confidenceScore).toBe(0.84);

    // -------------------------------------------------------------
    // STEP 5: Reload the application and verify persistence
    // -------------------------------------------------------------
    // Simulate export/persist state snapshot
    const exportedJson = store.exportKnowledgeSpace('json');
    const parsedSnapshot = JSON.parse(exportedJson);
    expect(parsedSnapshot.concepts.some((c: any) => c.id === conceptA.id)).toBe(true);
    expect(parsedSnapshot.relationships.some((r: any) => r.id === initialRelRes.relationship?.id)).toBe(true);
    expect(parsedSnapshot.concepts.some((c: any) => c.id === conceptToDiscard.id)).toBe(false);

    // -------------------------------------------------------------
    // STEP 6: Generate a discovery using the actual implemented discovery pipeline
    // -------------------------------------------------------------
    const conceptC = store.createConcept({
      canonicalName: 'Cellular Quorum Degradation',
      description: 'Enzymatic decay of signaling peptides controlling collective decision boundaries.',
      domainCategory: 'Biochemistry',
    });

    const currentConcepts = useKnowledgeStore.getState().concepts;
    const currentRelationships = useKnowledgeStore.getState().relationships;

    const scanReport = await AutonomousDiscoveryEngine.runDiscoveryScanWithReport(
      currentConcepts,
      currentRelationships,
      useKnowledgeStore.getState().discoveryCandidates,
      useKnowledgeStore.getState().currentUser.id
    );

    expect(scanReport).toBeDefined();
    expect(scanReport.totalScannedPairs).toBeGreaterThan(0);
    expect(Array.isArray(scanReport.candidates)).toBe(true);

    // -------------------------------------------------------------
    // STEP 7: Inspect its rationale, source ideas, and evidence provenance
    // -------------------------------------------------------------
    // Pick the top candidate
    const topCandidate = scanReport.candidates[0];
    expect(topCandidate).toBeDefined();
    expect(topCandidate.conceptAId).toBeDefined();
    expect(topCandidate.conceptBId).toBeDefined();
    expect(topCandidate.explanation).toBeDefined();
    expect(topCandidate.explanation.length).toBeGreaterThan(10);
    expect(topCandidate.noveltyScore).toBeGreaterThanOrEqual(0);
    expect(topCandidate.plausibilityScore).toBeGreaterThanOrEqual(0);
    expect(topCandidate.safetyDecision).toBeDefined();

    // Store candidates in store
    useKnowledgeStore.setState({ discoveryCandidates: scanReport.candidates });

    // -------------------------------------------------------------
    // STEP 8: Create an investigation from the discovery
    // -------------------------------------------------------------
    const investigationId = store.promoteDiscoveryToLab(topCandidate.id);
    expect(investigationId).toBeTruthy();

    const activeInv = useKnowledgeStore.getState().investigations.find((i) => i.id === investigationId);
    expect(activeInv).toBeDefined();
    expect(activeInv?.stage).toBe('hypothesis');

    // -------------------------------------------------------------
    // STEP 9: Define a hypothesis and investigation plan
    // -------------------------------------------------------------
    store.updateHypothesis(
      investigationId,
      'Feedback shift registers and genetic toggle switches exhibit isomorphic phase delay under signal decay.',
      ['Signal degradation is monotonic', 'Binary thresholding is non-leaky']
    );

    store.updateExperimentPlan(
      investigationId,
      'Microfluidic Oscillator vs FPGA Shift Register Benchmark',
      'Inject stochastic temporal perturbations and quantify bit-flip jitter vs chemical state transitions.',
      [
        { metric: 'Phase lag deviation', threshold: '< 5%', expectedValue: '< 5%' },
        { metric: 'Transition stability', threshold: '> 99%', expectedValue: '> 99%' },
      ]
    );

    const updatedInv = useKnowledgeStore.getState().investigations.find((i) => i.id === investigationId);
    expect(updatedInv?.hypothesisStatement).toContain('isomorphic phase delay');
    expect(updatedInv?.assumptions.length).toBe(2);
    expect(updatedInv?.experimentPlan.title).toContain('Microfluidic Oscillator');

    // -------------------------------------------------------------
    // STEP 10: Record observations and an outcome
    // -------------------------------------------------------------
    store.recordObservation(
      investigationId,
      'Observed 3.8% phase lag under chemical degradation; FPGA emulation matches mathematical state equations within 2.1% error margin.'
    );

    // Epistemic reconciliation: Supported outcome
    store.reconcileInvestigationOutcome(investigationId, 'supported');

    const completedInv = useKnowledgeStore.getState().investigations.find((i) => i.id === investigationId);
    expect(completedInv?.stage).toBe('completed');
    expect(completedInv?.experimentPlan.outcome).toBe('supported');

    // -------------------------------------------------------------
    // STEP 11: Verify that the updated knowledge persists
    // -------------------------------------------------------------
    const postReconciliationSnapshot = JSON.parse(store.exportKnowledgeSpace('json'));
    const reconciledInvInSnapshot = postReconciliationSnapshot.investigations.find((i: any) => i.id === investigationId);
    expect(reconciledInvInSnapshot).toBeDefined();
    expect(reconciledInvInSnapshot.experimentPlan.outcome).toBe('supported');
    expect(reconciledInvInSnapshot.stage).toBe('completed');

    // -------------------------------------------------------------
    // STEP 12: Confirm that the resulting graph reflects the actual saved changes
    // -------------------------------------------------------------
    const reconciledRel = useKnowledgeStore
      .getState()
      .relationships.find(
        (r) =>
          r.sourceConceptId === topCandidate.conceptAId &&
          r.targetConceptId === topCandidate.conceptBId
      );

    expect(reconciledRel).toBeDefined();
    expect(reconciledRel?.status).toBe('accepted');
    expect(reconciledRel?.confidenceScore).toBe(0.88);
    expect(reconciledRel?.rationale).toContain('SUPPORTED');

    // Graph revision audit logged
    const latestRevision = useKnowledgeStore.getState().revisions[0];
    expect(latestRevision).toBeDefined();
    expect(latestRevision.reason).toContain('SUPPORTED');
  });
});
