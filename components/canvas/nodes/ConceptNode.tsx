'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Layers, Network } from 'lucide-react';
import { Concept } from '@/types/knowledge';

export interface ConceptNodeData {
  concept: Concept;
  connectionCount: number;
  isSelected?: boolean;
}

const DOMAIN_ACCENTS: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  'Distributed Systems': {
    border: 'border-cyan-500/40 hover:border-cyan-400',
    bg: 'from-cyan-950/40 to-cosmic-900/90',
    text: 'text-cyan-300',
    badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
  },
  'Neuroscience': {
    border: 'border-emerald-500/40 hover:border-emerald-400',
    bg: 'from-emerald-950/40 to-cosmic-900/90',
    text: 'text-emerald-300',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  },
  'Materials Science': {
    border: 'border-amber-500/40 hover:border-amber-400',
    bg: 'from-amber-950/40 to-cosmic-900/90',
    text: 'text-amber-300',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  },
  'Macroeconomics': {
    border: 'border-rose-500/40 hover:border-rose-400',
    bg: 'from-rose-950/40 to-cosmic-900/90',
    text: 'text-rose-300',
    badge: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  },
  'Default': {
    border: 'border-discovery-500/40 hover:border-discovery-400',
    bg: 'from-discovery-950/40 to-cosmic-900/90',
    text: 'text-discovery-300',
    badge: 'bg-discovery-500/10 text-discovery-400 border-discovery-500/30',
  },
};

export const ConceptNode = memo(({ data, selected }: { data: ConceptNodeData; selected?: boolean }) => {
  const { concept, connectionCount, isSelected: propSelected } = data;
  const isSelected = selected || propSelected;
  const domainTheme = DOMAIN_ACCENTS[concept.domainCategory] || DOMAIN_ACCENTS['Default'];

  return (
    <div
      className={`
        relative group rounded-xl p-3.5 w-64 text-left transition-all duration-200
        bg-gradient-to-b ${domainTheme.bg}
        backdrop-blur-md shadow-lg
        border ${domainTheme.border}
        ${isSelected ? 'ring-2 ring-discovery-400 ring-offset-2 ring-offset-cosmic-950 shadow-discovery-500/20' : 'hover:shadow-md'}
      `}
    >
      {/* 4 Directional Connection Handles */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-cosmic-400 !border-cosmic-900 hover:!bg-discovery-400 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-cosmic-400 !border-cosmic-900 hover:!bg-discovery-400 transition-colors"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-cosmic-400 !border-cosmic-900 hover:!bg-discovery-400 transition-colors"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-cosmic-400 !border-cosmic-900 hover:!bg-discovery-400 transition-colors"
      />

      {/* Domain Badge & Connection Counter */}
      <div className="flex items-center justify-between mb-2">
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${domainTheme.badge}`}
        >
          {concept.domainCategory}
        </span>
        <span className="flex items-center gap-1 text-[11px] text-cosmic-400 font-mono">
          <Network className="w-3 h-3 text-cosmic-500" />
          {connectionCount}
        </span>
      </div>

      {/* Canonical Name */}
      <h4 className="text-sm font-semibold text-cosmic-100 group-hover:text-white leading-tight mb-1.5 transition-colors line-clamp-2">
        {concept.canonicalName}
      </h4>

      {/* Description */}
      <p className="text-xs text-cosmic-400 line-clamp-2 leading-relaxed">
        {concept.description}
      </p>

      {/* Aliases pill (if any) */}
      {concept.aliases && concept.aliases.length > 0 && (
        <div className="mt-2.5 pt-2 border-t border-cosmic-800/60 flex items-center gap-1 text-[10px] text-cosmic-400">
          <Layers className="w-3 h-3 text-cosmic-500 shrink-0" />
          <span className="truncate italic">
            aka: {concept.aliases.join(', ')}
          </span>
        </div>
      )}
    </div>
  );
});

ConceptNode.displayName = 'ConceptNode';
