import { describe, it, expect } from 'vitest';
import { AutonomousDiscoveryEngine } from '../lib/discovery/discoveryEngine';
import type { Concept, Relationship, DiscoveryCandidate } from '../types/knowledge';

const makeConcept = (overrides: Partial<Concept>): Concept => ({
  id: 'c-test',
  userId: 'user-default',
  canonicalName: 'Test Concept',
  aliases: [],
  description: 'A test concept description with sufficient length to model genuine semantic knowledge representation.',
  domainCategory: 'General',
  createdAt: new Date().toISOString(),
  ...overrides,
});

describe('AutonomousDiscoveryEngine', () => {
  it('returns empty array when fewer than 2 concepts are provided', () => {
    const result = AutonomousDiscoveryEngine.runDiscoveryScan(
      [makeConcept({ id: 'c-1' })],
      [],
    );
    expect(result).toEqual([]);
  });

  it('returns empty array when given zero concepts', () => {
    const result = AutonomousDiscoveryEngine.runDiscoveryScan([], []);
    expect(result).toEqual([]);
  });

  it('generates discoveries for cross-domain concept pairs without direct edges', () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-raft',
        canonicalName: 'Raft Consensus',
        description: 'Time-bounded leadership authorization mechanism preventing split-brain reads across cluster replicas.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-microglia',
        canonicalName: 'Microglial Pruning',
        description: 'Neuroimmune cells that prune synapses using complement signaling cascades during neural development.',
        domainCategory: 'Neuroscience',
      }),
    ];

    const result = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, []);

    expect(result.length).toBeGreaterThan(0);
    const disc = result[0];
    expect(disc.conceptAId).toBe('c-raft');
    expect(disc.conceptBId).toBe('c-microglia');
    expect(disc.conceptADomain).toBe('Distributed Systems');
    expect(disc.conceptBDomain).toBe('Neuroscience');
    expect(disc.status).toBe('unread');
    expect(disc.noveltyScore).toBeGreaterThanOrEqual(0);
    expect(disc.noveltyScore).toBeLessThanOrEqual(1);
    expect(disc.plausibilityScore).toBeGreaterThanOrEqual(0);
    expect(disc.plausibilityScore).toBeLessThanOrEqual(1);
    expect(disc.compositeScore).toBeGreaterThanOrEqual(0);
    expect(disc.compositeScore).toBeLessThanOrEqual(1);
    expect(disc.explanation.length).toBeGreaterThan(0);
    expect(disc.userId).toBe('user-default');
  });

  it('skips pairs that already have a direct edge', () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-a',
        canonicalName: 'Alpha',
        description: 'First concept about distributed systems consensus.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-b',
        canonicalName: 'Beta',
        description: 'Second concept about neural plasticity in cortex.',
        domainCategory: 'Neuroscience',
      }),
    ];

    const relationships: Relationship[] = [
      {
        id: 'rel-1',
        userId: 'user-default',
        sourceConceptId: 'c-a',
        targetConceptId: 'c-b',
        relationshipType: 'analogous_to',
        directional: true,
        confidenceScore: 0.8,
        status: 'accepted',
        rationale: 'Already connected',
        createdAt: new Date().toISOString(),
      },
    ];

    const result = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, relationships);
    expect(result).toEqual([]);
  });

  it('returns discoveries sorted by composite score descending', () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-1',
        canonicalName: 'Concept A',
        description: 'Distributed consensus with leader leases to prevent split-brain states.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-2',
        canonicalName: 'Concept B',
        description: 'Synaptic pruning mechanisms in developmental neurobiology.',
        domainCategory: 'Neuroscience',
      }),
      makeConcept({
        id: 'c-3',
        canonicalName: 'Concept C',
        description: 'Solid-state battery electrolyte degradation under thermal cycle stress.',
        domainCategory: 'Materials Science',
      }),
    ];

    const result = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, []);

    expect(result.length).toBeGreaterThan(1);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].compositeScore).toBeGreaterThanOrEqual(result[i].compositeScore);
    }
  });

  it('preserves existing candidate status (pinned, investigating) across repeated scans without creating duplicates', () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-ds',
        canonicalName: 'Raft Leases',
        description: 'Leader lease bounds in distributed consensus.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-bio',
        canonicalName: 'Pheromone Evaporation',
        description: 'Temporal decay rates in insect quorum sensing.',
        domainCategory: 'Neuroscience',
      }),
    ];

    // First scan creates discovery
    const firstRun = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, []);
    expect(firstRun.length).toBe(1);

    // User pins the discovery
    const pinnedCandidate: DiscoveryCandidate = {
      ...firstRun[0],
      status: 'pinned',
    };

    // Second scan with existing candidates
    const secondRun = AutonomousDiscoveryEngine.runDiscoveryScan(
      concepts,
      [],
      [pinnedCandidate]
    );

    expect(secondRun.length).toBe(1); // No duplicates!
    expect(secondRun[0].status).toBe('pinned'); // Status preserved!
    expect(secondRun[0].id).toBe(pinnedCandidate.id); // Same ID!
  });

  it('generates 7-part structured explanations with provenance tags', () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-algo',
        canonicalName: 'Stigmergy Quorum',
        description: 'Decentralized scout signaling in collective colonies.',
        domainCategory: 'Neuroscience',
      }),
      makeConcept({
        id: 'c-db',
        canonicalName: 'Raft Monotonic Clocks',
        description: 'Cluster physical clock drift bounds preventing leader split brain.',
        domainCategory: 'Distributed Systems',
      }),
    ];

    const result = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, []);
    expect(result.length).toBeGreaterThan(0);
    const candidate = result[0];

    expect(candidate.structuredExplanation).toBeDefined();
    expect(candidate.structuredExplanation?.mechanism).toBeDefined();
    expect(candidate.structuredExplanation?.whyItMatters).toBeDefined();
    expect(candidate.structuredExplanation?.uncertainty).toBeDefined();
    expect(candidate.structuredExplanation?.investigationAngle).toBeDefined();
    expect(candidate.structuredExplanation?.falsificationCondition).toBeDefined();
    expect(candidate.whyItMatters).toBeDefined();
    expect(['INFERRED', 'HYPOTHESIS', 'OBSERVED', 'CALCULATED']).toContain(candidate.provenanceType);
  });

  it('produces an accurate scan telemetry report in runDiscoveryScanWithReport', async () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-1',
        canonicalName: 'Consensus',
        description: 'Distributed fault tolerant state machines.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-2',
        canonicalName: 'Synapse Pruning',
        description: 'Cellular neuroimmune remodeling.',
        domainCategory: 'Neuroscience',
      }),
    ];

    const report = await AutonomousDiscoveryEngine.runDiscoveryScanWithReport(concepts, []);

    expect(report.totalScannedPairs).toBe(1);
    expect(report.newCandidatesCount).toBe(1);
    expect(report.candidates.length).toBe(1);
    expect(report.filteredOutTautologies).toBeGreaterThanOrEqual(0);
    expect(report.filteredOutNoise).toBeGreaterThanOrEqual(0);
  });
});
