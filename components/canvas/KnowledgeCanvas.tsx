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
import { Sparkles, Compass, Network, Filter } from 'lucide-react';

const nodeTypes = {
  conceptNode: ConceptNode,
};

const edgeTypes = {
  typedEdge: TypedEdge,
};

// Initial position coordinate offsets by domain category for intuitive galactic clustering
const DOMAIN_OFFSETS: Record<string, { x: number; y: number }> = {
  'Distributed Systems': { x: -480, y: -240 },
  'Evolutionary Biology': { x: 240, y: -240 },
  'Immunology': { x: -480, y: 240 },
  'Neurobiology': { x: 240, y: 240 },
  'Energy & Materials': { x: -120, y: -450 },
  'Mechanical Engineering': { x: -120, y: 450 },
  'Neuroscience': { x: 240, y: 240 },
  'Materials Science': { x: -120, y: -450 },
  'Macroeconomics': { x: 480, y: 0 },
};

const CanvasInner: React.FC = () => {
  const {
    concepts,
    relationships,
    selectedConceptId,
    selectedRelationshipId,
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

  // Convert concepts & relationships to React Flow nodes and edges
  const initialNodes: Node[] = useMemo(() => {
    return concepts.map((concept, index) => {
      const connectionCount = relationships.filter(
        (r) => r.sourceConceptId === concept.id || r.targetConceptId === concept.id
      ).length;

      const baseOffset = DOMAIN_OFFSETS[concept.domainCategory] || {
        x: Math.cos((index * 2 * Math.PI) / Math.max(concepts.length, 1)) * 360,
        y: Math.sin((index * 2 * Math.PI) / Math.max(concepts.length, 1)) * 360,
      };

      const domainMatches = concepts.filter((c) => c.domainCategory === concept.domainCategory);
      const domainIndex = domainMatches.findIndex((c) => c.id === concept.id);

      const posX = baseOffset.x + (domainIndex % 2 === 0 ? 0 : 260);
      const posY = baseOffset.y + Math.floor(domainIndex / 2) * 150;

      const matchesSearch =
        !searchQuery ||
        concept.canonicalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        concept.domainCategory.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDomain = !selectedDomainFilter || concept.domainCategory === selectedDomainFilter;
      const isVisible = matchesSearch && matchesDomain;

      return {
        id: concept.id,
        type: 'conceptNode',
        position: { x: posX, y: posY },
        data: {
          concept,
          connectionCount,
          isSelected: selectedConceptId === concept.id,
        },
        style: {
          opacity: isVisible ? 1 : 0.2,
          transition: 'opacity 0.2s ease',
        },
        selected: selectedConceptId === concept.id,
      };
    });
  }, [concepts, relationships, selectedConceptId, selectedDomainFilter, searchQuery]);

  const initialEdges: Edge[] = useMemo(() => {
    return relationships.map((rel) => {
      return {
        id: rel.id,
        source: rel.sourceConceptId,
        target: rel.targetConceptId,
        type: 'typedEdge',
        data: {
          relationship: rel,
          isSelected: selectedRelationshipId === rel.id,
        },
        selected: selectedRelationshipId === rel.id,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: rel.relationshipType === 'contradicts' ? '#F43F5E' : '#8B5CF6',
          width: 14,
          height: 14,
        },
      };
    });
  }, [relationships, selectedRelationshipId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync state when store concepts or relationships change
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  // Handle Node click
  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      selectConcept(node.id);
    },
    [selectConcept]
  );

  // Handle Edge click
  const onEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      selectRelationship(edge.id);
    },
    [selectRelationship]
  );

  // Handle Canvas background click (clear selections)
  const onPaneClick = useCallback(() => {
    selectConcept(null);
    selectRelationship(null);
  }, [selectConcept, selectRelationship]);

  return (
    <div className="relative w-full h-full bg-cosmic-950 overflow-hidden select-none">
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
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        className="touch-none"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#1A243D"
        />
        <Controls
          showInteractive={false}
          className="!bottom-6 !left-6 !bg-cosmic-900/90 !border-cosmic-700/60 !rounded-xl !overflow-hidden !shadow-xl"
        />
        <MiniMap
          nodeStrokeColor="#8B5CF6"
          nodeColor="#131B2E"
          nodeBorderRadius={4}
          maskColor="rgba(8, 12, 20, 0.75)"
          className="!bottom-6 !right-6 !bg-cosmic-900/90 !border-cosmic-700/60 !rounded-xl !shadow-xl !w-44 !h-32 hidden md:block"
        />
      </ReactFlow>

      {/* Canvas Top Bar HUD */}
      <div className="absolute top-4 left-6 right-6 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cosmic-900/80 backdrop-blur-md border border-cosmic-700/60 shadow-lg text-xs text-cosmic-300">
            <Compass className="w-3.5 h-3.5 text-discovery-400 animate-spin-slow" />
            <span className="font-medium text-cosmic-100">Knowledge Universe</span>
            <span className="text-cosmic-500">•</span>
            <span className="font-mono">{concepts.length} Concepts</span>
            <span className="text-cosmic-500">•</span>
            <span className="font-mono">{relationships.length} Links</span>
          </div>

          {selectedDomainFilter && (
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-discovery-500/10 border border-discovery-500/30 text-xs text-discovery-300 backdrop-blur-md">
              <Filter className="w-3 h-3" />
              <span>Filtered: {selectedDomainFilter}</span>
              <button
                onClick={() => setSelectedDomainFilter(null)}
                className="ml-1 text-discovery-400 hover:text-white"
              >
                ×
              </button>
            </div>
          )}
        </div>

        {/* Legend Overlay */}
        <div className="hidden lg:flex items-center gap-4 px-3.5 py-1.5 rounded-lg bg-cosmic-900/80 backdrop-blur-md border border-cosmic-700/60 shadow-lg text-[11px] text-cosmic-400 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
            <span>Causes</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Contradicts</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-discovery-400"></span>
            <span>Analogy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>Enables</span>
          </div>
        </div>
      </div>
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
