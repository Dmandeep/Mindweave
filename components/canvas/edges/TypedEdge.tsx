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
  const strokeWidth = isSelected ? 2.8 : isProposed ? 2 : 1.6;

  const strokeColor = isSelected 
    ? '#315FE9' 
    : isProposed 
    ? '#E97942' 
    : 'rgba(37, 37, 37, 0.45)';

  const strokeStyle = {
    ...style,
    stroke: strokeColor,
    strokeWidth,
    strokeDasharray: isProposed || isSelected ? '6,6' : undefined,
    opacity: isSelected ? 1 : 0.85,
    filter: isSelected ? 'drop-shadow(0 0 5px rgba(49, 95, 233, 0.5))' : undefined,
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
  };

  return (
    <>
      <BaseEdge 
        id={id} 
        path={edgePath} 
        style={strokeStyle} 
        markerEnd={markerEnd}
        className={isSelected || isProposed ? 'animate-edge-flow' : undefined}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className={`
            px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-tight select-none cursor-pointer transition-all duration-200
            border shadow-xs backdrop-blur-xs
            ${
              isSelected
                ? 'bg-[#EFF6FF] border-royal text-royal shadow-sm ring-2 ring-royal/30 font-semibold scale-110'
                : isProposed
                ? 'bg-[#FFF7ED] border-tangerine text-tangerine shadow-xs ring-1 ring-tangerine/30 font-medium hover:scale-105'
                : 'bg-[#FCFAF5] border-ink/15 text-ink-secondary hover:text-ink hover:border-ink/40 hover:shadow-sm hover:scale-105'
            }
          `}
        >
          <div className="flex items-center space-x-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-transform ${
                isSelected
                  ? 'bg-royal scale-125'
                  : isProposed
                  ? 'bg-tangerine animate-ping'
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
