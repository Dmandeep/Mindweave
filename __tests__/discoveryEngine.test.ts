import { describe, it, expect } from 'vitest';
import { AutonomousDiscoveryEngine } from '../lib/discovery/discoveryEngine';
import type { Concept, Relationship } from '../types/knowledge';

const makeConcept = (overrides: Partial<Concept>): Concept => ({
  id: 'c-test',
  userId: 'user-default',
  canonicalName: 'Test Concept',
  aliases: [],
  description: 'A test concept.',
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
        description: 'Time-bounded leadership authorization mechanism preventing split-brain reads.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-microglia',
        canonicalName: 'Microglial Pruning',
        description: 'Neuroimmune cells that prune synapses using complement signaling cascades.',
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
        description: 'Distributed consensus with leader leases.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-2',
        canonicalName: 'Concept B',
        description: 'Synaptic pruning mechanisms in development.',
        domainCategory: 'Neuroscience',
      }),
      makeConcept({
        id: 'c-3',
        canonicalName: 'Concept C',
        description: 'Solid-state battery electrolyte degradation risk.',
        domainCategory: 'Materials Science',
      }),
    ];

    const result = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, []);

    expect(result.length).toBeGreaterThan(1);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].compositeScore).toBeGreaterThanOrEqual(result[i].compositeScore);
    }
  });

  it('assigns correct discoveryType for cross-domain analogies', () => {
    const concepts: Concept[] = [
      makeConcept({
        id: 'c-ds',
        canonicalName: 'Paxos',
        description: 'Consensus algorithm for state machine replication.',
        domainCategory: 'Distributed Systems',
      }),
      makeConcept({
        id: 'c-bio',
        canonicalName: 'Quorum Sensing',
        description: 'Bacterial collective behavior through signal molecules.',
        domainCategory: 'Neuroscience',
      }),
    ];

    const result = AutonomousDiscoveryEngine.runDiscoveryScan(concepts, []);
    expect(result.length).toBeGreaterThan(0);
    // Cross-domain pairs without direct tension keywords should be analogies or structural holes
    expect(['cross_domain_analogy', 'structural_hole_bridge']).toContain(result[0].discoveryType);
  });
});
