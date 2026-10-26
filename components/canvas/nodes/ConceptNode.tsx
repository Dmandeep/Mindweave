'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Concept } from '@/types/knowledge';

export interface ConceptNodeData {
  concept: Concept;
  connectionCount: number;
  isSelected?: boolean;
}

export const ConceptNode = memo(({ data, selected }: { data: ConceptNodeData; selected?: boolean }) => {
  const { concept, connectionCount, isSelected: propSelected } = data;
  const isSelected = selected || propSelected;

  return (
    <div
      className={`
        relative group rounded-lg p-3.5 w-60 text-left transition-all duration-200
        border backdrop-blur-xs
        ${
          isSelected
            ? 'bg-[#F6F9FF] border-royal ring-2 ring-royal/25 shadow-selected scale-[1.015]'
            : 'bg-[#FCFAF5] border-ink/12 hover:border-ink/25 hover:shadow-card-hover hover:-translate-y-0.5'
        }
      `}
    >
      {/* 4 Connection Handles with Subtle Hover Elevation */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-ink/35 !border-[#FCFAF5] hover:!bg-royal hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-ink/35 !border-[#FCFAF5] hover:!bg-royal hover:scale-125 transition-all"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-ink/35 !border-[#FCFAF5] hover:!bg-royal hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-ink/35 !border-[#FCFAF5] hover:!bg-royal hover:scale-125 transition-all"
      />

      {/* Domain Badge & Connection Metric */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-royal shrink-0" />
          <span className="text-[10px] font-mono tracking-wide uppercase text-ink-muted truncate max-w-[130px]">
            {concept.domainCategory}
          </span>
        </div>
        <span className="text-[9px] font-mono text-ink-secondary px-1.5 py-0.5 rounded bg-[#FAF7F0] border border-ink/10 shadow-2xs">
          {connectionCount} {connectionCount === 1 ? 'edge' : 'edges'}
        </span>
      </div>

      {/* Canonical Concept Title */}
      <h4 className="text-xs font-semibold text-ink-primary tracking-tight leading-snug truncate group-hover:text-royal transition-colors">
        {concept.canonicalName}
      </h4>

      {/* Concise Description */}
      <p className="text-[11px] text-ink-secondary mt-1 line-clamp-2 leading-relaxed">
        {concept.description}
      </p>
    </div>
  );
});

ConceptNode.displayName = 'ConceptNode';
