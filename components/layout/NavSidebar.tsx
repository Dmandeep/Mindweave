'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  Sparkles, 
  FlaskConical, 
  Pin, 
  X, 
  Layers, 
} from 'lucide-react';

export const NavSidebar: React.FC = () => {
  const {
    concepts,
    relationships,
    discoveryCandidates,
    selectedDiscoveryId,
    selectDiscovery,
    pinDiscovery,
    dismissDiscovery,
    selectedDomainFilter,
    setSelectedDomainFilter,
  } = useKnowledgeStore();

  const [activeTab, setActiveTab] = useState<'discoveries' | 'domains'>('discoveries');

  // Extract unique domains from concepts
  const domains = Array.from(new Set(concepts.map((c) => c.domainCategory)));

  // Active discoveries in feed
  const activeDiscoveries = discoveryCandidates.filter(
    (d) => d.status === 'unread' || d.status === 'pinned' || d.status === 'investigating'
  );

  return (
    <aside className="w-60 border-r border-ink/10 bg-[#FCFAF5] flex flex-col h-[calc(100vh-3rem)] select-none shrink-0 hidden md:flex">
      {/* Sidebar Mode Tabs */}
      <div className="p-2 border-b border-ink/10 flex items-center gap-1 bg-[#FAF7F0]">
        <button
          onClick={() => setActiveTab('discoveries')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'discoveries'
              ? 'bg-[#FCFAF5] text-ink border border-ink/10 shadow-xs font-semibold'
              : 'text-ink-muted hover:text-ink hover:bg-[#F3EDE0]/50'
          }`}
        >
          <Sparkles className="w-3 h-3 text-tangerine" />
          <span>Queue ({activeDiscoveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`flex-1 py-1 px-2 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 transition-all ${
            activeTab === 'domains'
              ? 'bg-[#FCFAF5] text-ink border border-ink/10 shadow-xs font-semibold'
              : 'text-ink-muted hover:text-ink hover:bg-[#F3EDE0]/50'
          }`}
        >
          <Layers className="w-3 h-3 text-royal" />
          <span>Domains ({domains.length})</span>
        </button>
      </div>

      {/* Tab 1: Discovery Queue */}
      {activeTab === 'discoveries' && (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-2">
          {activeDiscoveries.length === 0 ? (
            <div className="text-center py-10 px-3 text-ink-muted text-xs animate-fade-in">
              <Sparkles className="w-5 h-5 mx-auto mb-2 text-ink-faint" />
              <p className="font-medium text-ink-secondary">Queue clear</p>
              <p className="text-[11px] mt-1 text-ink-muted">
                Capture new notes to generate candidate bridges across concepts.
              </p>
            </div>
          ) : (
            activeDiscoveries.map((disc) => {
              const isSelected = selectedDiscoveryId === disc.id;
              const isPinned = disc.status === 'pinned';
              const isInLab = disc.status === 'investigating';

              const queueBgMap: Record<string, string> = {
                cross_domain_analogy: 'bg-[#F0F5FF] border-[#315FE9]/25 hover:border-[#315FE9]/60',
                paradox_or_tension: 'bg-[#FFF7ED] border-[#E97942]/30 hover:border-[#E97942]/70',
                structural_gap: 'bg-[#F5F3FF] border-[#7C3AED]/25 hover:border-[#7C3AED]/60',
                emergent_synthesis: 'bg-[#F0FDF4] border-[#10B981]/25 hover:border-[#10B981]/60',
              };
              const queueBg = queueBgMap[disc.discoveryType] || 'bg-[#FAF7F0] border-ink/10 hover:border-ink/25';

              return (
                <div
                  key={disc.id}
                  onClick={() => selectDiscovery(disc.id)}
                  className={`p-2.5 rounded-lg border transition-all duration-200 cursor-pointer relative group ${
                    isSelected
                      ? 'border-royal ring-2 ring-royal/35 shadow-md scale-[1.01] bg-[#EFF6FF]'
                      : `${queueBg} hover:shadow-card hover:-translate-y-0.5`
                  }`}
                >
                  {/* Top metadata */}
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] font-mono uppercase tracking-wider text-ink-muted truncate max-w-[120px]">
                      {disc.discoveryType.replace(/_/g, ' ')}
                    </span>
                    <div className="flex items-center space-x-1">
                      <span className="text-[10px] font-mono font-bold text-royal">
                        {Math.round(disc.compositeScore * 100)}%
                      </span>
                      {isPinned && <Pin className="w-2.5 h-2.5 text-tangerine fill-tangerine" />}
                      {isInLab && <FlaskConical className="w-2.5 h-2.5 text-royal" />}
                    </div>
                  </div>

                  {/* Bridge Titles */}
                  <h4 className="text-xs font-semibold text-ink leading-tight mb-1 truncate group-hover:text-royal transition-colors">
                    {disc.conceptAName} <span className="text-tangerine font-bold">↔</span> {disc.conceptBName}
                  </h4>

                  {/* Concise summary */}
                  <p className="text-[11px] text-ink-secondary line-clamp-2 leading-relaxed">
                    {disc.explanation}
                  </p>

                  {/* Quick Action Toolbar on hover */}
                  <div className="mt-2 pt-1.5 border-t border-ink/8 flex items-center justify-between text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pinDiscovery(disc.id);
                      }}
                      className="text-ink-muted hover:text-tangerine flex items-center space-x-0.5"
                    >
                      <Pin className="w-2.5 h-2.5" />
                      <span>{isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissDiscovery(disc.id);
                      }}
                      className="text-ink-muted hover:text-ink flex items-center space-x-0.5"
                    >
                      <X className="w-2.5 h-2.5" />
                      <span>Dismiss</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: Domain Taxonomy */}
      {activeTab === 'domains' && (
        <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
          <button
            onClick={() => setSelectedDomainFilter(null)}
            className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
              selectedDomainFilter === null
                ? 'bg-royal text-white font-medium shadow-card'
                : 'text-ink-secondary hover:bg-[#FAF7F0] hover:text-ink'
            }`}
          >
            <span>All Domains</span>
            <span className="font-mono text-[10px] opacity-75">{concepts.length}</span>
          </button>

          {domains.map((domain) => {
            const count = concepts.filter((c) => c.domainCategory === domain).length;
            const isSelected = selectedDomainFilter === domain;

            return (
              <button
                key={domain}
                onClick={() => setSelectedDomainFilter(domain)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-all ${
                  isSelected
                    ? 'bg-royal text-white font-medium shadow-card'
                    : 'text-ink-secondary hover:bg-[#FAF7F0] hover:text-ink'
                }`}
              >
                <span className="truncate">{domain}</span>
                <span className="font-mono text-[10px] opacity-75">{count}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Graph Density Footer */}
      <div className="p-2.5 border-t border-ink/10 bg-[#FAF7F0] text-[10px] space-y-1">
        <div className="flex items-center justify-between text-ink-muted font-mono">
          <span>Graph Density</span>
          <span className="font-semibold text-royal">
            {(relationships.length / (concepts.length || 1)).toFixed(2)} edges/node
          </span>
        </div>
        <div className="w-full bg-[#EAE0CD] rounded-full h-1 overflow-hidden">
          <div 
            className="bg-royal h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (relationships.length / (concepts.length || 1)) * 40)}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
