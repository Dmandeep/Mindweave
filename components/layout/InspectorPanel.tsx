'use client';

import React from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  X, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Quote, 
  ShieldCheck, 
  FlaskConical, 
  Layers, 
  Hash, 
  BookOpen,
  Link2,
  FileText
} from 'lucide-react';

export const InspectorPanel: React.FC = () => {
  const {
    concepts,
    relationships,
    discoveryCandidates,
    selectedConceptId,
    selectedRelationshipId,
    selectedDiscoveryId,
    selectConcept,
    selectRelationship,
    selectDiscovery,
    promoteDiscoveryToLab,
    reconcileInvestigationOutcome
  } = useKnowledgeStore();

  const selectedConcept = concepts.find((c) => c.id === selectedConceptId);
  const selectedRelationship = relationships.find((r) => r.id === selectedRelationshipId);
  const selectedDiscovery = discoveryCandidates.find((d) => d.id === selectedDiscoveryId);

  const isOpen = Boolean(selectedConcept || selectedRelationship || selectedDiscovery);

  const handleClose = () => {
    selectConcept(null);
    selectRelationship(null);
    selectDiscovery(null);
  };

  if (!isOpen) {
    return (
      <aside className="w-80 border-l border-border bg-cosmic-900/70 p-4 flex flex-col justify-between select-none hidden lg:flex">
        <div>
          <div className="flex items-center space-x-2 text-text-muted mb-4">
            <BookOpen className="w-4 h-4 text-discovery" />
            <span className="text-xs font-semibold uppercase tracking-wider">
              Contextual Inspector
            </span>
          </div>
          <div className="p-4 rounded-xl border border-dashed border-border text-center text-text-muted text-xs">
            <Layers className="w-8 h-8 mx-auto mb-2 text-text-muted/40" />
            <p className="font-medium text-text-secondary">No entity selected</p>
            <p className="text-[11px] mt-1 text-text-muted">
              Click any concept node, relationship edge, or discovery candidate to inspect provenance, evidence citations, and structural details.
            </p>
          </div>
        </div>

        {/* Global Epistemic Health Summary */}
        <div className="p-3 rounded-lg bg-cosmic-950 border border-border text-[11px] space-y-2">
          <div className="flex items-center justify-between text-text-secondary font-medium">
            <span>Knowledge Graph Density</span>
            <span className="font-mono text-discovery">
              {(relationships.length / (concepts.length || 1)).toFixed(2)} edges/node
            </span>
          </div>
          <div className="w-full bg-cosmic-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className="bg-discovery h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (relationships.length / (concepts.length || 1)) * 40)}%` }}
            />
          </div>
          <p className="text-[10px] text-text-muted leading-tight">
            Higher edge density increases the probability of non-obvious cross-domain bridge discoveries.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-88 border-l border-border bg-cosmic-900 flex flex-col h-[calc(100vh-3.5rem)] select-none z-20 shadow-xl overflow-y-auto">
      {/* Inspector Top Bar */}
      <div className="p-3.5 border-b border-border flex items-center justify-between bg-cosmic-950/80">
        <div className="flex items-center space-x-2">
          {selectedConcept && <Layers className="w-4 h-4 text-causal" />}
          {selectedRelationship && <Link2 className="w-4 h-4 text-verified" />}
          {selectedDiscovery && <Sparkles className="w-4 h-4 text-discovery" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-text-primary">
            {selectedConcept && 'Concept Details'}
            {selectedRelationship && 'Relationship Provenance'}
            {selectedDiscovery && 'Discovery Candidate'}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-cosmic-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* 1. CONCEPT INSPECTOR */}
        {selectedConcept && (
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-causal/15 text-causal border border-causal/30 font-semibold">
                {selectedConcept.domainCategory}
              </span>
              <h2 className="text-base font-semibold text-text-primary mt-2">
                {selectedConcept.canonicalName}
              </h2>
              <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                {selectedConcept.description}
              </p>
            </div>

            {/* Connected Concepts List */}
            <div className="pt-3 border-t border-border">
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block mb-2">
                Connected Relationships
              </span>
              <div className="space-y-1.5">
                {relationships
                  .filter((r) => r.sourceConceptId === selectedConcept.id || r.targetConceptId === selectedConcept.id)
                  .map((rel) => {
                    const isSource = rel.sourceConceptId === selectedConcept.id;
                    const otherId = isSource ? rel.targetConceptId : rel.sourceConceptId;
                    const other = concepts.find((c) => c.id === otherId);
                    return (
                      <div
                        key={rel.id}
                        onClick={() => selectRelationship(rel.id)}
                        className="p-2 rounded bg-cosmic-950 border border-border hover:border-causal/50 cursor-pointer text-xs flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium text-text-secondary">
                          {rel.relationshipType}
                        </span>
                        <span className="text-text-primary font-semibold truncate max-w-[140px]">
                          {other?.canonicalName}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* 2. RELATIONSHIP INSPECTOR */}
        {selectedRelationship && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cosmic-800 text-text-secondary border border-border">
                  Type: {selectedRelationship.relationshipType}
                </span>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${
                  selectedRelationship.status === 'accepted'
                    ? 'bg-verified/15 text-verified border-verified/30'
                    : selectedRelationship.status === 'disputed'
                    ? 'bg-conflict/15 text-conflict border-conflict/30'
                    : 'bg-discovery/15 text-discovery-light border-discovery/30'
                }`}>
                  {selectedRelationship.status}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-text-primary mt-2">
                {concepts.find((c) => c.id === selectedRelationship.sourceConceptId)?.canonicalName}
                <span className="text-causal mx-1.5">→</span>
                {concepts.find((c) => c.id === selectedRelationship.targetConceptId)?.canonicalName}
              </h3>
            </div>

            {/* Confidence Score Bar */}
            <div className="p-2.5 rounded-lg bg-cosmic-950 border border-border">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-text-muted">Epistemic Confidence</span>
                <span className="font-mono text-causal font-semibold">
                  {Math.round(selectedRelationship.confidenceScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-cosmic-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-causal h-full rounded-full"
                  style={{ width: `${selectedRelationship.confidenceScore * 100}%` }}
                />
              </div>
            </div>

            {/* Rationale */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block mb-1">
                Structural Rationale
              </span>
              <p className="text-xs text-text-secondary leading-relaxed bg-cosmic-950 p-2.5 rounded-md border border-border">
                {selectedRelationship.rationale}
              </p>
            </div>
          </div>
        )}

        {/* 3. DISCOVERY CANDIDATE INSPECTOR */}
        {selectedDiscovery && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-discovery/15 text-discovery-light border border-discovery/30 font-semibold">
                  {selectedDiscovery.discoveryType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-discovery">
                  Match: {Math.round(selectedDiscovery.compositeScore * 100)}%
                </span>
              </div>

              <h2 className="text-sm font-semibold text-text-primary mt-2">
                <span className="text-causal">{selectedDiscovery.conceptAName}</span>
                <span className="text-text-muted mx-1.5">↔</span>
                <span className="text-discovery-light">{selectedDiscovery.conceptBName}</span>
              </h2>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-cosmic-950 border border-border text-center">
                <span className="text-[10px] text-text-muted block">Novelty Index</span>
                <span className="text-xs font-mono font-bold text-discovery">
                  {Math.round(selectedDiscovery.noveltyScore * 100)}%
                </span>
              </div>
              <div className="p-2 rounded bg-cosmic-950 border border-border text-center">
                <span className="text-[10px] text-text-muted block">Plausibility</span>
                <span className="text-xs font-mono font-bold text-verified">
                  {Math.round(selectedDiscovery.plausibilityScore * 100)}%
                </span>
              </div>
            </div>

            {/* Rationale Explanation */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted block mb-1">
                Why this relationship matters
              </span>
              <p className="text-xs text-text-secondary leading-relaxed bg-cosmic-950 p-3 rounded-lg border border-border">
                {selectedDiscovery.explanation}
              </p>
            </div>

            {/* Verbatim Source Evidence Citations */}
            {selectedDiscovery.evidenceQuotes && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-muted flex items-center space-x-1 mb-1.5">
                  <Quote className="w-3 h-3 text-discovery" />
                  <span>Verbatim Evidence Chunks</span>
                </span>
                <div className="space-y-2">
                  {selectedDiscovery.evidenceQuotes.map((ev, i) => (
                    <div key={i} className="p-2.5 rounded bg-cosmic-950/80 border border-border text-[11px]">
                      <p className="text-[10px] font-mono text-causal font-semibold truncate mb-1">
                        {ev.sourceTitle}
                      </p>
                      <p className="text-text-secondary italic border-l-2 border-discovery/40 pl-2">
                        "{ev.quote}"
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Safety & Policy Badge */}
            <div className="p-2 rounded bg-cosmic-950 border border-border flex items-center space-x-2 text-[10px]">
              <ShieldCheck className="w-3.5 h-3.5 text-verified" />
              <span className="text-text-secondary">
                Policy Gate: <span className="text-verified font-medium">ALLOW</span> (Defensive Research Safe)
              </span>
            </div>

            {/* Promote to Discovery Lab Button */}
            <button
              onClick={() => promoteDiscoveryToLab(selectedDiscovery.id)}
              className="w-full bg-discovery hover:bg-discovery-dark text-white font-medium py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shadow-discovery/20 active:scale-98"
            >
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Launch Discovery Lab Investigation</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
