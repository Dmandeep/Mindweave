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
  InvestigationOutcome
} from '@/types/knowledge';
import { AutonomousDiscoveryEngine } from '@/lib/discovery/discoveryEngine';

interface KnowledgeState {
  // Data entities
  sources: Source[];
  concepts: Concept[];
  relationships: Relationship[];
  discoveryCandidates: DiscoveryCandidate[];
  investigations: Investigation[];
  revisions: KnowledgeRevision[];

  // View & Selection states
  viewMode: 'universe' | 'lab';
  selectedConceptId: string | null;
  selectedRelationshipId: string | null;
  selectedDiscoveryId: string | null;
  activeInvestigationId: string | null;
  searchQuery: string;
  selectedDomainFilter: string | null;
  isCaptureModalOpen: boolean;

  // Actions
  setViewMode: (mode: 'universe' | 'lab') => void;
  selectConcept: (id: string | null) => void;
  selectRelationship: (id: string | null) => void;
  selectDiscovery: (id: string | null) => void;
  setActiveInvestigation: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedDomainFilter: (domain: string | null) => void;
  setCaptureModalOpen: (open: boolean) => void;

  // Workflow Mutations
  addSourceAndExtract: (title: string, content: string, sourceType?: 'text' | 'markdown') => void;
  promoteDiscoveryToLab: (discoveryId: string) => string;
  updateHypothesis: (investigationId: string, statement: string, assumptions: string[]) => void;
  updateExperimentPlan: (investigationId: string, title: string, methodology: string, criteria: any[]) => void;
  recordObservation: (investigationId: string, observations: string) => void;
  reconcileInvestigationOutcome: (investigationId: string, outcome: InvestigationOutcome) => void;
  dismissDiscovery: (discoveryId: string) => void;
  pinDiscovery: (discoveryId: string) => void;
}

// Initial Seed Data across Distributed Systems, Biology, Materials, and Macroeconomics
const INITIAL_CONCEPTS: Concept[] = [
  {
    id: 'c-raft-leases',
    userId: 'user-default',
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
    canonicalName: 'Gut Microbial Butyrate',
    aliases: ['Short-Chain Fatty Acid Metabolites', 'SCFA Butyrate'],
    description: 'Microbially derived short-chain fatty acid essential for epigenetic histone deacetylase (HDAC) inhibition and anti-inflammatory signaling.',
    domainCategory: 'Immunology',
    color: '#10B981',
    createdAt: '2026-10-24T09:15:00Z',
  },
  {
    id: 'c-microglia-parkinsons',
    userId: 'user-default',
    canonicalName: 'Microglial Neuroinflammation',
    aliases: ['Neurodegenerative Inflammatory Cascade'],
    description: 'Chronic overactivation of brain resident macrophages precipitating alpha-synuclein oligomerization and dopaminergic neuronal death.',
    domainCategory: 'Neurobiology',
    color: '#F43F5E',
    createdAt: '2026-10-24T09:20:00Z',
  },
  {
    id: 'c-solid-state-battery',
    userId: 'user-default',
    canonicalName: 'Solid-State Ceramic Electrolyte',
    aliases: ['LLZO Electrolyte', 'Sulfide Ceramic Separator'],
    description: 'Non-flammable solid electrolyte enabling lithium metal anodes, constrained by high interfacial impedance at room temperature.',
    domainCategory: 'Energy & Materials',
    color: '#F59E0B',
    createdAt: '2026-10-25T11:00:00Z',
  },
  {
    id: 'c-mechanical-clamping',
    userId: 'user-default',
    canonicalName: 'High-Pressure Mechanical Clamping',
    aliases: ['Stack Pressure Engineering', 'Interfacial Compression'],
    description: 'External mechanical pressure applied to solid-state battery cells to maintain continuous atomic contact and inhibit lithium dendrite void formation.',
    domainCategory: 'Mechanical Engineering',
    color: '#F59E0B',
    createdAt: '2026-10-25T11:10:00Z',
  }
];

const INITIAL_RELATIONSHIPS: Relationship[] = [
  {
    id: 'rel-1',
    userId: 'user-default',
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
  sources: [
    {
      id: 'src-raft-doc',
      userId: 'user-default',
      title: 'Consensus in Asynchronous Systems (2024)',
      sourceType: 'markdown',
      content: 'Raft leader leases guarantee consistency by relying on physical clock bounds. Leases utilize local monotonic duration expiration to avoid RPC chatter across cluster replicas during read requests.',
      contentHash: 'hash-raft-001',
      createdAt: '2026-10-20T10:00:00Z'
    },
    {
      id: 'src-stigmergy-paper',
      userId: 'user-default',
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

  setViewMode: (mode) => set({ viewMode: mode }),
  selectConcept: (id) => set({ selectedConceptId: id, selectedRelationshipId: null, selectedDiscoveryId: null }),
  selectRelationship: (id) => set({ selectedRelationshipId: id, selectedConceptId: null, selectedDiscoveryId: null }),
  selectDiscovery: (id) => set({ selectedDiscoveryId: id, selectedConceptId: null, selectedRelationshipId: null }),
  setActiveInvestigation: (id) => set({ activeInvestigationId: id, viewMode: 'lab' }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedDomainFilter: (domain) => set({ selectedDomainFilter: domain }),
  setCaptureModalOpen: (open) => set({ isCaptureModalOpen: open }),

  addSourceAndExtract: (title, content, sourceType = 'text') => {
    const id = `src-${Date.now()}`;
    const newSource: Source = {
      id,
      userId: 'user-default',
      title,
      sourceType,
      content,
      contentHash: `hash-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    // Intelligent domain classification matching system taxonomy
    const lowerContent = (title + ' ' + content).toLowerCase();
    let detectedDomain = 'General';
    if (lowerContent.includes('raft') || lowerContent.includes('consensus') || lowerContent.includes('distributed') || lowerContent.includes('quorum')) {
      detectedDomain = 'Distributed Systems';
    } else if (lowerContent.includes('honeybee') || lowerContent.includes('stigmerg') || lowerContent.includes('swarm') || lowerContent.includes('evolution')) {
      detectedDomain = 'Evolutionary Biology';
    } else if (lowerContent.includes('microglia') || lowerContent.includes('neuro') || lowerContent.includes('brain') || lowerContent.includes('synapse') || lowerContent.includes('parkinson')) {
      detectedDomain = 'Neurobiology';
    } else if (lowerContent.includes('battery') || lowerContent.includes('electrolyte') || lowerContent.includes('ceramic') || lowerContent.includes('lithium') || lowerContent.includes('anode')) {
      detectedDomain = 'Energy & Materials';
    } else if (lowerContent.includes('pressure') || lowerContent.includes('mechanical') || lowerContent.includes('clamping') || lowerContent.includes('compression')) {
      detectedDomain = 'Mechanical Engineering';
    }
    
    const conceptName = title.trim() || `Concept ${get().concepts.length + 1}`;
    const newConcept: Concept = {
      id: `c-${Date.now()}`,
      userId: 'user-default',
      canonicalName: conceptName,
      aliases: [],
      description: content.slice(0, 160) + (content.length > 160 ? '...' : ''),
      domainCategory: detectedDomain,
      color: '#8B5CF6',
      createdAt: new Date().toISOString()
    };

    const updatedConcepts = [...get().concepts, newConcept];
    let updatedRelationships = [...get().relationships];

    // If there is an existing concept in the same domain, create an associated relationship
    const sameDomainConcept = get().concepts.find(c => c.domainCategory === detectedDomain);
    if (sameDomainConcept) {
      updatedRelationships.push({
        id: `rel-${Date.now()}`,
        userId: 'user-default',
        sourceConceptId: newConcept.id,
        targetConceptId: sameDomainConcept.id,
        relationshipType: 'associated_with',
        directional: false,
        confidenceScore: 0.72,
        status: 'proposed',
        rationale: `Both address ${detectedDomain} architectural models extracted from note "${title}".`,
        createdAt: new Date().toISOString(),
      });
    }

    const newDiscoveries = AutonomousDiscoveryEngine.runDiscoveryScan(
      updatedConcepts,
      updatedRelationships,
      'user-default'
    );

    set((state) => ({
      sources: [newSource, ...state.sources],
      concepts: updatedConcepts,
      relationships: updatedRelationships,
      discoveryCandidates: newDiscoveries.length > 0 ? newDiscoveries : state.discoveryCandidates,
      isCaptureModalOpen: false,
      selectedConceptId: newConcept.id
    }));
  },

  promoteDiscoveryToLab: (discoveryId: string) => {
    const discovery = get().discoveryCandidates.find((d) => d.id === discoveryId);
    if (!discovery) return '';

    const investigationId = `inv-${Date.now()}`;
    const newInvestigation: Investigation = {
      id: investigationId,
      userId: 'user-default',
      discoveryId,
      title: `Investigating ${discovery.conceptAName} ↔ ${discovery.conceptBName}`,
      summary: discovery.explanation,
      stage: 'hypothesis',
      hypothesisStatement: `If ${discovery.conceptAName} is applied to the dynamics of ${discovery.conceptBName}, then state consistency will be preserved under communication decay because both share an invariant temporal expiration threshold.`,
      assumptions: [
        'Local clocks maintain acceptable drift drift-bounds (< 50ms)',
        'Signal decay threshold can be modeled monotonically',
        'Partition duration does not exceed timeout TTL'
      ],
      experimentPlan: {
        id: `plan-${Date.now()}`,
        title: 'Empirical Benchmark Protocol',
        methodology: 'Simulate network partition during concurrent read operations; measure stale read frequency vs signal lease expiry.',
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
              experimentPlan: {
                ...inv.experimentPlan,
                title,
                methodology,
                successCriteria: criteria
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
              experimentPlan: {
                ...inv.experimentPlan,
                observations
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
    const newStatus: RelationshipStatus = outcome === 'supported' ? 'accepted' : 'rejected';
    const confidence = outcome === 'supported' ? 0.85 : 0.20;

    let updatedRelationships = [...get().relationships];

    if (discovery) {
      const existingRelIndex = updatedRelationships.findIndex(
        (r) => r.sourceConceptId === discovery.conceptAId && r.targetConceptId === discovery.conceptBId
      );

      if (existingRelIndex >= 0) {
        updatedRelationships[existingRelIndex] = {
          ...updatedRelationships[existingRelIndex],
          status: newStatus,
          confidenceScore: confidence
        };
      } else {
        const newRel: Relationship = {
          id: `rel-${Date.now()}`,
          userId: 'user-default',
          sourceConceptId: discovery.conceptAId,
          targetConceptId: discovery.conceptBId,
          relationshipType: discovery.proposedRelationship,
          directional: true,
          confidenceScore: confidence,
          status: newStatus,
          rationale: `Validated in Discovery Lab (${inv.title}): ${outcome.toUpperCase()}`,
          createdAt: new Date().toISOString()
        };
        updatedRelationships.push(newRel);
      }
    }

    const revision: KnowledgeRevision = {
      id: `rev-${Date.now()}`,
      userId: 'user-default',
      entityType: 'relationship',
      entityId: discovery ? discovery.conceptAId : investigationId,
      previousState: { status: 'proposed' },
      newState: { status: newStatus, outcome },
      reason: `Investigation completed: ${outcome.toUpperCase()}`,
      timestamp: new Date().toISOString()
    };

    set((state) => ({
      relationships: updatedRelationships,
      revisions: [revision, ...state.revisions],
      investigations: state.investigations.map((i) =>
        i.id === investigationId
          ? {
              ...i,
              stage: 'completed',
              experimentPlan: {
                ...i.experimentPlan,
                outcome,
                completedAt: new Date().toISOString()
              },
              updatedAt: new Date().toISOString()
            }
          : i
      ),
      viewMode: 'universe'
    }));
  },

  dismissDiscovery: (discoveryId) => {
    set((state) => ({
      discoveryCandidates: state.discoveryCandidates.map((d) =>
        d.id === discoveryId ? { ...d, status: 'dismissed' } : d
      ),
      selectedDiscoveryId: null
    }));
  },

  pinDiscovery: (discoveryId) => {
    set((state) => ({
      discoveryCandidates: state.discoveryCandidates.map((d) =>
        d.id === discoveryId ? { ...d, status: 'pinned' } : d
      )
    }));
  }
}),
{
  name: 'web-of-thoughts-knowledge-store',
  storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  })),
  partialize: (state) => ({
    sources: state.sources,
    concepts: state.concepts,
    relationships: state.relationships,
    discoveryCandidates: state.discoveryCandidates,
    investigations: state.investigations,
    revisions: state.revisions,
  }),
}
));
