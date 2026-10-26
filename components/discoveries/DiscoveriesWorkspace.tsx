'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import {
  Sparkles,
  Search,
  Filter,
  Layers,
  ArrowRight,
  Pin,
  X,
  FlaskConical,
  Compass,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  RefreshCw,
  GitCompare,
  TrendingUp,
  Brain,
  Info,
} from 'lucide-react';
import { DiscoveryCandidate, DiscoveryStatus, DiscoveryType } from '@/types/knowledge';

const TYPE_LABELS: Record<DiscoveryType, { label: string; color: string; bg: string; border: string }> = {
  cross_domain_analogy: {
    label: 'Cross-Domain Analogy',
    color: 'text-discovery-300',
    bg: 'bg-discovery-500/10',
    border: 'border-discovery-500/30',
  },
  structural_hole_bridge: {
    label: 'Structural Hole Bridge',
    color: 'text-cyan-300',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
  },
  latent_contradiction: {
    label: 'Latent Contradiction',
    color: 'text-rose-300',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
  },
  knowledge_gap: {
    label: 'Knowledge Gap',
    color: 'text-amber-300',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
  },
  research_question: {
    label: 'Research Question',
    color: 'text-blue-300',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
  },
};

export const DiscoveriesWorkspace: React.FC = () => {
  const {
    discoveryCandidates,
    isScanningDiscoveries,
    lastScanReport,
    triggerDiscoveryScan,
    promoteDiscoveryToLab,
    pinDiscovery,
    rejectDiscovery,
    locateDiscoveryInUniverse,
    selectDiscovery,
    selectedDiscoveryId,
  } = useKnowledgeStore();

  const [statusFilter, setStatusFilter] = useState<'all' | DiscoveryStatus>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | DiscoveryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const handleScan = async () => {
    try {
      await triggerDiscoveryScan();
    } catch (err) {
      console.error('Discovery scan error:', err);
    }
  };

  const handleConfirmReject = (id: string) => {
    rejectDiscovery(id, rejectReason || 'Determined unviable by researcher');
    setRejectingId(null);
    setRejectReason('');
  };

  const filteredCandidates = discoveryCandidates.filter((cand) => {
    if (statusFilter !== 'all' && cand.status !== statusFilter) return false;
    if (typeFilter !== 'all' && cand.discoveryType !== typeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchNameA = cand.conceptAName.toLowerCase().includes(q);
      const matchNameB = cand.conceptBName.toLowerCase().includes(q);
      const matchExpl = cand.explanation.toLowerCase().includes(q);
      if (!matchNameA && !matchNameB && !matchExpl) return false;
    }
    return true;
  });

  const unreadCount = discoveryCandidates.filter((c) => c.status === 'unread').length;
  const pinnedCount = discoveryCandidates.filter((c) => c.status === 'pinned').length;
  const investigatingCount = discoveryCandidates.filter((c) => c.status === 'investigating').length;
  const dismissedCount = discoveryCandidates.filter((c) => c.status === 'dismissed').length;

  return (
    <div className="flex-1 flex flex-col h-full bg-cosmic-950 overflow-hidden select-none">
      {/* Top Banner / HUD Header */}
      <div className="p-6 border-b border-border bg-cosmic-900/40 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-discovery/15 text-discovery border border-discovery/30 font-mono">
                <Sparkles className="w-3 h-3" />
                Phase 2 Engine
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                <ShieldCheck className="w-3 h-3" />
                Policy Verified
              </span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Autonomous Discovery Engine
            </h1>
            <p className="text-xs text-text-muted mt-1 max-w-2xl leading-relaxed">
              Synthesizing cross-domain analogies, structural hole bridges, and latent contradictions across your Knowledge Universe using calibrated Goldilocks semantic intervals.
            </p>
          </div>

          {/* Trigger Scan Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleScan}
              disabled={isScanningDiscoveries}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-xs transition-all shadow-md
                ${
                  isScanningDiscoveries
                    ? 'bg-discovery/40 text-discovery-light cursor-wait'
                    : 'bg-discovery hover:bg-discovery-dark text-white hover:scale-[1.02] shadow-discovery/20'
                }
              `}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningDiscoveries ? 'animate-spin' : ''}`} />
              <span>{isScanningDiscoveries ? 'Scanning Universe...' : 'Find New Discoveries'}</span>
            </button>
          </div>
        </div>

        {/* Scan Telemetry Report Bar */}
        {lastScanReport && (
          <div className="mt-4 p-3 rounded-lg bg-cosmic-950/80 border border-border flex flex-wrap items-center justify-between text-xs text-text-muted font-mono">
            <div className="flex items-center gap-4">
              <span className="text-text-primary font-semibold">Latest Scan Telemetry:</span>
              <span>Scanned Pairs: <strong className="text-foreground">{lastScanReport.totalScannedPairs}</strong></span>
              <span>•</span>
              <span>New Discoveries: <strong className="text-discovery-light">{lastScanReport.newCandidatesCount}</strong></span>
              <span>•</span>
              <span>Updated: <strong className="text-causal-light">{lastScanReport.updatedCandidatesCount}</strong></span>
              <span>•</span>
              <span>Tautologies Filtered: <strong className="text-text-secondary">{lastScanReport.filteredOutTautologies}</strong></span>
            </div>
            <div className="text-[11px] text-text-muted">
              Goldilocks Interval [0.42 - 0.78]
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="px-6 py-3 border-b border-border bg-cosmic-900/20 flex flex-wrap items-center justify-between gap-3">
        {/* Status Tabs */}
        <div className="flex items-center space-x-1 bg-cosmic-950 p-1 rounded-lg border border-border">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-cosmic-800 text-foreground shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            All ({discoveryCandidates.length})
          </button>
          <button
            onClick={() => setStatusFilter('unread')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'unread'
                ? 'bg-discovery/20 text-discovery-light shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            Unread ({unreadCount})
          </button>
          <button
            onClick={() => setStatusFilter('pinned')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'pinned'
                ? 'bg-cosmic-800 text-foreground shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            Pinned ({pinnedCount})
          </button>
          <button
            onClick={() => setStatusFilter('investigating')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'investigating'
                ? 'bg-causal/20 text-causal-light shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            In Lab ({investigatingCount})
          </button>
          <button
            onClick={() => setStatusFilter('dismissed')}
            className={`px-3 py-1 rounded text-xs font-medium transition-all ${
              statusFilter === 'dismissed'
                ? 'bg-conflict/20 text-conflict-light shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            Dismissed ({dismissedCount})
          </button>
        </div>

        {/* Search & Type Filters */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder="Filter by concept name or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-cosmic-950 border border-border text-xs rounded-md pl-9 pr-3 py-1 text-foreground placeholder:text-text-muted focus:outline-none focus:border-discovery/50 w-64"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="bg-cosmic-950 border border-border text-xs rounded-md px-3 py-1 text-foreground focus:outline-none focus:border-discovery/50"
          >
            <option value="all">All Discovery Types</option>
            <option value="cross_domain_analogy">Cross-Domain Analogy</option>
            <option value="structural_hole_bridge">Structural Hole Bridge</option>
            <option value="latent_contradiction">Latent Contradiction</option>
            <option value="knowledge_gap">Knowledge Gap</option>
          </select>
        </div>
      </div>

      {/* Discovery Candidates Grid */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCandidates.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="w-16 h-16 rounded-2xl bg-discovery/10 border border-discovery/20 flex items-center justify-center text-discovery mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              No Discoveries in this View
            </h3>
            <p className="text-xs text-text-muted max-w-md mb-6 leading-relaxed">
              No discovery candidates matched your selected filters. Trigger a new analysis scan across your knowledge graph to identify fresh connection opportunities.
            </p>
            <button
              onClick={handleScan}
              disabled={isScanningDiscoveries}
              className="px-4 py-2 rounded-lg bg-discovery hover:bg-discovery-dark text-white text-xs font-medium transition-colors"
            >
              Run Discovery Scan Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {filteredCandidates.map((cand) => {
              const typeTheme = TYPE_LABELS[cand.discoveryType] || TYPE_LABELS.cross_domain_analogy;
              const isSelected = selectedDiscoveryId === cand.id;

              return (
                <div
                  key={cand.id}
                  onClick={() => selectDiscovery(cand.id)}
                  className={`
                    relative rounded-xl p-5 border transition-all duration-200 cursor-pointer
                    ${
                      isSelected
                        ? 'border-discovery bg-cosmic-900/90 shadow-lg shadow-discovery/10 ring-1 ring-discovery/40'
                        : 'border-border bg-cosmic-900/50 hover:bg-cosmic-900/80 hover:border-border/80 shadow-md'
                    }
                  `}
                >
                  {/* Top Header: Domains & Badges */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-semibold font-mono border ${typeTheme.bg} ${typeTheme.color} ${typeTheme.border}`}>
                        {typeTheme.label}
                      </span>
                      {cand.provenanceType && (
                        <span className="px-2 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-cosmic-950 text-text-muted border border-border">
                          {cand.provenanceType}
                        </span>
                      )}
                      {cand.status === 'pinned' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-discovery/20 text-discovery-light flex items-center gap-1">
                          <Pin className="w-2.5 h-2.5 fill-current" />
                          Pinned
                        </span>
                      )}
                      {cand.status === 'investigating' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-causal/20 text-causal-light flex items-center gap-1">
                          <FlaskConical className="w-2.5 h-2.5" />
                          In Lab
                        </span>
                      )}
                      {cand.status === 'dismissed' && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-conflict/20 text-conflict-light">
                          Dismissed
                        </span>
                      )}
                    </div>

                    {/* Composite Score Pill */}
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono font-bold text-foreground">
                        {Math.round(cand.compositeScore * 100)}%
                      </div>
                      <div className="text-[9px] font-mono text-text-muted">
                        Composite
                      </div>
                    </div>
                  </div>

                  {/* Concept Pair Bridge */}
                  <div className="p-3 rounded-lg bg-cosmic-950/80 border border-border mb-3 flex items-center justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <span className="text-[10px] text-text-muted uppercase tracking-wider block font-mono">
                        {cand.conceptADomain}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {cand.conceptAName}
                      </h4>
                    </div>

                    <div className="px-2.5 py-1 rounded bg-cosmic-900 border border-border text-[10px] font-mono text-causal-light shrink-0">
                      {cand.proposedRelationship.replace(/_/g, ' ')}
                    </div>

                    <div className="flex-1 min-w-0 pl-3 text-right">
                      <span className="text-[10px] text-text-muted uppercase tracking-wider block font-mono">
                        {cand.conceptBDomain}
                      </span>
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {cand.conceptBName}
                      </h4>
                    </div>
                  </div>

                  {/* Explanation Summary */}
                  <p className="text-xs text-text-secondary leading-relaxed mb-3 line-clamp-3">
                    {cand.explanation}
                  </p>

                  {/* Why It Matters / Uncertainty highlight box */}
                  {cand.whyItMatters && (
                    <div className="p-2.5 rounded-lg bg-discovery/5 border border-discovery/20 text-xs mb-3 text-text-secondary">
                      <strong className="text-discovery-light">Why It Matters:</strong> {cand.whyItMatters}
                    </div>
                  )}

                  {/* Metrics Bar */}
                  <div className="grid grid-cols-2 gap-3 py-2 border-t border-border/60 text-xs font-mono text-text-muted mb-3">
                    <div>
                      <span>Novelty Index: </span>
                      <strong className="text-foreground">{Math.round(cand.noveltyScore * 100)}%</strong>
                    </div>
                    <div className="text-right">
                      <span>Plausibility: </span>
                      <strong className="text-foreground">{Math.round(cand.plausibilityScore * 100)}%</strong>
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/60">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          promoteDiscoveryToLab(cand.id);
                        }}
                        className="px-3 py-1.5 rounded-md bg-discovery hover:bg-discovery-dark text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>Investigate in Lab</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          locateDiscoveryInUniverse(cand.id);
                        }}
                        className="px-2.5 py-1.5 rounded-md bg-cosmic-800 hover:bg-cosmic-700 text-text-secondary hover:text-foreground text-xs font-medium transition-colors flex items-center gap-1"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Graph</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pinDiscovery(cand.id);
                        }}
                        className={`p-1.5 rounded-md border text-xs transition-colors ${
                          cand.status === 'pinned'
                            ? 'bg-discovery/20 text-discovery-light border-discovery/40'
                            : 'bg-cosmic-800 text-text-muted hover:text-foreground border-border'
                        }`}
                        title={cand.status === 'pinned' ? 'Unpin' : 'Pin for later'}
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      {cand.status !== 'dismissed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setRejectingId(cand.id);
                          }}
                          className="px-2.5 py-1.5 rounded-md bg-cosmic-950 hover:bg-conflict/10 text-text-muted hover:text-conflict-light border border-border text-xs transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline Rejection Drawer */}
                  {rejectingId === cand.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 p-3 rounded-lg bg-cosmic-950 border border-conflict/30 space-y-2 animate-fade-in"
                    >
                      <span className="text-xs font-semibold text-conflict-light block">
                        Reject Proposed Relationship
                      </span>
                      <p className="text-[11px] text-text-muted leading-relaxed">
                        Rejection records an epistemic refutation revision in your knowledge history without deleting either concept.
                      </p>
                      <input
                        type="text"
                        placeholder="Reason (e.g. Incompatible biological diffusion bounds)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full bg-cosmic-900 border border-border rounded px-2.5 py-1 text-xs text-foreground focus:outline-none focus:border-conflict"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-2.5 py-1 rounded text-xs text-text-muted hover:text-foreground"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmReject(cand.id)}
                          className="px-3 py-1 rounded bg-conflict hover:bg-conflict-dark text-white text-xs font-semibold"
                        >
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
