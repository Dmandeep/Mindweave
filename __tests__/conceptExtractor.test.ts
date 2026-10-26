import { describe, it, expect } from 'vitest';
import { extractKnowledgeFromSource } from '../lib/extraction/conceptExtractor';

describe('Concept Extraction Pipeline', () => {
  it('extracts a concept from a valid text input', async () => {
    const result = await extractKnowledgeFromSource(
      'Raft Leader Leases',
      'Raft leader leases guarantee consistency by relying on physical clock bounds.',
      'text',
    );

    expect(result.source.title).toBe('Raft Leader Leases');
    expect(result.source.sourceType).toBe('text');
    expect(result.source.content).toContain('Raft leader leases');
    expect(result.source.contentHash.length).toBeGreaterThan(0);
    expect(result.concepts.length).toBeGreaterThanOrEqual(1);

    const concept = result.concepts[0];
    expect(concept.canonicalName).toBe('Raft Leader Leases');
    expect(concept.domainCategory).toBe('Distributed Systems');
    expect(concept.description.length).toBeGreaterThan(0);
  });

  it('assigns Neuroscience domain for brain-related content', async () => {
    const result = await extractKnowledgeFromSource(
      'Microglial Activation',
      'Microglia are neuroimmune cells in the brain that prune damaged synapses.',
      'text',
    );

    expect(result.concepts[0].domainCategory).toBe('Neuroscience');
  });

  it('assigns Materials Science domain for battery content', async () => {
    const result = await extractKnowledgeFromSource(
      'Solid-State Electrolytes',
      'Solid-state battery electrolyte degradation at the anode interface.',
      'text',
    );

    expect(result.concepts[0].domainCategory).toBe('Materials Science');
  });

  it('extracts evidence record with verbatim quote and character offsets', async () => {
    const content = 'Leader leases use monotonic clocks to bound staleness.';
    const result = await extractKnowledgeFromSource('Clock Bounds', content, 'text');

    expect(result.evidenceRecords.length).toBeGreaterThanOrEqual(1);
    const ev = result.evidenceRecords[0];
    expect(ev.sourceTitle).toBe('Clock Bounds');
    expect(ev.startChar).toBe(0);
    expect(ev.endChar).toBeGreaterThan(0);
    expect(ev.endChar).toBeLessThanOrEqual(content.length);
    expect(ev.stance).toBe('supports');
    expect(content.slice(ev.startChar, ev.endChar)).toBe(ev.verbatimQuote);
  });

  it('blocks extraction for CBRN content and returns zero concepts', async () => {
    const result = await extractKnowledgeFromSource(
      'Dangerous Protocol',
      'Detailed ricin production synthesis protocol for weaponize delivery.',
      'text',
    );

    expect(result.safetyAssessment.decision).toBe('BLOCK_SPECIFIC_OPERATION');
    expect(result.concepts).toEqual([]);
    expect(result.relationships).toEqual([]);
    expect(result.evidenceRecords).toEqual([]);
    // Source is still preserved for audit purposes
    expect(result.source.title).toBe('Dangerous Protocol');
  });

  it('assigns safety assessment to every extraction result', async () => {
    const result = await extractKnowledgeFromSource(
      'Safe Note',
      'This is a perfectly normal research note about distributed systems.',
      'text',
    );

    expect(result.safetyAssessment).toBeDefined();
    expect(result.safetyAssessment.decision).toBe('ALLOW');
    expect(result.safetyAssessment.category).toBe('benign');
    expect(result.safetyAssessment.rationale.length).toBeGreaterThan(0);
  });

  it('preserves source provenance even when content is empty', async () => {
    const result = await extractKnowledgeFromSource('Empty Note', '', 'text');

    expect(result.source.title).toBe('Empty Note');
    expect(result.source.content).toBe('');
    // Should still extract a concept from the title
    expect(result.concepts.length).toBeGreaterThanOrEqual(1);
  });

  it('generates unique content hashes for different inputs', async () => {
    const r1 = await extractKnowledgeFromSource('Note A', 'Content alpha', 'text');
    const r2 = await extractKnowledgeFromSource('Note B', 'Content beta', 'text');

    expect(r1.source.contentHash).not.toBe(r2.source.contentHash);
  });
});
