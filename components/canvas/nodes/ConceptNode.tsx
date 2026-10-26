'use client';

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { Concept } from '@/types/knowledge';

export interface ConceptNodeData {
  concept: Concept;
  connectionCount: number;
  isSelected?: boolean;
}

// Distinct, vibrant domain theme specifications for each field of inquiry
export interface DomainColorSpec {
  bg: string;
  border: string;
  borderHover: string;
  topStripe: string;
  pillBg: string;
  pillText: string;
  pillBorder: string;
  dotColor: string;
  glowHover: string;
}

export const DOMAIN_COLOR_MAP: Record<string, DomainColorSpec> = {
  'Distributed Systems': {
    bg: 'bg-[#F0F5FF]',
    border: 'border-[#315FE9]/30',
    borderHover: 'hover:border-[#315FE9]/80',
    topStripe: 'bg-[#315FE9]',
    pillBg: 'bg-[#DBEAFE]',
    pillText: 'text-[#1D4ED8]',
    pillBorder: 'border-[#93C5FD]',
    dotColor: '#315FE9',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(49,95,233,0.18)]',
  },
  'Evolutionary Biology': {
    bg: 'bg-[#FFF7ED]',
    border: 'border-[#E97942]/35',
    borderHover: 'hover:border-[#E97942]/80',
    topStripe: 'bg-[#E97942]',
    pillBg: 'bg-[#FFEDD5]',
    pillText: 'text-[#C2410C]',
    pillBorder: 'border-[#FDBA74]',
    dotColor: '#E97942',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(233,121,66,0.18)]',
  },
  'Energy & Materials': {
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#7C3AED]/30',
    borderHover: 'hover:border-[#7C3AED]/80',
    topStripe: 'bg-[#7C3AED]',
    pillBg: 'bg-[#EDE9FE]',
    pillText: 'text-[#6D28D9]',
    pillBorder: 'border-[#C4B5FD]',
    dotColor: '#7C3AED',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(124,58,237,0.18)]',
  },
  'Materials Science': {
    bg: 'bg-[#F5F3FF]',
    border: 'border-[#7C3AED]/30',
    borderHover: 'hover:border-[#7C3AED]/80',
    topStripe: 'bg-[#7C3AED]',
    pillBg: 'bg-[#EDE9FE]',
    pillText: 'text-[#6D28D9]',
    pillBorder: 'border-[#C4B5FD]',
    dotColor: '#7C3AED',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(124,58,237,0.18)]',
  },
  'Immunology': {
    bg: 'bg-[#FEF2F2]',
    border: 'border-[#EF4444]/35',
    borderHover: 'hover:border-[#EF4444]/80',
    topStripe: 'bg-[#EF4444]',
    pillBg: 'bg-[#FEE2E2]',
    pillText: 'text-[#B91C1C]',
    pillBorder: 'border-[#FCA5A5]',
    dotColor: '#EF4444',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(239,68,68,0.18)]',
  },
  'Neurobiology': {
    bg: 'bg-[#ECFEFF]',
    border: 'border-[#06B6D4]/35',
    borderHover: 'hover:border-[#06B6D4]/80',
    topStripe: 'bg-[#06B6D4]',
    pillBg: 'bg-[#CFFAFE]',
    pillText: 'text-[#0E7490]',
    pillBorder: 'border-[#67E8F9]',
    dotColor: '#06B6D4',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(6,182,212,0.18)]',
  },
  'Neuroscience': {
    bg: 'bg-[#ECFEFF]',
    border: 'border-[#06B6D4]/35',
    borderHover: 'hover:border-[#06B6D4]/80',
    topStripe: 'bg-[#06B6D4]',
    pillBg: 'bg-[#CFFAFE]',
    pillText: 'text-[#0E7490]',
    pillBorder: 'border-[#67E8F9]',
    dotColor: '#06B6D4',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(6,182,212,0.18)]',
  },
  'Macroeconomics': {
    bg: 'bg-[#F0FDF4]',
    border: 'border-[#10B981]/30',
    borderHover: 'hover:border-[#10B981]/80',
    topStripe: 'bg-[#10B981]',
    pillBg: 'bg-[#DCFCE7]',
    pillText: 'text-[#15803D]',
    pillBorder: 'border-[#86EFAC]',
    dotColor: '#10B981',
    glowHover: 'hover:shadow-[0_8px_24px_rgba(16,185,129,0.18)]',
  },
};

const DEFAULT_COLOR_SPEC: DomainColorSpec = {
  bg: 'bg-[#F8FAFC]',
  border: 'border-[#64748B]/30',
  borderHover: 'hover:border-[#64748B]/80',
  topStripe: 'bg-[#64748B]',
  pillBg: 'bg-[#F1F5F9]',
  pillText: 'text-[#334155]',
  pillBorder: 'border-[#CBD5E1]',
  dotColor: '#64748B',
  glowHover: 'hover:shadow-[0_8px_24px_rgba(100,116,139,0.18)]',
};

export const ConceptNode = memo(({ data, selected }: { data: ConceptNodeData; selected?: boolean }) => {
  const { concept, connectionCount, isSelected: propSelected } = data;
  const isSelected = selected || propSelected;

  const colorSpec = DOMAIN_COLOR_MAP[concept.domainCategory] || DEFAULT_COLOR_SPEC;

  return (
    <div
      className={`
        relative group rounded-xl pt-1.5 pb-3.5 px-3.5 w-64 text-left transition-all duration-200
        border overflow-hidden
        ${colorSpec.bg}
        ${
          isSelected
            ? 'border-royal ring-2 ring-royal/40 shadow-[0_8px_28px_rgba(49,95,233,0.22)] scale-[1.02]'
            : `${colorSpec.border} ${colorSpec.borderHover} ${colorSpec.glowHover} shadow-sm hover:-translate-y-1`
        }
      `}
    >
      {/* Domain Color Top Stripe Indicator */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${colorSpec.topStripe}`} />

      {/* 4 Connection Handles with Hover Glowing States */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-2 !h-2 !bg-ink/40 !border-white hover:!bg-royal hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-2 !h-2 !bg-ink/40 !border-white hover:!bg-royal hover:scale-125 transition-all"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-ink/40 !border-white hover:!bg-royal hover:scale-125 transition-all"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-ink/40 !border-white hover:!bg-royal hover:scale-125 transition-all"
      />

      {/* Domain Chip & Connection Count Pill */}
      <div className="flex items-center justify-between mb-2 mt-1">
        <div className="flex items-center space-x-1.5">
          <span 
            className="w-2 h-2 rounded-full shrink-0 shadow-xs" 
            style={{ backgroundColor: colorSpec.dotColor }}
          />
          <span className={`text-[10px] font-mono tracking-wider font-semibold uppercase px-1.5 py-0.5 rounded border ${colorSpec.pillBg} ${colorSpec.pillText} ${colorSpec.pillBorder} truncate max-w-[130px]`}>
            {concept.domainCategory}
          </span>
        </div>
        <span className="text-[9px] font-mono text-ink-secondary px-2 py-0.5 rounded-full bg-white/80 border border-ink/10 shadow-2xs font-semibold">
          {connectionCount} {connectionCount === 1 ? 'edge' : 'edges'}
        </span>
      </div>

      {/* Canonical Concept Title */}
      <h4 className="text-xs font-bold text-ink-primary tracking-tight leading-snug group-hover:text-royal transition-colors">
        {concept.canonicalName}
      </h4>

      {/* Concise Description */}
      <p className="text-[11px] text-ink-secondary mt-1.5 line-clamp-2 leading-relaxed opacity-90">
        {concept.description}
      </p>
    </div>
  );
});

ConceptNode.displayName = 'ConceptNode';
