'use client';

import React, { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, getBezierPath, EdgeProps } from '@xyflow/react';
import { Relationship } from '@/types/knowledge';

export interface TypedEdgeData {
  relationship: Relationship;
  isSelected?: boolean;
}

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
  const strokeWidth = isSelected ? 2.5 : 1.5;

  const strokeColor = isSelected 
    ? '#315FE9' 
    : isProposed 
    ? '#E97942' 
    : 'rgba(37, 37, 37, 0.40)';

  const strokeStyle = {
    ...style,
    stroke: strokeColor,
    strokeWidth,
    strokeDasharray: isProposed ? '5,5' : undefined,
    opacity: isSelected ? 1 : 0.85,
    transition: 'stroke 0.2s cubic-bezier(0.16, 1, 0.3, 1), stroke-width 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  };

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
          className={`
            px-2 py-0.5 rounded text-[10px] font-mono tracking-tight select-none cursor-pointer transition-all duration-150
            border backdrop-blur-xs
            ${
              isSelected
                ? 'bg-[#F6F9FF] border-royal text-royal shadow-sm ring-1 ring-royal/30'
                : 'bg-[#FCFAF5] border-ink/12 text-ink-muted hover:text-ink hover:border-ink/30 hover:shadow-xs'
            }
          `}
        >
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                isSelected
                  ? 'bg-royal scale-125'
                  : isProposed
                  ? 'bg-tangerine'
                  : 'bg-ink/40'
              }`}
            />
            <span className="capitalize">{relType.replace(/_/g, ' ')}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
});

TypedEdge.displayName = 'TypedEdge';
