'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  X, 
  Sparkles, 
  Quote, 
  ShieldCheck, 
  ShieldAlert,
  ShieldX,
  HelpCircle,
  FlaskConical, 
  Layers, 
  BookOpen,
  Link2,
  Edit2,
  Trash2,
  Check,
  PlusCircle,
  AlertTriangle
} from 'lucide-react';
import { toCanonicalDecision } from '@/types/safety';
import { isActionPermittedForLab } from '@/lib/safety/safetyClassifier';
import { RelationshipType } from '@/types/knowledge';

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
    updateConcept,
    deleteConcept,
    createRelationship,
    deleteRelationship,
  } = useKnowledgeStore();

  const selectedConcept = concepts.find((c) => c.id === selectedConceptId);
  const selectedRelationship = relationships.find((r) => r.id === selectedRelationshipId);
  const selectedDiscovery = discoveryCandidates.find((d) => d.id === selectedDiscoveryId);

  // Edit Concept state
  const [isEditingConcept, setIsEditingConcept] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDomain, setEditDomain] = useState('');

  // Connect to concept state
  const [isConnecting, setIsConnecting] = useState(false);
  const [targetConceptId, setTargetConceptId] = useState('');
  const [connectRelType, setConnectRelType] = useState<RelationshipType>('enables');
  const [connectRationale, setConnectRationale] = useState('');
  const [connectError, setConnectError] = useState<string | null>(null);

  const isOpen = Boolean(selectedConcept || selectedRelationship || selectedDiscovery);

  const handleClose = () => {
    setIsEditingConcept(false);
    setIsConnecting(false);
    selectConcept(null);
    selectRelationship(null);
    selectDiscovery(null);
  };

  const startEditConcept = () => {
    if (!selectedConcept) return;
    setEditName(selectedConcept.canonicalName);
    setEditDesc(selectedConcept.description);
    setEditDomain(selectedConcept.domainCategory);
    setIsEditingConcept(true);
  };

  const handleSaveConceptEdit = () => {
    if (!selectedConcept || !editName.trim()) return;
    updateConcept(selectedConcept.id, {
      canonicalName: editName.trim(),
      description: editDesc.trim(),
      domainCategory: editDomain.trim() || 'General',
    });
    setIsEditingConcept(false);
  };

  const handleDeleteConcept = () => {
    if (!selectedConcept) return;
    const confirm = window.confirm(
      `Are you sure you want to delete concept "${selectedConcept.canonicalName}"? All connected relationships will be removed.`
    );
    if (confirm) {
      deleteConcept(selectedConcept.id);
      setIsEditingConcept(false);
    }
  };

  const handleCreateConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConcept || !targetConceptId) return;
    setConnectError(null);

    const res = createRelationship({
      sourceConceptId: selectedConcept.id,
      targetConceptId,
      relationshipType: connectRelType,
      rationale: connectRationale.trim() || 'Manual edge created by researcher',
      confidenceScore: 0.85,
    });

    if (!res.success) {
      setConnectError(res.error || 'Failed to establish relationship.');
    } else {
      setIsConnecting(false);
      setConnectRationale('');
      setTargetConceptId('');
    }
  };

  const handleDeleteRelationship = () => {
    if (!selectedRelationship) return;
    const confirm = window.confirm('Delete this relationship from the knowledge universe?');
    if (confirm) {
      deleteRelationship(selectedRelationship.id);
    }
  };

  if (!isOpen) {
    return (
      <aside className="w-80 border-l border-ink/10 bg-[#FCFAF5] p-4 flex flex-col justify-between select-none hidden lg:flex shrink-0">
        <div>
          <div className="flex items-center space-x-2 text-ink-muted mb-4">
            <BookOpen className="w-4 h-4 text-royal" />
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-secondary">
              Contextual Inspector
            </span>
          </div>
          <div className="p-4 rounded-lg border border-dashed border-ink/15 text-center text-ink-muted text-xs bg-cream-100">
            <Layers className="w-6 h-6 mx-auto mb-2 text-ink-faint" />
            <p className="font-medium text-ink-primary">No entity selected</p>
            <p className="text-[11px] mt-1 text-ink-muted leading-relaxed">
              Click any concept node, relationship edge, or discovery candidate to inspect provenance, evidence, and safety properties.
            </p>
          </div>
        </div>

        {/* Epistemic Health Summary */}
        <div className="p-3 rounded-lg bg-cream-100 border border-ink/10 text-[11px] space-y-2">
          <div className="flex items-center justify-between text-ink-primary font-medium">
            <span>Graph Edge Density</span>
            <span className="font-mono text-royal font-semibold">
              {(relationships.length / (concepts.length || 1)).toFixed(2)} edges/node
            </span>
          </div>
          <div className="w-full bg-cream-300 rounded-full h-1 overflow-hidden">
            <div 
              className="bg-royal h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, (relationships.length / (concepts.length || 1)) * 40)}%` }}
            />
          </div>
          <p className="text-[10px] text-ink-muted leading-tight">
            Higher edge density increases cross-domain bridge discovery probability.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-80 border-l border-ink/10 bg-[#FCFAF5] flex flex-col h-[calc(100vh-3rem)] select-none z-20 shadow-card overflow-y-auto shrink-0 animate-slide-in-right">
      {/* Inspector Top Bar */}
      <div className="p-3 border-b border-ink/10 flex items-center justify-between bg-cream-100/80 sticky top-0 backdrop-blur-sm z-10">
        <div className="flex items-center space-x-2">
          {selectedConcept && <Layers className="w-4 h-4 text-royal" />}
          {selectedRelationship && <Link2 className="w-4 h-4 text-royal" />}
          {selectedDiscovery && <Sparkles className="w-4 h-4 text-tangerine" />}
          <span className="text-xs font-semibold uppercase tracking-wider text-ink-primary">
            {selectedConcept && 'Concept Details'}
            {selectedRelationship && 'Relationship'}
            {selectedDiscovery && 'Discovery Candidate'}
          </span>
        </div>
        <button
          onClick={handleClose}
          className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-cream-200 transition-colors"
          aria-label="Close inspector"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-3.5 space-y-4 flex-1">
        {/* 1. CONCEPT INSPECTOR */}
        {selectedConcept && (
          <div className="space-y-4 animate-fade-in">
            {isEditingConcept ? (
              <div className="space-y-3 p-3 bg-[#FAF7F0] rounded-lg border border-ink/10 shadow-xs">
                <div className="text-xs font-semibold text-ink-primary mb-1">Edit Concept</div>
                <div>
                  <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">Canonical Name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-ink/15 text-xs rounded-lg px-2.5 py-1.5 text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">Domain Category</label>
                  <input
                    type="text"
                    value={editDomain}
                    onChange={(e) => setEditDomain(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-ink/15 text-xs rounded-lg px-2.5 py-1.5 text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    className="w-full bg-[#FCFAF5] border border-ink/15 text-xs rounded-lg px-2.5 py-1.5 text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-1">
                  <button
                    onClick={handleSaveConceptEdit}
                    className="flex-1 bg-royal hover:bg-royal-hover text-white text-xs py-1.5 px-2.5 rounded-lg font-medium flex items-center justify-center space-x-1 shadow-card transition-all active:scale-98"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Save</span>
                  </button>
                  <button
                    onClick={() => setIsEditingConcept(false)}
                    className="bg-[#FCFAF5] hover:bg-cream-200 text-ink-secondary text-xs py-1.5 px-2.5 rounded-lg border border-ink/15 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-royal-subtle text-royal border border-royal/20 font-medium">
                    {selectedConcept.domainCategory}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={startEditConcept}
                      className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-cream-200 transition-colors"
                      title="Edit concept"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={handleDeleteConcept}
                      className="p-1 rounded text-ink-muted hover:text-tangerine hover:bg-tangerine-subtle transition-colors"
                      title="Delete concept"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <h2 className="text-sm font-semibold text-ink-primary mt-2">
                  {selectedConcept.canonicalName}
                </h2>
                <p className="text-xs text-ink-secondary mt-1 leading-relaxed">
                  {selectedConcept.description}
                </p>
              </div>
            )}

            {/* Connect to Node action */}
            <div className="pt-2">
              {!isConnecting ? (
                <button
                  onClick={() => setIsConnecting(true)}
                  className="w-full py-1.5 px-2 rounded border border-dashed border-ink/18 hover:border-royal text-xs font-medium text-ink-secondary hover:text-royal bg-cream-100 flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5 text-royal" />
                  <span>Connect to Another Concept</span>
                </button>
              ) : (
                <form onSubmit={handleCreateConnection} className="p-2.5 rounded bg-cream-100 border border-ink/12 space-y-2 text-xs animate-scale-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono uppercase text-ink-muted font-semibold">New Edge</span>
                    <button
                      type="button"
                      onClick={() => setIsConnecting(false)}
                      className="text-ink-muted hover:text-ink-primary"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  {connectError && (
                    <div className="text-[10px] text-tangerine bg-tangerine-subtle p-1.5 rounded flex items-center space-x-1 border border-tangerine/20">
                      <AlertTriangle className="w-3 h-3 shrink-0" />
                      <span>{connectError}</span>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] text-ink-muted block mb-0.5">Target Concept</label>
                    <select
                      value={targetConceptId}
                      onChange={(e) => setTargetConceptId(e.target.value)}
                      className="w-full bg-[#FCFAF5] border border-ink/15 text-xs rounded-lg px-2.5 py-1.5 text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                      required
                    >
                      <option value="">Select target node...</option>
                      {concepts
                        .filter((c) => c.id !== selectedConcept.id)
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.canonicalName} ({c.domainCategory})
                          </option>
                        ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-muted block mb-0.5">Relationship Type</label>
                    <select
                      value={connectRelType}
                      onChange={(e) => setConnectRelType(e.target.value as RelationshipType)}
                      className="w-full bg-[#FCFAF5] border border-ink/15 text-xs rounded-lg px-2.5 py-1.5 text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                    >
                      <option value="enables">enables</option>
                      <option value="inhibits">inhibits</option>
                      <option value="causes">causes</option>
                      <option value="analogous_to">analogous_to</option>
                      <option value="depends_on">depends_on</option>
                      <option value="contradicts">contradicts</option>
                      <option value="is_a">is_a</option>
                      <option value="associated_with">associated_with</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-ink-muted block mb-0.5">Rationale</label>
                    <input
                      type="text"
                      placeholder="Why does this connection hold?"
                      value={connectRationale}
                      onChange={(e) => setConnectRationale(e.target.value)}
                      className="w-full bg-[#FCFAF5] border border-ink/15 text-xs rounded-lg px-2.5 py-1.5 text-ink-primary focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-royal hover:bg-royal-hover text-white text-xs py-1.5 rounded-lg font-medium transition-all shadow-card active:scale-98"
                  >
                    Establish Relationship
                  </button>
                </form>
              )}
            </div>

            {/* Connected Concepts */}
            <div className="pt-3 border-t border-ink/10">
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-2 font-medium">
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
                        className="p-2 rounded bg-cream-100 border border-ink/10 hover:border-royal/50 cursor-pointer text-xs flex items-center justify-between transition-colors"
                      >
                        <span className="font-medium text-ink-muted text-[11px]">
                          {rel.relationshipType.replace(/_/g, ' ')}
                        </span>
                        <span className="text-ink-primary font-medium truncate max-w-[130px]">
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
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-cream-200 text-ink-secondary border border-ink/10">
                  {selectedRelationship.relationshipType.replace(/_/g, ' ')}
                </span>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border capitalize ${
                    selectedRelationship.status === 'accepted'
                      ? 'bg-royal-subtle text-royal border-royal/30 font-medium'
                      : selectedRelationship.status === 'disputed'
                      ? 'bg-tangerine-subtle text-tangerine border-tangerine/30'
                      : 'bg-cream-200 text-ink-muted border-ink/10'
                  }`}>
                    {selectedRelationship.status}
                  </span>
                  <button
                    onClick={handleDeleteRelationship}
                    className="p-1 rounded text-ink-muted hover:text-tangerine hover:bg-tangerine-subtle transition-colors"
                    title="Delete relationship"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xs font-semibold text-ink-primary mt-2">
                {concepts.find((c) => c.id === selectedRelationship.sourceConceptId)?.canonicalName}
                <span className="text-royal mx-1.5">→</span>
                {concepts.find((c) => c.id === selectedRelationship.targetConceptId)?.canonicalName}
              </h3>
            </div>

            {/* Confidence Score */}
            <div className="p-2.5 rounded-lg bg-cream-100 border border-ink/10">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-ink-muted text-[11px]">Confidence</span>
                <span className="font-mono text-royal font-semibold text-xs">
                  {Math.round(selectedRelationship.confidenceScore * 100)}%
                </span>
              </div>
              <div className="w-full bg-cream-300 rounded-full h-1 overflow-hidden">
                <div
                  className="bg-royal h-full rounded-full transition-all duration-300"
                  style={{ width: `${selectedRelationship.confidenceScore * 100}%` }}
                />
              </div>
            </div>

            {/* Rationale */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-1">
                Structural Rationale
              </span>
              <p className="text-xs text-ink-secondary leading-relaxed bg-cream-100 p-2.5 rounded-md border border-ink/10">
                {selectedRelationship.rationale}
              </p>
            </div>
          </div>
        )}

        {/* 3. DISCOVERY CANDIDATE INSPECTOR */}
        {selectedDiscovery && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-tangerine-subtle text-tangerine border border-tangerine/25 font-semibold">
                  {selectedDiscovery.discoveryType.replace(/_/g, ' ')}
                </span>
                <span className="text-xs font-mono font-bold text-royal">
                  {Math.round(selectedDiscovery.compositeScore * 100)}% Match
                </span>
              </div>

              <h2 className="text-xs font-semibold text-ink-primary mt-2">
                <span className="text-royal">{selectedDiscovery.conceptAName}</span>
                <span className="text-tangerine mx-1 font-bold">↔</span>
                <span className="text-royal">{selectedDiscovery.conceptBName}</span>
              </h2>
            </div>

            {/* Metrics Breakdown */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 rounded bg-cream-100 border border-ink/10 text-center">
                <span className="text-[10px] text-ink-muted block">Novelty Index</span>
                <span className="text-xs font-mono font-semibold text-tangerine">
                  {Math.round(selectedDiscovery.noveltyScore * 100)}%
                </span>
              </div>
              <div className="p-2 rounded bg-cream-100 border border-ink/10 text-center">
                <span className="text-[10px] text-ink-muted block">Plausibility</span>
                <span className="text-xs font-mono font-semibold text-royal">
                  {Math.round(selectedDiscovery.plausibilityScore * 100)}%
                </span>
              </div>
            </div>

            {/* Explanation */}
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted block mb-1 font-medium">
                Discovery Significance
              </span>
              <p className="text-xs text-ink-secondary leading-relaxed bg-cream-100 p-2.5 rounded-md border border-ink/10">
                {selectedDiscovery.explanation}
              </p>
            </div>

            {/* Verbatim Source Evidence Citations */}
            {selectedDiscovery.evidenceQuotes && selectedDiscovery.evidenceQuotes.length > 0 && (
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-ink-muted flex items-center space-x-1 mb-1.5 font-medium">
                  <Quote className="w-3 h-3 text-royal" />
                  <span>Verbatim Evidence Chunks</span>
                </span>
                <div className="space-y-1.5">
                  {selectedDiscovery.evidenceQuotes.map((ev, i) => (
                    <div key={i} className="p-2 rounded bg-cream-100 border border-ink/10 text-[11px]">
                      <p className="text-[10px] font-mono text-royal font-semibold truncate mb-0.5">
                        {ev.sourceTitle}
                      </p>
                      <p className="text-ink-secondary italic border-l-2 border-royal/40 pl-2 leading-relaxed">
                        &ldquo;{ev.quote}&rdquo;
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Safety & Policy Gate Panel */}
            {(() => {
              const canonical = toCanonicalDecision(selectedDiscovery.safetyDecision);
              const permission = isActionPermittedForLab(selectedDiscovery.safetyDecision);
              const category = selectedDiscovery.safetyCategory || 'benign';
              const rationale = selectedDiscovery.safetyRationale || (
                canonical === 'ALLOW'
                  ? 'Benign conceptual exploration permitted under ethical policy.'
                  : canonical === 'RESTRICT'
                  ? 'Dual-use threat topic identified. Research permitted under boundary limits.'
                  : canonical === 'REFUSE_AND_REDIRECT'
                  ? 'Operational harm refused. Consult safe alternatives.'
                  : 'Conservative hold: safety review required.'
              );
              const permittedScope = selectedDiscovery.permittedScope;
              const safeAlternative = selectedDiscovery.safeAlternative;

              const badgeStyles = {
                ALLOW: 'bg-royal-subtle text-royal border-royal/30 font-semibold',
                RESTRICT: 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold',
                REVIEW_REQUIRED: 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold',
                REFUSE_AND_REDIRECT: 'bg-ink/10 text-ink-primary border-ink/30 font-bold',
                BLOCK_SPECIFIC_OPERATION: 'bg-ink text-white border-ink font-bold',
              }[canonical] || 'bg-tangerine-subtle text-tangerine border-tangerine/30 font-semibold';

              const Icon = {
                ALLOW: ShieldCheck,
                RESTRICT: ShieldAlert,
                REVIEW_REQUIRED: HelpCircle,
                REFUSE_AND_REDIRECT: ShieldX,
                BLOCK_SPECIFIC_OPERATION: ShieldX,
              }[canonical] || HelpCircle;

              return (
                <div className="space-y-2.5 pt-1">
                  <div className="p-2.5 rounded-lg bg-cream-100 border border-ink/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <Icon className="w-3.5 h-3.5 text-current shrink-0" />
                        <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded font-bold border ${badgeStyles}`}>
                          {canonical}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-ink-muted uppercase">
                        {category}
                      </span>
                    </div>

                    <p className="text-[11px] text-ink-secondary leading-relaxed">
                      {rationale}
                    </p>

                    {permittedScope && (
                      <div className="text-[10px] bg-[#FCFAF5] p-2 rounded-lg border border-ink/10 shadow-xs">
                        <span className="text-ink-muted font-mono uppercase text-[9px] block mb-0.5">
                          Permitted Scope:
                        </span>
                        <span className="text-ink-secondary">
                          {permittedScope}
                        </span>
                      </div>
                    )}

                    {safeAlternative && (
                      <div className="text-[10px] bg-royal-subtle p-2 rounded border border-royal/20">
                        <span className="text-royal font-mono uppercase text-[9px] block mb-0.5">
                          Safe Alternative:
                        </span>
                        <span className="text-ink-secondary">
                          {safeAlternative}
                        </span>
                      </div>
                    )}
                  </div>

                  {permission.permitted ? (
                    <button
                      onClick={() => promoteDiscoveryToLab(selectedDiscovery.id)}
                      className={`w-full font-medium py-2 px-3 rounded-md text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs active:scale-98 ${
                        canonical === 'RESTRICT'
                          ? 'bg-tangerine hover:bg-tangerine-hover text-white'
                          : 'bg-royal hover:bg-royal-hover text-white'
                      }`}
                    >
                      <FlaskConical className="w-3.5 h-3.5" />
                      <span>
                        {canonical === 'RESTRICT'
                          ? 'Launch Constrained Lab Investigation'
                          : 'Launch Discovery Lab Investigation'}
                      </span>
                    </button>
                  ) : (
                    <div className="space-y-1">
                      <button
                        disabled
                        className="w-full bg-cream-200 text-ink-muted py-2 px-3 rounded-md text-xs font-medium flex items-center justify-center space-x-1.5 opacity-60 cursor-not-allowed border border-ink/10"
                      >
                        <ShieldX className="w-3.5 h-3.5 text-ink-muted" />
                        <span>
                          {canonical === 'REVIEW_REQUIRED'
                            ? 'Lab Blocked: Safety Review Required'
                            : canonical === 'REFUSE_AND_REDIRECT'
                            ? 'Lab Refused: Harmful Request'
                            : 'Lab Blocked: Safety Policy Gate'}
                        </span>
                      </button>
                      <p className="text-[10px] text-ink-muted text-center italic">
                        {permission.reason}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </aside>
  );
};
