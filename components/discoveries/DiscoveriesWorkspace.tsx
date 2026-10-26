'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import {
  Sparkles,
  Search,
  Pin,
  FlaskConical,
  Compass,
  RefreshCw,
  X,
  HelpCircle,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Quote
} from 'lucide-react';
import { DiscoveryCandidate, DiscoveryStatus, DiscoveryType } from '@/types/knowledge';
import { toCanonicalDecision } from '@/types/safety';

const TYPE_CONFIG: Record<DiscoveryType, { label: string; tagClass: string }> = {
  cross_domain_analogy: {
    label: 'Cross-Domain Analogy',
    tagClass: 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold',
  },
  structural_hole_bridge: {
    label: 'Structural Hole Bridge',
    tagClass: 'bg-royal-subtle text-royal border-royal/30 font-semibold',
  },
  latent_contradiction: {
    label: 'Latent Contradiction',
    tagClass: 'bg-cream-300 text-ink-primary border-ink/20 font-semibold',
  },
  knowledge_gap: {
    label: 'Knowledge Gap',
    tagClass: 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold',
  },
  research_question: {
    label: 'Research Question',
    tagClass: 'bg-royal-subtle text-royal border-royal/30 font-semibold',
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
    <div className="flex-1 flex flex-col h-full bg-cream overflow-hidden select-none animate-fade-in">
      {/* Header Bar */}
      <div className="px-6 py-4 border-b border-ink/10 bg-[#FCFAF5]/95 backdrop-blur-sm shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-semibold text-ink-primary tracking-tight">
                Autonomous Discovery Portfolio
              </h1>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-tangerine text-white text-[10px] font-mono font-bold shadow-xs">
                  {unreadCount} new
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
              Algorithmic structural holes, cross-domain bridges, and latent analog candidates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleScan}
              disabled={isScanningDiscoveries}
              className="px-3 py-1.5 rounded-md bg-royal hover:bg-royal-hover text-white text-xs font-medium flex items-center gap-1.5 transition-all shadow-xs active:scale-98 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanningDiscoveries ? 'animate-spin' : ''}`} />
              <span>{isScanningDiscoveries ? 'Synthesizing...' : 'Run Discovery Scan'}</span>
            </button>
          </div>
        </div>

        {/* Telemetry Summary Strip */}
        {lastScanReport && (
          <div className="mt-3 pt-3 border-t border-ink/8 flex flex-wrap items-center gap-4 text-[11px] font-mono text-ink-muted animate-fade-in-up">
            <div>
              Scanned Pairs: <span className="text-ink-primary font-bold">{lastScanReport.totalScannedPairs}</span>
            </div>
            <span className="text-ink-faint">•</span>
            <div>
              New Discoveries: <span className="text-tangerine font-bold">{lastScanReport.newCandidatesCount}</span>
            </div>
            <span className="text-ink-faint">•</span>
            <div>
              Noise Filtered: <span className="text-ink-secondary font-medium">{lastScanReport.filteredOutNoise}</span>
            </div>
            <span className="text-ink-faint">•</span>
            <div>
              Tautologies Blocked: <span className="text-ink-secondary font-medium">{lastScanReport.filteredOutTautologies}</span>
            </div>
          </div>
        )}

        {/* Filters and Search Bar */}
        <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2.5">
          {/* Status Pills */}
          <div className="flex items-center gap-1 bg-cream-200 p-0.5 rounded-md border border-ink/8 text-xs">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-royal font-semibold shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              All ({discoveryCandidates.length})
            </button>
            <button
              onClick={() => setStatusFilter('unread')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'unread'
                  ? 'bg-white text-tangerine font-semibold shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Unread ({unreadCount})
            </button>
            <button
              onClick={() => setStatusFilter('pinned')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'pinned'
                  ? 'bg-white text-royal font-semibold shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              Pinned ({pinnedCount})
            </button>
            <button
              onClick={() => setStatusFilter('investigating')}
              className={`px-2.5 py-1 rounded transition-colors ${
                statusFilter === 'investigating'
                  ? 'bg-white text-royal font-semibold shadow-xs'
                  : 'text-ink-secondary hover:text-ink-primary'
              }`}
            >
              In Lab ({investigatingCount})
            </button>
          </div>

          {/* Quick Search */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Filter by concept name or idea..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-100 border border-ink/10 text-xs rounded-md pl-8 pr-2.5 py-1 text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-royal"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-primary"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Discovery Grid Feed */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-16 px-4 bg-[#FCFAF5] rounded-xl border border-dashed border-ink/15 max-w-md mx-auto shadow-card animate-fade-in-up">
            <div className="w-10 h-10 rounded-full bg-[#FAF7F0] flex items-center justify-center mx-auto mb-3 text-tangerine border border-ink/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-semibold text-ink-primary">No discoveries match criteria</h3>
            <p className="text-xs text-ink-muted mt-1 leading-relaxed">
              Run a discovery scan or adjust filter parameters to explore new cross-domain bridges.
            </p>
            <button
              onClick={handleScan}
              className="mt-4 px-3 py-1.5 rounded-lg bg-royal hover:bg-royal-hover text-white text-xs font-medium inline-flex items-center gap-1.5 shadow-card transition-all active:scale-98"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Scan Knowledge Space</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 max-w-6xl mx-auto">
            {filteredCandidates.map((cand, index) => {
              const isSelected = selectedDiscoveryId === cand.id;
              const typeCfg = TYPE_CONFIG[cand.discoveryType] || TYPE_CONFIG.cross_domain_analogy;

              return (
                <div
                  key={cand.id}
                  onClick={() => selectDiscovery(cand.id)}
                  style={{ animationDelay: `${index * 50}ms` }}
                  className={`
                    rounded-xl p-4.5 transition-all duration-200 border cursor-pointer relative group flex flex-col justify-between bg-[#FCFAF5] animate-fade-in-up
                    ${
                      isSelected
                        ? 'border-royal ring-2 ring-royal/25 shadow-selected scale-[1.008]'
                        : 'border-ink/12 hover:border-ink/25 hover:shadow-card-hover hover:-translate-y-0.5'
                    }
                  `}
                >
                  <div>
                    {/* Top Header: Domains & Badges */}
                    <div className="flex items-start justify-between gap-3 mb-2.5">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${typeCfg.tagClass}`}>
                          {typeCfg.label}
                        </span>
                        {cand.provenanceType && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider bg-cream-200 text-ink-muted border border-ink/8">
                            {cand.provenanceType}
                          </span>
                        )}
                        {cand.safetyDecision && (() => {
                          const canonical = toCanonicalDecision(cand.safetyDecision);
                          const badgeStyle = {
                            ALLOW: 'bg-royal-subtle text-royal border-royal/30 font-semibold',
                            RESTRICT: 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold',
                            REVIEW_REQUIRED: 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold',
                            REFUSE_AND_REDIRECT: 'bg-ink/10 text-ink-primary border-ink/30 font-bold',
                            BLOCK_SPECIFIC_OPERATION: 'bg-ink text-white border-ink font-bold',
                          }[canonical] || 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold';
                          return (
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase tracking-wider border ${badgeStyle}`}>
                              {canonical.replace(/_/g, ' ')}
                            </span>
                          );
                        })()}
                        {cand.status === 'pinned' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-tangerine-subtle text-tangerine flex items-center gap-1 border border-tangerine/20 font-medium">
                            <Pin className="w-2.5 h-2.5" />
                            Pinned
                          </span>
                        )}
                        {cand.status === 'investigating' && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-royal-subtle text-royal flex items-center gap-1 border border-royal/20 font-medium">
                            <FlaskConical className="w-2.5 h-2.5" />
                            In Lab
                          </span>
                        )}
                      </div>

                      {/* Composite Score Pill */}
                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono font-bold text-royal">
                          {Math.round(cand.compositeScore * 100)}%
                        </div>
                        <div className="text-[9px] font-mono text-ink-muted">
                          Match
                        </div>
                      </div>
                    </div>

                    {/* Concept Bridge */}
                    <div className="p-3 rounded-lg bg-cream-100 border border-ink/8 mb-3 flex items-center justify-between">
                      <div className="flex-1 min-w-0 pr-2">
                        <span className="text-[9px] text-ink-muted uppercase tracking-wider block font-mono">
                          {cand.conceptADomain}
                        </span>
                        <h4 className="text-xs font-semibold text-ink-primary truncate">
                          {cand.conceptAName}
                        </h4>
                      </div>

                      <div className="px-2 py-0.5 rounded-md bg-[#FAF7F0] border border-ink/10 text-[10px] font-mono text-royal font-semibold shrink-0 shadow-xs">
                        {cand.proposedRelationship.replace(/_/g, ' ')}
                      </div>

                      <div className="flex-1 min-w-0 pl-2 text-right">
                        <span className="text-[9px] text-ink-muted uppercase tracking-wider block font-mono">
                          {cand.conceptBDomain}
                        </span>
                        <h4 className="text-xs font-semibold text-ink-primary truncate">
                          {cand.conceptBName}
                        </h4>
                      </div>
                    </div>

                    {/* Significance Statement */}
                    <p className="text-xs text-ink-secondary leading-relaxed mb-3">
                      {cand.explanation}
                    </p>

                    {/* Novelty vs Plausibility Mini-Gauges */}
                    <div className="grid grid-cols-2 gap-3 mb-3 text-[10px] font-mono">
                      <div className="bg-cream-100 p-2 rounded-md border border-ink/8">
                        <div className="flex justify-between text-ink-muted mb-1">
                          <span>Novelty</span>
                          <span className="font-semibold text-tangerine">
                            {Math.round(cand.noveltyScore * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-cream-300 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-tangerine h-full rounded-full transition-all duration-300"
                            style={{ width: `${cand.noveltyScore * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="bg-cream-100 p-2 rounded-md border border-ink/8">
                        <div className="flex justify-between text-ink-muted mb-1">
                          <span>Plausibility</span>
                          <span className="font-semibold text-royal">
                            {Math.round(cand.plausibilityScore * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-cream-300 rounded-full h-1 overflow-hidden">
                          <div
                            className="bg-royal h-full rounded-full transition-all duration-300"
                            style={{ width: `${cand.plausibilityScore * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-ink/8 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          locateDiscoveryInUniverse(cand.id);
                        }}
                        className="px-2.5 py-1 rounded text-xs text-ink-muted hover:text-royal hover:bg-royal-subtle flex items-center gap-1 transition-colors"
                        title="Locate in Knowledge Universe canvas"
                      >
                        <Compass className="w-3.5 h-3.5" />
                        <span>Locate</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          pinDiscovery(cand.id);
                        }}
                        className={`px-2.5 py-1 rounded text-xs flex items-center gap-1 transition-colors ${
                          cand.status === 'pinned'
                            ? 'text-tangerine font-semibold bg-tangerine-subtle'
                            : 'text-ink-muted hover:text-tangerine hover:bg-tangerine-subtle'
                        }`}
                      >
                        <Pin className="w-3.5 h-3.5" />
                        <span>{cand.status === 'pinned' ? 'Pinned' : 'Pin'}</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRejectingId(cand.id);
                        }}
                        className="px-2 py-1 rounded text-xs text-ink-muted hover:text-tangerine hover:bg-tangerine-subtle transition-colors"
                      >
                        Reject
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          promoteDiscoveryToLab(cand.id);
                        }}
                        className="px-3 py-1 rounded bg-royal hover:bg-royal-hover text-white text-xs font-medium flex items-center gap-1 shadow-xs transition-all active:scale-98"
                      >
                        <FlaskConical className="w-3.5 h-3.5" />
                        <span>Launch Lab</span>
                      </button>
                    </div>
                  </div>

                  {/* Inline Rejection Drawer */}
                  {rejectingId === cand.id && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className="mt-2.5 p-3 rounded-md bg-cream-100 border border-tangerine/30 space-y-2 animate-fade-in-up"
                    >
                      <span className="text-xs font-semibold text-tangerine block">
                        Reject Proposed Relationship
                      </span>
                      <p className="text-[11px] text-ink-muted leading-relaxed">
                        Rejection records an epistemic refutation revision without deleting either concept.
                      </p>
                      <input
                        type="text"
                        placeholder="Reason (e.g. Incompatible biological diffusion bounds)..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full bg-[#FCFAF5] border border-ink/15 rounded-lg px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setRejectingId(null)}
                          className="px-2.5 py-1 rounded text-xs text-ink-muted hover:text-ink-primary"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleConfirmReject(cand.id)}
                          className="px-3 py-1 rounded bg-tangerine hover:bg-tangerine-hover text-white text-xs font-medium shadow-xs"
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
