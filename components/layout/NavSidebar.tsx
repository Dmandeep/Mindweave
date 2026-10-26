'use client';

import React from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  Sparkles, 
  FlaskConical, 
  Filter, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  HelpCircle,
  Pin,
  X,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal
} from 'lucide-react';

export const NavSidebar: React.FC = () => {
  const {
    concepts,
    relationships,
    discoveryCandidates,
    investigations,
    selectedDiscoveryId,
    selectDiscovery,
    promoteDiscoveryToLab,
    dismissDiscovery,
    pinDiscovery,
    selectedDomainFilter,
    setSelectedDomainFilter,
    viewMode,
    setViewMode,
    setActiveInvestigation
  } = useKnowledgeStore();

  // Extract unique domains from concepts
  const domains = Array.from(new Set(concepts.map((c) => c.domainCategory)));

  // Filter discoveries (show unread and pinned by default)
  const activeDiscoveries = discoveryCandidates.filter(
    (d) => d.status === 'unread' || d.status === 'pinned' || d.status === 'investigating'
  );

  const acceptedCount = relationships.filter((r) => r.status === 'accepted').length;
  const proposedCount = relationships.filter((r) => r.status === 'proposed').length;
  const disputedCount = relationships.filter((r) => r.status === 'disputed').length;

  return (
    <aside className="w-64 border-r border-border bg-cosmic-900 flex flex-col h-[calc(100vh-3.5rem)] select-none">
      {/* Sidebar Header / Navigation Tabs */}
      <div className="p-3 border-b border-border flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-discovery" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            Discovery Queue
          </span>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-discovery/20 text-discovery-light border border-discovery/30 font-bold">
          {activeDiscoveries.length}
        </span>
      </div>

      {/* Discovery Feed Section */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {activeDiscoveries.length === 0 ? (
          <div className="text-center py-8 px-2 text-text-muted text-xs">
            <Sparkles className="w-6 h-6 mx-auto mb-2 text-text-muted/40" />
            <p className="font-medium text-text-secondary">Queue clear</p>
            <p className="text-[11px] mt-1">Capture more notes to trigger autonomous cross-domain bridge scans.</p>
          </div>
        ) : (
          activeDiscoveries.map((disc) => {
            const isSelected = selectedDiscoveryId === disc.id;
            return (
              <div
                key={disc.id}
                onClick={() => selectDiscovery(disc.id)}
                className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                  isSelected
                    ? 'bg-cosmic-800 border-discovery shadow-md shadow-discovery/15 ring-1 ring-discovery/40'
                    : 'bg-cosmic-950/60 border-border hover:bg-cosmic-800/80 hover:border-border-strong'
                }`}
              >
                {/* Discovery Type & Novelty Badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-discovery/15 text-discovery-light border border-discovery/25">
                    {disc.discoveryType.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center space-x-1">
                    <span className="text-[10px] font-mono text-discovery font-semibold">
                      {Math.round(disc.compositeScore * 100)}%
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        pinDiscovery(disc.id);
                      }}
                      className={`p-0.5 rounded hover:text-discovery transition-colors ${
                        disc.status === 'pinned' ? 'text-discovery' : 'text-text-muted opacity-0 group-hover:opacity-100'
                      }`}
                      title="Pin Discovery"
                    >
                      <Pin className="w-3 h-3" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dismissDiscovery(disc.id);
                      }}
                      className="p-0.5 rounded text-text-muted hover:text-conflict opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Connected Bridge Names */}
                <div className="text-xs font-semibold text-text-primary leading-tight mb-1">
                  <span className="text-causal">{disc.conceptAName}</span>
                  <span className="text-text-muted mx-1">↔</span>
                  <span className="text-discovery-light">{disc.conceptBName}</span>
                </div>

                {/* Rationale Snippet */}
                <p className="text-[11px] text-text-secondary leading-snug line-clamp-2">
                  {disc.explanation}
                </p>

                {/* Quick Lab Promotion CTA */}
                <div className="mt-2.5 pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[10px] text-text-muted font-mono">
                    {disc.conceptADomain} • {disc.conceptBDomain}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      promoteDiscoveryToLab(disc.id);
                    }}
                    className="flex items-center space-x-1 text-[11px] font-medium text-discovery hover:text-discovery-light transition-colors"
                  >
                    <span>Investigate</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })
        )}

        {/* Active Investigations Section */}
        {investigations.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted font-semibold">
                Active Investigations ({investigations.length})
              </span>
            </div>
            <div className="space-y-1.5">
              {investigations.map((inv) => (
                <div
                  key={inv.id}
                  onClick={() => setActiveInvestigation(inv.id)}
                  className="p-2 rounded bg-cosmic-950 border border-border hover:border-discovery/40 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div className="truncate pr-2">
                    <p className="text-xs font-medium text-text-primary truncate">{inv.title}</p>
                    <p className="text-[10px] text-text-muted font-mono capitalize">
                      Stage: {inv.stage}
                    </p>
                  </div>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${
                    inv.stage === 'completed'
                      ? 'bg-verified/15 text-verified border-verified/30'
                      : 'bg-discovery/15 text-discovery-light border-discovery/30 animate-pulse'
                  }`}>
                    {inv.stage === 'completed' ? 'Done' : 'Active'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Domain Filters & Knowledge Metrics */}
      <div className="p-3 border-t border-border bg-cosmic-950/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted flex items-center space-x-1 font-semibold">
            <Filter className="w-3 h-3" />
            <span>Domains</span>
          </span>
          {selectedDomainFilter && (
            <button
              onClick={() => setSelectedDomainFilter(null)}
              className="text-[10px] text-discovery hover:underline"
            >
              Reset
            </button>
          )}
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto pr-1">
          <button
            onClick={() => setSelectedDomainFilter(null)}
            className={`text-[10px] px-2 py-0.5 rounded-full transition-all border ${
              selectedDomainFilter === null
                ? 'bg-discovery/20 text-discovery-light border-discovery/40 font-semibold'
                : 'bg-cosmic-800 text-text-muted border-border hover:text-text-secondary'
            }`}
          >
            All ({concepts.length})
          </button>
          {domains.map((dom) => {
            const count = concepts.filter((c) => c.domainCategory === dom).length;
            const isSelected = selectedDomainFilter === dom;
            return (
              <button
                key={dom}
                onClick={() => setSelectedDomainFilter(isSelected ? null : dom)}
                className={`text-[10px] px-2 py-0.5 rounded-full transition-all border ${
                  isSelected
                    ? 'bg-discovery/20 text-discovery-light border-discovery/40 font-semibold'
                    : 'bg-cosmic-800 text-text-muted border-border hover:text-text-secondary'
                }`}
              >
                {dom} ({count})
              </button>
            );
          })}
        </div>

        {/* Epistemic Status Metrics Bar */}
        <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between text-[10px] font-mono text-text-muted">
          <span className="flex items-center space-x-1" title="Accepted Relationships">
            <CheckCircle2 className="w-3 h-3 text-verified" />
            <span>{acceptedCount}</span>
          </span>
          <span className="flex items-center space-x-1" title="Proposed by AI">
            <HelpCircle className="w-3 h-3 text-discovery-light" />
            <span>{proposedCount}</span>
          </span>
          <span className="flex items-center space-x-1" title="Disputed or Conflicted">
            <AlertCircle className="w-3 h-3 text-conflict" />
            <span>{disputedCount}</span>
          </span>
        </div>
      </div>
    </aside>
  );
};
