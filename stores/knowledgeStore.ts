import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { 
  Concept, 
  Relationship, 
  DiscoveryCandidate, 
  Investigation, 
  Source, 
  KnowledgeRevision,
  RelationshipStatus,
  RelationshipType,
  InvestigationOutcome,
  UserAccount,
  Workspace,
} from '@/types/knowledge';
import { AutonomousDiscoveryEngine, DiscoveryScanReport } from '@/lib/discovery/discoveryEngine';
import { isActionPermittedForLab } from '@/lib/safety/safetyClassifier';

export interface KnowledgeState {
  // Auth & Workspaces
  currentUser: UserAccount;
  workspaces: Workspace[];
  currentWorkspaceId: string;

  // Data entities
  sources: Source[];
  concepts: Concept[];
  relationships: Relationship[];
  discoveryCandidates: DiscoveryCandidate[];
  investigations: Investigation[];
  revisions: KnowledgeRevision[];

  // View & Selection states
  viewMode: 'universe' | 'discoveries' | 'lab';
  selectedConceptId: string | null;
  selectedRelationshipId: string | null;
  selectedDiscoveryId: string | null;
  activeInvestigationId: string | null;
  searchQuery: string;
  selectedDomainFilter: string | null;
  isCaptureModalOpen: boolean;
  isScanningDiscoveries: boolean;
  lastScanReport: DiscoveryScanReport | null;

  // Actions
  setViewMode: (mode: 'universe' | 'discoveries' | 'lab') => void;
  selectConcept: (id: string | null) => void;
  selectRelationship: (id: string | null) => void;
  selectDiscovery: (id: string | null) => void;
  setActiveInvestigation: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDomainFilter: (domain: string | null) => void;
  setCaptureModalOpen: (open: boolean) => void;

  // Workspaces & Accounts
  switchWorkspace: (workspaceId: string) => void;
  createWorkspace: (name: string, description: string, domainFocus: string[]) => Workspace;

  // Concept CRUD
  createConcept: (data: {
    canonicalName: string;
    description: string;
    domainCategory: string;
    aliases?: string[];
    tags?: string[];
    color?: string;
  }) => Concept;
  updateConcept: (
    id: string,
    updates: Partial<Pick<Concept, 'canonicalName' | 'description' | 'domainCategory' | 'aliases' | 'tags' | 'color'>>
  ) => void;
  deleteConcept: (id: string) => void;

  // Relationship Mutations
  createRelationship: (data: {
    sourceConceptId: string;
    targetConceptId: string;
    relationshipType: RelationshipType;
    rationale: string;
    confidenceScore?: number;
  }) => { success: boolean; relationship?: Relationship; error?: string };
  deleteRelationship: (id: string) => void;

  // Workflow Mutations
  addSourceAndExtract: (title: string, content: string, sourceType?: 'text' | 'markdown') => void;
  triggerDiscoveryScan: () => Promise<DiscoveryScanReport>;
  promoteDiscoveryToLab: (discoveryId: string) => string;
  updateHypothesis: (investigationId: string, statement: string, assumptions: string[]) => void;
  updateExperimentPlan: (investigationId: string, title: string, methodology: string, criteria: any[]) => void;
  recordObservation: (investigationId: string, observations: string) => void;
  reconcileInvestigationOutcome: (investigationId: string, outcome: InvestigationOutcome) => void;
  dismissDiscovery: (discoveryId: string, reason?: string) => void;
  rejectDiscovery: (discoveryId: string, reason?: string) => void;
  pinDiscovery: (discoveryId: string) => void;
  locateDiscoveryInUniverse: (discoveryId: string) => void;
  exportKnowledgeSpace: (format: 'json' | 'markdown') => string;
}

const DEFAULT_USER: UserAccount = {
  id: 'user-default',
  email: 'researcher@mindweave.io',
  fullName: 'Principal Researcher',
  role: 'researcher',
  createdAt: '2026-10-20T00:00:00Z',
};

const INITIAL_WORKSPACES: Workspace[] = [
  {
    id: 'ws-main',
    userId: 'user-default',
    name: 'Primary Knowledge Universe',
    description: 'Core cross-disciplinary workspace spanning Distributed Systems, Biology, and Energy Materials.',
    domainFocus: ['Distributed Systems', 'Evolutionary Biology', 'Immunology', 'Neurobiology', 'Energy & Materials'],
    isDefault: true,
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-26T00:00:00Z',
  },
  {
    id: 'ws-biochem',
    userId: 'user-default',
    name: 'Neuro-Immunology Lab',
    description: 'Specialized lab space focused on microbiome-gut-brain interactions.',
    domainFocus: ['Immunology', 'Neurobiology', 'Biochemistry'],
    isDefault: false,
    createdAt: '2026-10-25T00:00:00Z',
    updatedAt: '2026-10-26T00:00:00Z',
  },
];

const INITIAL_CONCEPTS: Concept[] = [
  {
    id: 'c-raft-leases',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Raft Quorum Leases',
    aliases: ['Leader Leases', 'Time-Bounded Consensus'],
    description: 'Time-bounded leadership authorization mechanism preventing split-brain reads without full roundtrip consensus per query.',
    domainCategory: 'Distributed Systems',
    color: '#06B6D4',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'c-split-brain',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Split-Brain Inconsistency',
    aliases: ['Network Partition Divergence'],
    description: 'State where an isolated cluster partition elects a competing leader, producing conflicting transactional histories.',
    domainCategory: 'Distributed Systems',
    color: '#06B6D4',
    createdAt: '2026-10-20T10:05:00Z',
  },
  {
    id: 'c-stigmergy',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Honeybee Quorum Sensing',
    aliases: ['Stigmergic Consensus', 'Decentralized Pheromone Quorum'],
    description: 'Decentralized collective decision-making where individual scouts evaluate nest sites and aggregate votes via chemical or dance decay thresholds.',
    domainCategory: 'Evolutionary Biology',
    color: '#8B5CF6',
    createdAt: '2026-10-22T14:30:00Z',
  },
  {
    id: 'c-decay-rates',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Localized Temporal Signal Decay',
    aliases: ['Pheromone Evaporation', 'Decay Invariant'],
    description: 'Passive information expiration mechanism ensuring stale state signals automatically dissolve without requiring explicit revocation signals.',
    domainCategory: 'Evolutionary Biology',
    color: '#8B5CF6',
    createdAt: '2026-10-22T14:35:00Z',
  },
  {
    id: 'c-gut-butyrate',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Gut Microbial Butyrate',
    aliases: ['SCFA Butyrate', 'Microbiome Metabolite'],
    description: 'Short-chain fatty acid produced by anaerobic bacterial fermentation of dietary fibers, acting as an HDAC inhibitor and immune modulator.',
    domainCategory: 'Immunology',
    color: '#10B981',
    createdAt: '2026-10-24T09:00:00Z',
  },
  {
    id: 'c-microglia-parkinsons',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Microglial Neuroinflammation',
    aliases: ['Brain Macrophage Activation', 'Neurodegenerative Inflammation'],
    description: 'Chronic neurotoxic activation of resident CNS immune cells releasing pro-inflammatory cytokines that exacerbate dopaminergic neuronal death.',
    domainCategory: 'Neurobiology',
    color: '#10B981',
    createdAt: '2026-10-24T09:15:00Z',
  },
  {
    id: 'c-solid-state-battery',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Solid-State Ceramic Electrolyte',
    aliases: ['LLZO Garnet', 'Inorganic Solid Electrolyte'],
    description: 'Non-flammable solid ion conductor enabling pure lithium metal anodes with high volumetric energy densities.',
    domainCategory: 'Energy & Materials',
    color: '#F59E0B',
    createdAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'c-mechanical-clamping',
    userId: 'user-default',
    workspaceId: 'ws-main',
    canonicalName: 'Dynamic Mechanical Pressure Clamping',
    aliases: ['Uniaxial Stack Pressure', 'Interface Mechanics'],
    description: 'Constant external mechanical compression applied to battery pouch cells to suppress solid-electrolyte interphase void formation and dendrite short-circuits.',
    domainCategory: 'Energy & Materials',
    color: '#F59E0B',
    createdAt: '2026-10-25T11:10:00Z',
  }
];

const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1',
    userId: 'user-default',
    workspaceId: 'ws-main',
    sourceConceptId: 'c-raft-leases',
    targetConceptId: 'c-split-brain',
    relationshipType: 'inhibits',
    directional: true,
    confidenceScore: 0.94,
    status: 'accepted',
    rationale: 'Raft leader leases guarantee single-leader read consistency by ensuring clock drift cannot exceed the lease expiration window.',
    createdAt: '2026-10-20T10:10:00Z',
  },
  {
    id: 'rel-2',
    userId: 'user-default',
    workspaceId: 'ws-main',
    sourceConceptId: 'c-decay-rates',
    targetConceptId: 'c-stigmergy',
    relationshipType: 'enables',
    directional: true,
    confidenceScore: 0.91,
    status: 'accepted',
    rationale: 'Signal evaporation ensures that abandoned discovery paths are forgotten, allowing collective swarms to converge on optimal nesting choices.',
    createdAt: '2026-10-22T14:40:00Z',
  },
  {
    id: 'rel-3',
    userId: 'user-default',
    workspaceId: 'ws-main',
    sourceConceptId: 'c-mechanical-clamping',
    targetConceptId: 'c-solid-state-battery',
    relationshipType: 'depends_on',
    directional: true,
    confidenceScore: 0.88,
    status: 'accepted',
    rationale: 'Ceramic electrolyte interfaces delaminate during lithiation expansion cycles unless maintained under 5–10 MPa uniform compression.',
    createdAt: '2026-10-25T11:15:00Z',
  }
];

const INITIAL_DISCOVERIES: DiscoveryCandidate[] = [
  {
    id: 'disc-quorum-bridge',
    userId: 'user-default',
    workspaceId: 'ws-main',
    conceptAId: 'c-raft-leases',
    conceptBId: 'c-stigmergy',
    conceptAName: 'Raft Quorum Leases',
    conceptBName: 'Honeybee Quorum Sensing',
    conceptADomain: 'Distributed Systems',
    conceptBDomain: 'Evolutionary Biology',
    discoveryType: 'cross_domain_analogy',
    proposedRelationship: 'analogous_to',
    explanation: 'Both systems resolve state inconsistency under communication partitions using localized temporal signal expiration rather than centralized consensus coordination.',
    noveltyScore: 0.85,
    plausibilityScore: 0.92,
    compositeScore: 0.89,
    status: 'unread',
    safetyDecision: 'ALLOW',
    safetyCategory: 'benign',
    safetyRationale: 'Defensive distributed systems consistency verification.',
    permittedScope: 'Full access: Architectural modeling, formal verification, empirical simulation.',
    evidenceQuotes: [
      {
        sourceId: 'src-raft-doc',
        sourceTitle: 'Consensus in Asynchronous Systems (2024)',
        quote: 'Leases utilize local monotonic duration expiration to avoid RPC chatter across cluster replicas during read requests.'
      },
      {
        sourceId: 'src-stigmergy-paper',
        sourceTitle: 'Swarm Intelligence & Quorum Dynamics (2023)',
        quote: 'Scout recruitment dances decay exponentially over minutes, preventing outdated site recommendations from causing colony split-brain.'
      }
    ],
    createdAt: '2026-10-26T08:00:00Z'
  },
  {
    id: 'disc-butyrate-parkinsons',
    userId: 'user-default',
    workspaceId: 'ws-main',
    conceptAId: 'c-gut-butyrate',
    conceptBId: 'c-microglia-parkinsons',
    conceptAName: 'Gut Microbial Butyrate',
    conceptBName: 'Microglial Neuroinflammation',
    conceptADomain: 'Immunology',
    conceptBDomain: 'Neurobiology',
    discoveryType: 'cross_domain_analogy',
    proposedRelationship: 'inhibits',
    explanation: 'Systemic microbial butyrate crosses the blood-brain barrier via monocarboxylate transporters, directly suppressing NF-κB transcription in microglial cells and dampening neuroinflammation.',
    noveltyScore: 0.78,
    plausibilityScore: 0.95,
    compositeScore: 0.87,
    status: 'unread',
    safetyDecision: 'ALLOW',
    safetyCategory: 'benign',
    safetyRationale: 'Peer-reviewed immunological biochemistry and neurobiology research.',
    permittedScope: 'Full access: Biochemical modeling, literature meta-analysis.',
    evidenceQuotes: [
      {
        sourceId: 'src-microbiome-review',
        sourceTitle: 'Microbiome-Gut-Brain Axis in Autoimmunity (2025)',
        quote: 'SCFA supplementation restored microglial resting morphology in murine neurodegeneration models.'
      }
    ],
    createdAt: '2026-10-26T08:15:00Z'
  }
];

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set, get) => ({
      currentUser: DEFAULT_USER,
      workspaces: INITIAL_WORKSPACES,
      currentWorkspaceId: 'ws-main',

      sources: [
        {
          id: 'src-raft-doc',
          userId: 'user-default',
          workspaceId: 'ws-main',
          title: 'Consensus in Asynchronous Systems (2024)',
          sourceType: 'markdown',
          content: 'Raft leader leases guarantee consistency by relying on physical clock bounds. Leases utilize local monotonic duration expiration to avoid RPC chatter across cluster replicas during read requests.',
          contentHash: 'hash-raft-001',
          createdAt: '2026-10-20T10:00:00Z'
        },
        {
          id: 'src-stigmergy-paper',
          userId: 'user-default',
          workspaceId: 'ws-main',
          title: 'Swarm Intelligence & Quorum Dynamics (2023)',
          sourceType: 'markdown',
          content: 'Scout recruitment dances decay exponentially over minutes, preventing outdated site recommendations from causing colony split-brain. This biological quorum mechanism achieves robust decentralized consensus.',
          contentHash: 'hash-stigmergy-002',
          createdAt: '2026-10-22T14:30:00Z'
        }
      ],
      concepts: INITIAL_CONCEPTS,
      relationships: INITIAL_RELATIONSHIPS,
      discoveryCandidates: INITIAL_DISCOVERIES,
      investigations: [],
      revisions: [],

      viewMode: 'universe',
      selectedConceptId: null,
      selectedRelationshipId: null,
      selectedDiscoveryId: null,
      activeInvestigationId: null,
      searchQuery: '',
      selectedDomainFilter: null,
      isCaptureModalOpen: false,
      isScanningDiscoveries: false,
      lastScanReport: null,

      setViewMode: (mode) => set({ viewMode: mode }),
      selectConcept: (id) => set({ selectedConceptId: id, selectedRelationshipId: null }),
      selectRelationship: (id) => set({ selectedRelationshipId: id, selectedConceptId: null }),
      selectDiscovery: (id) => set({ selectedDiscoveryId: id }),
      setActiveInvestigation: (id) => set({ activeInvestigationId: id }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setSelectedDomainFilter: (domain) => set({ selectedDomainFilter: domain }),
      setCaptureModalOpen: (open) => set({ isCaptureModalOpen: open }),

      // Workspace & Account Actions
      switchWorkspace: (workspaceId) => {
        const ws = get().workspaces.find((w) => w.id === workspaceId);
        if (ws) {
          set({
            currentWorkspaceId: workspaceId,
            selectedConceptId: null,
            selectedRelationshipId: null,
            selectedDiscoveryId: null,
            activeInvestigationId: null,
          });
        }
      },

      createWorkspace: (name, description, domainFocus) => {
        const newWs: Workspace = {
          id: `ws-${Date.now()}`,
          userId: get().currentUser.id,
          name,
          description,
          domainFocus,
          isDefault: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          workspaces: [...state.workspaces, newWs],
          currentWorkspaceId: newWs.id,
        }));
        return newWs;
      },

      // Concept CRUD
      createConcept: (data) => {
        const id = `c-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const now = new Date().toISOString();
        const newConcept: Concept = {
          id,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          canonicalName: data.canonicalName.trim(),
          description: data.description.trim(),
          domainCategory: data.domainCategory.trim() || 'General',
          aliases: data.aliases || [],
          tags: data.tags || [],
          color: data.color || '#6366F1',
          createdAt: now,
          updatedAt: now,
        };

        const rev: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'concept',
          entityId: id,
          previousState: null,
          newState: newConcept,
          reason: 'Manual concept creation',
          timestamp: now,
        };

        set((state) => ({
          concepts: [newConcept, ...state.concepts],
          revisions: [rev, ...state.revisions],
          selectedConceptId: id,
        }));

        return newConcept;
      },

      updateConcept: (id, updates) => {
        const existing = get().concepts.find((c) => c.id === id);
        if (!existing) return;

        const now = new Date().toISOString();
        const updatedConcept: Concept = {
          ...existing,
          ...updates,
          updatedAt: now,
        };

        const rev: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'concept',
          entityId: id,
          previousState: existing,
          newState: updatedConcept,
          reason: 'Manual concept update',
          timestamp: now,
        };

        set((state) => ({
          concepts: state.concepts.map((c) => (c.id === id ? updatedConcept : c)),
          revisions: [rev, ...state.revisions],
        }));
      },

      deleteConcept: (id) => {
        const existing = get().concepts.find((c) => c.id === id);
        if (!existing) return;

        const now = new Date().toISOString();
        const attachedRels = get().relationships.filter(
          (r) => r.sourceConceptId === id || r.targetConceptId === id
        );

        const rev: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'concept',
          entityId: id,
          previousState: existing,
          newState: null,
          reason: `Concept deletion; cascaded ${attachedRels.length} attached relationships`,
          timestamp: now,
        };

        set((state) => ({
          concepts: state.concepts.filter((c) => c.id !== id),
          relationships: state.relationships.filter(
            (r) => r.sourceConceptId !== id && r.targetConceptId !== id
          ),
          discoveryCandidates: state.discoveryCandidates.filter(
            (d) => d.conceptAId !== id && d.conceptBId !== id
          ),
          revisions: [rev, ...state.revisions],
          selectedConceptId: state.selectedConceptId === id ? null : state.selectedConceptId,
        }));
      },

      // Relationship Mutations
      createRelationship: (data) => {
        if (data.sourceConceptId === data.targetConceptId) {
          return {
            success: false,
            error: 'Self-referential loops are prohibited in the knowledge graph.',
          };
        }

        const duplicate = get().relationships.some(
          (r) =>
            r.sourceConceptId === data.sourceConceptId &&
            r.targetConceptId === data.targetConceptId &&
            r.relationshipType === data.relationshipType
        );

        if (duplicate) {
          return {
            success: false,
            error: 'An identical relationship already exists between these concepts.',
          };
        }

        const id = `rel-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
        const now = new Date().toISOString();
        const newRel: Relationship = {
          id,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          sourceConceptId: data.sourceConceptId,
          targetConceptId: data.targetConceptId,
          relationshipType: data.relationshipType,
          directional: true,
          confidenceScore: data.confidenceScore ?? 0.85,
          status: 'accepted',
          rationale: data.rationale || 'Direct relationship established by researcher',
          createdAt: now,
          updatedAt: now,
        };

        const rev: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'relationship',
          entityId: id,
          previousState: null,
          newState: newRel,
          reason: 'Manual relationship creation',
          timestamp: now,
        };

        set((state) => ({
          relationships: [newRel, ...state.relationships],
          revisions: [rev, ...state.revisions],
          selectedRelationshipId: id,
        }));

        return { success: true, relationship: newRel };
      },

      deleteRelationship: (id) => {
        const existing = get().relationships.find((r) => r.id === id);
        if (!existing) return;

        const rev: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'relationship',
          entityId: id,
          previousState: existing,
          newState: null,
          reason: 'Manual relationship removal',
          timestamp: new Date().toISOString(),
        };

        set((state) => ({
          relationships: state.relationships.filter((r) => r.id !== id),
          revisions: [rev, ...state.revisions],
          selectedRelationshipId: state.selectedRelationshipId === id ? null : state.selectedRelationshipId,
        }));
      },

      // Source Ingestion & Discovery
      addSourceAndExtract: (title, content, sourceType = 'text') => {
        const newSourceId = `src-${Date.now()}`;
        const newSource: Source = {
          id: newSourceId,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          title,
          sourceType,
          content,
          contentHash: `hash-${Date.now().toString(16)}`,
          createdAt: new Date().toISOString()
        };

        const domainCategory = title.toLowerCase().includes('consensus') || title.toLowerCase().includes('raft')
          ? 'Distributed Systems'
          : title.toLowerCase().includes('gut') || title.toLowerCase().includes('bio') || title.toLowerCase().includes('immune')
          ? 'Immunology'
          : title.toLowerCase().includes('battery') || title.toLowerCase().includes('ceramic')
          ? 'Energy & Materials'
          : 'General';

        const newConcept: Concept = {
          id: `c-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          canonicalName: title.replace(/^(Notes on|Analysis of|Paper:)\s*/i, '').trim(),
          aliases: [],
          description: content.slice(0, 140) + (content.length > 140 ? '...' : ''),
          domainCategory,
          createdAt: new Date().toISOString()
        };

        const updatedConcepts = [newConcept, ...get().concepts];
        const updatedCandidates = AutonomousDiscoveryEngine.runDiscoveryScan(
          updatedConcepts,
          get().relationships,
          get().discoveryCandidates,
          get().currentUser.id
        );

        set((state) => ({
          sources: [newSource, ...state.sources],
          concepts: updatedConcepts,
          discoveryCandidates: updatedCandidates,
          isCaptureModalOpen: false,
          selectedConceptId: newConcept.id
        }));
      },

      triggerDiscoveryScan: async () => {
        set({ isScanningDiscoveries: true });
        const report = await AutonomousDiscoveryEngine.runDiscoveryScanWithReport(
          get().concepts,
          get().relationships,
          get().discoveryCandidates,
          get().currentUser.id
        );
        set({
          discoveryCandidates: report.candidates,
          lastScanReport: report,
          isScanningDiscoveries: false
        });
        return report;
      },

      promoteDiscoveryToLab: (discoveryId: string) => {
        const discovery = get().discoveryCandidates.find((d) => d.id === discoveryId);
        if (!discovery) return '';

        const permission = isActionPermittedForLab(discovery.safetyDecision);
        if (!permission.permitted) {
          console.warn(
            `[Safety Policy Gate] Blocked promotion of discovery "${discovery.conceptAName} ↔ ${discovery.conceptBName}": ${permission.reason}`
          );
          return '';
        }

        const isRestricted = permission.canonicalDecision === 'RESTRICT';
        const investigationId = `inv-${Date.now()}`;
        const newInvestigation: Investigation = {
          id: investigationId,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          discoveryId,
          title: `Investigating ${discovery.conceptAName} ↔ ${discovery.conceptBName}`,
          summary: discovery.explanation,
          stage: 'hypothesis',
          hypothesisStatement: `If ${discovery.conceptAName} is applied to the dynamics of ${discovery.conceptBName}, then state consistency will be preserved under communication decay because both share an invariant temporal expiration threshold.`,
          assumptions: [
            'Local clocks maintain acceptable drift-bounds (< 50ms)',
            'Signal decay threshold can be modeled monotonically',
            'Partition duration does not exceed timeout TTL'
          ],
          experimentPlan: {
            id: `plan-${Date.now()}`,
            title: isRestricted ? 'Constrained Empirical Protocol' : 'Empirical Benchmark Protocol',
            objective: 'Empirically verify consistency invariant under partition decay bounds',
            methodology: 'Simulate network partition during concurrent read operations; measure stale read frequency vs signal lease expiry.',
            safetyConsiderations: isRestricted
              ? `RESTRICTED RESEARCH SCOPE: ${discovery.permittedScope || 'Theoretical analysis and defensive telemetry only. Operational exploit execution is disabled.'}`
              : (discovery.safetyRationale || 'Unrestricted empirical investigation under standard ethical safety guidelines.'),
            successCriteria: [
              {
                id: 'crit-1',
                metricName: 'Stale Read Anomaly Rate',
                targetThreshold: '0.00%',
                operator: 'equals'
              },
              {
                id: 'crit-2',
                metricName: 'P99 Latency Penalty',
                targetThreshold: '15ms',
                operator: 'lte'
              }
            ]
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        set((state) => ({
          discoveryCandidates: state.discoveryCandidates.map((d) => 
            d.id === discoveryId ? { ...d, status: 'investigating' } : d
          ),
          investigations: [newInvestigation, ...state.investigations],
          activeInvestigationId: investigationId,
          viewMode: 'lab'
        }));

        return investigationId;
      },

      updateHypothesis: (investigationId, statement, assumptions) => {
        set((state) => ({
          investigations: state.investigations.map((inv) =>
            inv.id === investigationId
              ? { ...inv, hypothesisStatement: statement, assumptions, updatedAt: new Date().toISOString() }
              : inv
          )
        }));
      },

      updateExperimentPlan: (investigationId, title, methodology, criteria) => {
        set((state) => ({
          investigations: state.investigations.map((inv) =>
            inv.id === investigationId
              ? {
                  ...inv,
                  stage: 'design',
                  experimentPlan: {
                    ...inv.experimentPlan,
                    title,
                    methodology,
                    successCriteria: criteria,
                  },
                  updatedAt: new Date().toISOString()
                }
              : inv
          )
        }));
      },

      recordObservation: (investigationId, observations) => {
        set((state) => ({
          investigations: state.investigations.map((inv) =>
            inv.id === investigationId
              ? {
                  ...inv,
                  stage: 'execution',
                  experimentPlan: {
                    ...inv.experimentPlan,
                    observations: (inv.experimentPlan.observations ? inv.experimentPlan.observations + '\n---\n' : '') + observations,
                  },
                  updatedAt: new Date().toISOString()
                }
              : inv
          )
        }));
      },

      reconcileInvestigationOutcome: (investigationId, outcome) => {
        const inv = get().investigations.find((i) => i.id === investigationId);
        if (!inv) return;

        const discovery = get().discoveryCandidates.find((d) => d.id === inv.discoveryId);
        let newStatus: RelationshipStatus = 'proposed';
        let confidence = 0.50;

        if (outcome === 'supported') {
          newStatus = 'accepted';
          confidence = 0.88;
        } else if (outcome === 'partially_supported') {
          newStatus = 'accepted';
          confidence = 0.65;
        } else if (outcome === 'refuted') {
          newStatus = 'rejected';
          confidence = 0.15;
        } else if (outcome === 'inconclusive') {
          newStatus = 'disputed';
          confidence = 0.40;
        }

        let updatedRelationships = [...get().relationships];

        if (discovery) {
          const existingRel = updatedRelationships.find(
            (r) => r.sourceConceptId === discovery.conceptAId && r.targetConceptId === discovery.conceptBId
          );

          if (existingRel) {
            updatedRelationships = updatedRelationships.map((r) =>
              r.id === existingRel.id
                ? { ...r, status: newStatus, confidenceScore: confidence }
                : r
            );
          } else {
            const newRel: Relationship = {
              id: `rel-${Date.now()}`,
              userId: get().currentUser.id,
              workspaceId: get().currentWorkspaceId,
              sourceConceptId: discovery.conceptAId,
              targetConceptId: discovery.conceptBId,
              relationshipType: discovery.proposedRelationship,
              directional: true,
              confidenceScore: confidence,
              status: newStatus,
              rationale: `${outcome.toUpperCase()} empirically in Discovery Lab [${inv.title}]: ${discovery.explanation}`,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            updatedRelationships.push(newRel);
          }
        }

        const revision: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'hypothesis',
          entityId: investigationId,
          previousState: { stage: inv.stage, outcome: inv.experimentPlan.outcome },
          newState: { stage: 'completed', outcome },
          reason: `Empirical investigation concluded as ${outcome.toUpperCase()}`,
          timestamp: new Date().toISOString()
        };

        set((state) => ({
          investigations: state.investigations.map((i) =>
            i.id === investigationId
              ? {
                  ...i,
                  stage: 'completed',
                  experimentPlan: {
                    ...i.experimentPlan,
                    outcome,
                    completedAt: new Date().toISOString(),
                  },
                  updatedAt: new Date().toISOString()
                }
              : i
          ),
          relationships: updatedRelationships,
          revisions: [revision, ...state.revisions]
        }));
      },

      dismissDiscovery: (discoveryId, reason) => {
        set((state) => ({
          discoveryCandidates: state.discoveryCandidates.map((d) =>
            d.id === discoveryId ? { ...d, status: 'dismissed', dismissedReason: reason || 'Dismissed by user' } : d
          )
        }));
      },

      rejectDiscovery: (discoveryId, reason) => {
        const disc = get().discoveryCandidates.find((d) => d.id === discoveryId);
        const revision: KnowledgeRevision = {
          id: `rev-${Date.now()}`,
          userId: get().currentUser.id,
          workspaceId: get().currentWorkspaceId,
          entityType: 'relationship',
          entityId: discoveryId,
          previousState: { status: disc?.status || 'unread' },
          newState: { status: 'dismissed', reason: reason || 'Rejected proposed relationship' },
          reason: `Discovery rejected: ${reason || 'User determined connection is invalid or non-viable'}`,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          discoveryCandidates: state.discoveryCandidates.map((d) =>
            d.id === discoveryId ? { ...d, status: 'dismissed', dismissedReason: reason || 'Rejected by user' } : d
          ),
          revisions: [revision, ...state.revisions],
          selectedDiscoveryId: null,
        }));
      },

      pinDiscovery: (discoveryId) => {
        set((state) => ({
          discoveryCandidates: state.discoveryCandidates.map((d) =>
            d.id === discoveryId ? { ...d, status: 'pinned' } : d
          )
        }));
      },

      locateDiscoveryInUniverse: (discoveryId) => {
        const disc = get().discoveryCandidates.find((d) => d.id === discoveryId);
        set({
          selectedDiscoveryId: discoveryId,
          selectedConceptId: disc ? disc.conceptAId : null,
          viewMode: 'universe',
        });
      },

      exportKnowledgeSpace: (format: 'json' | 'markdown') => {
        const state = get();
        const currentWs = state.workspaces.find((w) => w.id === state.currentWorkspaceId);
        const wsConcepts = state.concepts.filter((c) => !c.workspaceId || c.workspaceId === state.currentWorkspaceId);
        const wsRels = state.relationships.filter((r) => !r.workspaceId || r.workspaceId === state.currentWorkspaceId);

        if (format === 'json') {
          return JSON.stringify(
            {
              workspace: currentWs,
              exportedAt: new Date().toISOString(),
              concepts: wsConcepts,
              relationships: wsRels,
              discoveries: state.discoveryCandidates,
              investigations: state.investigations,
              revisions: state.revisions,
            },
            null,
            2
          );
        }

        // Markdown Export
        let md = `# Knowledge Space: ${currentWs?.name || 'Primary Universe'}\n\n`;
        md += `*Exported on: ${new Date().toISOString()}*\n\n`;
        md += `## Concepts (${wsConcepts.length})\n\n`;
        wsConcepts.forEach((c) => {
          md += `### ${c.canonicalName} [${c.domainCategory}]\n`;
          md += `${c.description}\n\n`;
        });

        md += `## Relationships (${wsRels.length})\n\n`;
        wsRels.forEach((r) => {
          const src = wsConcepts.find((c) => c.id === r.sourceConceptId)?.canonicalName || r.sourceConceptId;
          const tgt = wsConcepts.find((c) => c.id === r.targetConceptId)?.canonicalName || r.targetConceptId;
          md += `- **${src}** —[${r.relationshipType}]→ **${tgt}** (${Math.round(r.confidenceScore * 100)}% confidence, status: ${r.status})\n`;
          if (r.rationale) md += `  *Rationale: ${r.rationale}*\n`;
        });

        return md;
      },
    }),
    {
      name: 'mindweave-knowledge-store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? {
        getItem: (name: string) => {
          const item = localStorage.getItem(name);
          if (item) return item;
          // Backward compatibility: read from legacy store name if present
          const legacy = localStorage.getItem('web-of-thoughts-knowledge-store');
          if (legacy) {
            localStorage.setItem(name, legacy);
            return legacy;
          }
          return null;
        },
        setItem: (name: string, value: string) => localStorage.setItem(name, value),
        removeItem: (name: string) => localStorage.removeItem(name),
      } : {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {},
      })),
      partialize: (state) => ({
        currentUser: state.currentUser,
        workspaces: state.workspaces,
        currentWorkspaceId: state.currentWorkspaceId,
        sources: state.sources,
        concepts: state.concepts,
        relationships: state.relationships,
        discoveryCandidates: state.discoveryCandidates,
        investigations: state.investigations,
        revisions: state.revisions,
      }),
    }
  )
);
