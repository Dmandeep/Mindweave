'use client';

import React, { useMemo, useCallback, useEffect, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
} from '@xyflow/react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { ConceptNode } from './nodes/ConceptNode';
import { TypedEdge } from './edges/TypedEdge';
import { Compass, Filter, Layers, X } from 'lucide-react';

const nodeTypes = {
  conceptNode: ConceptNode,
};

const edgeTypes = {
  typedEdge: TypedEdge,
};

const DOMAIN_OFFSETS: Record<string, { x: number; y: number }> = {
  'Distributed Systems': { x: -440, y: -220 },
  'Evolutionary Biology': { x: 220, y: -220 },
  'Immunology': { x: -440, y: 220 },
  'Neurobiology': { x: 220, y: 220 },
  'Energy & Materials': { x: -110, y: -420 },
  'Mechanical Engineering': { x: -110, y: 420 },
  'Neuroscience': { x: 220, y: 220 },
  'Materials Science': { x: -110, y: -420 },
  'Macroeconomics': { x: 440, y: 0 },
};

const CanvasInner: React.FC = () => {
  const {
    concepts,
    relationships,
    discoveryCandidates,
    selectedConceptId,
    selectedRelationshipId,
    selectedDiscoveryId,
    selectedDomainFilter,
    searchQuery,
    selectConcept,
    selectRelationship,
    setSelectedDomainFilter,
  } = useKnowledgeStore();

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  const activeDiscovery = useMemo(() => {
    return discoveryCandidates.find((d) => d.id === selectedDiscoveryId);
  }, [discoveryCandidates, selectedDiscoveryId]);

  // Convert concepts & relationships to React Flow nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    return concepts.map((concept, index) => {
      const connectionCount = relationships.filter(
        (r) => r.sourceConceptId === concept.id || r.targetConceptId === concept.id
      ).length;

      const baseOffset = DOMAIN_OFFSETS[concept.domainCategory] || {
        x: Math.cos((index * 2 * Math.PI) / Math.max(concepts.length, 1)) * 340,
        y: Math.sin((index * 2 * Math.PI) / Math.max(concepts.length, 1)) * 340,
      };

      const domainMatches = concepts.filter((c) => c.domainCategory === concept.domainCategory);
      const domainIndex = domainMatches.findIndex((c) => c.id === concept.id);

      const posX = baseOffset.x + (domainIndex % 2 === 0 ? 0 : 250);
      const posY = baseOffset.y + Math.floor(domainIndex / 2) * 140;

      const isPartOfActiveDiscovery =
        activeDiscovery &&
        (activeDiscovery.conceptAId === concept.id || activeDiscovery.conceptBId === concept.id);

      const isNodeSelected = selectedConceptId === concept.id || !!isPartOfActiveDiscovery;

      const matchesSearch =
        !searchQuery ||
        concept.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.domainCategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain = !selectedDomainFilter || concept.domainCategory === selectedDomainFilter;
      const isVisible = (matchesSearch && matchesDomain) || !!isPartOfActiveDiscovery;

      return {
        id: concept.id,
        type: 'conceptNode',
        position: { x: posX, y: posY },
        data: {
          concept,
          connectionCount,
          isSelected: isNodeSelected,
        },
        selected: isNodeSelected,
        hidden: !isVisible,
      };
    });
  }, [
    concepts,
    relationships,
    selectedConceptId,
    activeDiscovery,
    searchQuery,
    selectedDomainFilter,
  ]);

  const initialEdges: Edge[] = useMemo(() => {
    return relationships.map((rel) => {
      const isSelected = selectedRelationshipId === rel.id;
      const isConnectedToSelectedNode =
        selectedConceptId &&
        (rel.sourceConceptId === selectedConceptId || rel.targetConceptId === selectedConceptId);

      const isPartofActiveDiscovery =
        activeDiscovery &&
        ((rel.sourceConceptId === activeDiscovery.conceptAId && rel.targetConceptId === activeDiscovery.conceptBId) ||
          (rel.sourceConceptId === activeDiscovery.conceptBId && rel.targetConceptId === activeDiscovery.conceptAId));

      const isHighlighted = isSelected || isConnectedToSelectedNode || isPartofActiveDiscovery;

      return {
        id: rel.id,
        source: rel.sourceConceptId,
        target: rel.targetConceptId,
        type: 'typedEdge',
        data: {
          relationship: rel,
          isSelected: isHighlighted,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 12,
          height: 12,
          color: isHighlighted ? '#315FE9' : 'rgba(37, 37, 37, 0.35)',
        },
        animated: isPartofActiveDiscovery || rel.status === 'proposed',
      };
    });
  }, [
    relationships,
    selectedRelationshipId,
    selectedConceptId,
    activeDiscovery,
  ]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectConcept(node.id);
    },
    [selectConcept]
  );

  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectRelationship(edge.id);
    },
    [selectRelationship]
  );

  const onPaneClick = useCallback(() => {
    selectConcept(null);
    selectRelationship(null);
  }, [selectConcept, selectRelationship]);

  return (
    <div className="relative w-full h-full bg-cream overflow-hidden select-none animate-fade-in">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.2}
        maxZoom={2}
        className="touch-none"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.2}
          color="rgba(37, 37, 37, 0.12)"
        />
        <Controls
          showInteractive={false}
          className="!bottom-5 !left-5 !bg-white !border-ink/12 !rounded-md !overflow-hidden !shadow-sm"
        />
        <MiniMap
          nodeStrokeColor="#315FE9"
          nodeColor="#FFFFFF"
          nodeBorderRadius={3}
          maskColor="rgba(250, 247, 240, 0.75)"
          className="!bottom-5 !right-5 !bg-white/90 !border-ink/12 !rounded-md !shadow-sm !w-40 !h-28 hidden md:block"
        />
      </ReactFlow>

      {/* Floating Canvas HUD */}
      <div className="absolute top-3.5 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/95 backdrop-blur-md border border-ink/12 shadow-xs text-xs text-ink-secondary">
            <Compass className="w-3.5 h-3.5 text-royal" />
            <span className="font-semibold text-ink-primary">Knowledge Graph</span>
            <span className="text-ink-faint">•</span>
            <span className="font-mono text-ink-muted">{concepts.length} Concepts</span>
            <span className="text-ink-faint">•</span>
            <span className="font-mono text-ink-muted">{relationships.length} Links</span>
          </div>

          {selectedDomainFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md bg-royal-subtle border border-royal/30 text-xs text-royal backdrop-blur-md font-medium">
              <Filter className="w-3 h-3" />
              <span>{selectedDomainFilter}</span>
              <button
                onClick={() => setSelectedDomainFilter(null)}
                className="ml-1 text-ink-muted hover:text-ink-primary"
                aria-label="Clear filter"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Minimal Legend using Approved 4 Colors */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-md bg-white/95 backdrop-blur-md border border-ink/12 shadow-xs text-[11px] text-ink-secondary pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-royal" />
            <span>Active Edge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-tangerine" />
            <span>Discovery Bridge</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-ink/40" />
            <span>Established Link</span>
          </div>
        </div>
      </div>

      {/* Empty State Overlay */}
      {concepts.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-auto p-6 text-center z-10 bg-cream/90 backdrop-blur-xs animate-fade-in-up">
          <div className="w-12 h-12 rounded-xl bg-white border border-ink/12 flex items-center justify-center text-ink-muted mb-3 shadow-xs">
            <Layers className="w-6 h-6 text-royal" />
          </div>
          <h3 className="text-sm font-semibold text-ink-primary mb-1">Knowledge Universe is Empty</h3>
          <p className="text-xs text-ink-muted max-w-sm mb-4 leading-relaxed">
            Begin by capturing your first research note or observation. The Autonomous Discovery Engine will synthesize connections across your concepts.
          </p>
          <button
            onClick={() => useKnowledgeStore.getState().setCaptureModalOpen(true)}
            className="bg-royal hover:bg-royal-hover text-white text-xs px-3.5 py-1.5 rounded-md font-medium shadow-xs transition-all active:scale-98"
          >
            Capture First Idea
          </button>
        </div>
      )}
    </div>
  );
};

export const KnowledgeCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  );
};
