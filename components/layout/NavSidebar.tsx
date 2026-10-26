'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  Sparkles, 
  FlaskConical, 
  Filter, 
  Pin, 
  X, 
  Layers, 
  CheckCircle2, 
  Activity
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
    viewMode,
  } = useKnowledgeStore();

  const [activeTab, setActiveTab] = useState<'discoveries' | 'domains'>('discoveries');

  // Extract unique domains from concepts
  const domains = Array.from(new Set(concepts.map((c) => c.domainCategory)));

  // Active discoveries in feed
  const activeDiscoveries = discoveryCandidates.filter(
    (d) => d.status === 'unread' || d.status === 'pinned' || d.status === 'investigating'
  );

  return (
    <aside className="w-60 border-r border-ink/10 bg-white flex flex-col h-[calc(100vh-3rem)] select-none shrink-0 hidden md:flex">
      {/* Sidebar Mode Tabs */}
      <div className="p-2 border-b border-ink/10 flex items-center gap-1 bg-cream-100">
        <button
          onClick={() => setActiveTab('discoveries')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
            activeTab === 'discoveries'
              ? 'bg-white text-ink-primary border border-ink/10 shadow-xs'
              : 'text-ink-muted hover:text-ink-primary'
          }`}
        >
          <Sparkles className="w-3 h-3 text-tangerine" />
          <span>Queue ({activeDiscoveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('domains')}
          className={`flex-1 py-1 px-2 rounded text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors ${
            activeTab === 'domains'
              ? 'bg-white text-ink-primary border border-ink/10 shadow-xs'
              : 'text-ink-muted hover:text-ink-primary'
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

              return (
                <div
                  key={disc.id}
                  onClick={() => selectDiscovery(disc.id)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-cream-100 border-royal shadow-xs ring-1 ring-royal/30'
                      : 'bg-cream-50 border-ink/10 hover:bg-cream-100 hover:border-ink/20'
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
                  <h4 className="text-xs font-semibold text-ink-primary leading-tight mb-1 truncate">
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
                      className="text-ink-muted hover:text-ink-primary flex items-center space-x-0.5"
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
            className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
              selectedDomainFilter === null
                ? 'bg-royal text-white font-medium shadow-xs'
                : 'text-ink-secondary hover:bg-cream-100 hover:text-ink-primary'
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
                className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs flex items-center justify-between transition-colors ${
                  isSelected
                    ? 'bg-royal text-white font-medium shadow-xs'
                    : 'text-ink-secondary hover:bg-cream-100 hover:text-ink-primary'
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
      <div className="p-2.5 border-t border-ink/10 bg-cream-100 text-[10px] space-y-1">
        <div className="flex items-center justify-between text-ink-muted font-mono">
          <span>Graph Density</span>
          <span className="font-semibold text-royal">
            {(relationships.length / (concepts.length || 1)).toFixed(2)} edges/node
          </span>
        </div>
        <div className="w-full bg-cream-300 rounded-full h-1 overflow-hidden">
          <div 
            className="bg-royal h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (relationships.length / (concepts.length || 1)) * 40)}%` }}
          />
        </div>
      </div>
    </aside>
  );
};
