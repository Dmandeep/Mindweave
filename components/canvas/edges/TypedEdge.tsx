'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';
import { Relationship, RelationshipType } from '@/types/knowledge';

export interface TypedEdgeData {
  relationship: Relationship;
  isSelected?: boolean;
}

const TYPE_COLORS: Record<RelationshipType, { stroke: string; labelBg: string; labelText: string; labelBorder: string }> = {
  causes: {
    stroke: '#06B6D4', // cyan-500
    labelBg: 'bg-cyan-950/80',
    labelText: 'text-cyan-300',
    labelBorder: 'border-cyan-500/40',
  },
  contradicts: {
    stroke: '#F43F5E', // rose-500
    labelBg: 'bg-rose-950/80',
    labelText: 'text-rose-300',
    labelBorder: 'border-rose-500/40',
  },
  analogous_to: {
    stroke: '#8B5CF6', // discovery-500
    labelBg: 'bg-discovery-950/80',
    labelText: 'text-discovery-300',
    labelBorder: 'border-discovery-500/40',
  },
  enables: {
    stroke: '#10B981', // emerald-500
    labelBg: 'bg-emerald-950/80',
    labelText: 'text-emerald-300',
    labelBorder: 'border-emerald-500/40',
  },
  inhibits: {
    stroke: '#F59E0B', // amber-500
    labelBg: 'bg-amber-950/80',
    labelText: 'text-amber-300',
    labelBorder: 'border-amber-500/40',
  },
  depends_on: {
    stroke: '#38BDF8', // sky-400
    labelBg: 'bg-sky-950/80',
    labelText: 'text-sky-300',
    labelBorder: 'border-sky-500/40',
  },
  is_a: {
    stroke: '#A855F7', // purple-500
    labelBg: 'bg-purple-950/80',
    labelText: 'text-purple-300',
    labelBorder: 'border-purple-500/40',
  },
  associated_with: {
    stroke: '#94A3B8', // slate-400
    labelBg: 'bg-slate-900/80',
    labelText: 'text-slate-300',
    labelBorder: 'border-slate-500/40',
  },
};

export const TypedEdge = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) => {
  const edgeData = data as TypedEdgeData | undefined;
  const relationship = edgeData?.relationship;
  const relType = relationship?.relationshipType || 'associated_with';
  const theme = TYPE_COLORS[relType] || TYPE_COLORS.associated_with;
  const isSelected = selected || edgeData?.isSelected;

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isProposed = relationship?.status === 'proposed';

  const strokeWidth = isSelected ? 3 : 1.75;
  const strokeStyle = {
    ...style,
    stroke: theme.stroke,
    strokeWidth,
    strokeDasharray: isProposed ? '5,5' : undefined,
    filter: isSelected ? `drop-shadow(0 0 6px ${theme.stroke})` : undefined,
  };

  const formattedType = relType.replace(/_/g, ' ');

  return (
    <>
      <BaseEdge id={id} path={edgePath} style={strokeStyle} markerEnd={markerEnd} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`
              flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-tight font-medium
              backdrop-blur-md border shadow-sm transition-all duration-200 cursor-pointer
              ${theme.labelBg} ${theme.labelText} ${theme.labelBorder}
              ${isSelected ? 'scale-110 shadow-md ring-1 ring-white/30' : 'hover:scale-105'}
            `}
          >
            <span>{formattedType}</span>
            {relationship && (
              <span className="opacity-70 text-[9px] border-l border-current/30 pl-1">
                {Math.round(relationship.confidenceScore * 100)}%
              </span>
            )}
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

TypedEdge.displayName = 'TypedEdge';
