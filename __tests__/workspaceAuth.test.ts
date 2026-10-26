import { describe, it, expect, beforeEach } from 'vitest';
import { useKnowledgeStore } from '@/stores/knowledgeStore';

describe('MindWeave — Workspace Isolation & Export', () => {
  beforeEach(() => {
    // Reset Zustand store state before each test
    const store = useKnowledgeStore.getState();
    store.switchWorkspace('ws-main');
  });

  it('initializes with default user and workspaces', () => {
    const state = useKnowledgeStore.getState();
    expect(state.currentUser).toBeDefined();
    expect(state.currentUser.email).toBe('researcher@mindweave.io');
    expect(state.workspaces.length).toBeGreaterThanOrEqual(2);
    expect(state.currentWorkspaceId).toBe('ws-main');
  });

  it('creates a new research workspace with isolated metadata', () => {
    const state = useKnowledgeStore.getState();
    const newWs = state.createWorkspace(
      'Quantum Thermodynamics Lab',
      'Non-equilibrium thermodynamics in superconducting qubits',
      ['Physics', 'Quantum Information']
    );

    expect(newWs.id).toBeDefined();
    expect(newWs.name).toBe('Quantum Thermodynamics Lab');
    expect(newWs.domainFocus).toContain('Quantum Information');

    const updated = useKnowledgeStore.getState();
    expect(updated.workspaces.some((w) => w.id === newWs.id)).toBe(true);
    expect(updated.currentWorkspaceId).toBe(newWs.id);
  });

  it('switches between workspaces seamlessly', () => {
    const store = useKnowledgeStore.getState();
    store.switchWorkspace('ws-biochem');
    expect(useKnowledgeStore.getState().currentWorkspaceId).toBe('ws-biochem');

    store.switchWorkspace('ws-main');
    expect(useKnowledgeStore.getState().currentWorkspaceId).toBe('ws-main');
  });

  it('exports workspace in JSON format with structured concepts and relationships', () => {
    const store = useKnowledgeStore.getState();
    const jsonStr = store.exportKnowledgeSpace('json');
    const parsed = JSON.parse(jsonStr);

    expect(parsed.workspace).toBeDefined();
    expect(parsed.exportedAt).toBeDefined();
    expect(Array.isArray(parsed.concepts)).toBe(true);
    expect(Array.isArray(parsed.relationships)).toBe(true);
    expect(parsed.concepts.length).toBeGreaterThan(0);
  });

  it('exports workspace in Markdown format for external documentation', () => {
    const store = useKnowledgeStore.getState();
    const md = store.exportKnowledgeSpace('markdown');

    expect(typeof md).toBe('string');
    expect(md).toContain('# Knowledge Space:');
    expect(md).toContain('## Concepts');
    expect(md).toContain('## Relationships');
  });
});
