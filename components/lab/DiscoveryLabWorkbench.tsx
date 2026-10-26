'use client';

import React, { useState, useEffect } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  Plus,
  Trash2,
  FileText,
  Target,
  Sparkles,
  ClipboardList,
  AlertTriangle,
  Lightbulb,
  Compass,
  Quote,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { InvestigationStage, InvestigationOutcome, EvidenceRecord } from '@/types/knowledge';
import { evaluateSafetyPolicy } from '@/lib/safety/safetyClassifier';

const STAGES: { key: InvestigationStage; label: string; step: number }[] = [
  { key: 'hypothesis', label: 'Hypothesis', step: 1 },
  { key: 'design', label: 'Protocol', step: 2 },
  { key: 'execution', label: 'Telemetry', step: 3 },
  { key: 'evaluation', label: 'Evidence', step: 4 },
  { key: 'completed', label: 'Conclusion', step: 5 },
];

export const DiscoveryLabWorkbench: React.FC = () => {
  const {
    investigations,
    activeInvestigationId,
    discoveryCandidates,
    updateHypothesis,
    updateExperimentPlan,
    recordObservation,
    reconcileInvestigationOutcome,
    setViewMode,
    selectRelationship,
    relationships,
  } = useKnowledgeStore();

  const activeInvestigation = investigations.find((inv) => inv.id === activeInvestigationId);
  const linkedDiscovery = discoveryCandidates.find((d) => d.id === activeInvestigation?.discoveryId);

  const [researchQuestion, setResearchQuestion] = useState(
    activeInvestigation?.researchQuestion || ''
  );
  const [hypothesisText, setHypothesisText] = useState(
    activeInvestigation?.hypothesisStatement || ''
  );
  const [newAssumption, setNewAssumption] = useState('');
  const [newFalsification, setNewFalsification] = useState('');
  const [falsifications, setFalsifications] = useState<string[]>(
    activeInvestigation?.structuredHypothesis?.falsificationConditions || [
      'If state consistency is violated under clock drift despite lease expiration.',
    ]
  );
  const [methodologyText, setMethodologyText] = useState(
    activeInvestigation?.experimentPlan?.methodology || ''
  );
  const [newObservation, setNewObservation] = useState('');
  const [evidenceList, setEvidenceList] = useState<EvidenceRecord[]>(
    activeInvestigation?.experimentPlan?.evidenceRecords || []
  );
  const [newEvidenceQuote, setNewEvidenceQuote] = useState('');
  const [newEvidenceSource, setNewEvidenceSource] = useState('');
  const [newEvidenceStance, setNewEvidenceStance] = useState<'supports' | 'refutes' | 'neutral'>(
    'supports'
  );

  const [isSaved, setIsSaved] = useState(false);
  const [safetyCheckResult, setSafetyCheckResult] = useState<{
    decision: string;
    rationale: string;
  }>({ decision: 'ALLOW', rationale: 'Verified safe empirical procedure.' });

  useEffect(() => {
    if (activeInvestigation) {
      setResearchQuestion(
        activeInvestigation.researchQuestion ||
          `How does ${linkedDiscovery?.conceptAName || 'Concept A'} structurally influence ${linkedDiscovery?.conceptBName || 'Concept B'}?`
      );
      setHypothesisText(activeInvestigation.hypothesisStatement);
      setMethodologyText(activeInvestigation.experimentPlan.methodology);
      setFalsifications(
        activeInvestigation.structuredHypothesis?.falsificationConditions || [
          'If partition tolerance breaks under clock jitter < 50ms, the hypothesis is refuted.',
        ]
      );
      setEvidenceList(activeInvestigation.experimentPlan.evidenceRecords || []);
      setIsSaved(false);

      evaluateSafetyPolicy(activeInvestigation.experimentPlan.methodology, 'experiment', 'generate_plan').then((res) => {
        setSafetyCheckResult({
          decision: res.decision,
          rationale: res.rationaleSummary,
        });
      });
    }
  }, [activeInvestigation, linkedDiscovery]);

  if (!activeInvestigation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cream text-center h-full select-none animate-fade-in-up">
        <div className="w-12 h-12 rounded-xl bg-[#FCFAF5] border border-ink/10 flex items-center justify-center text-royal mb-4 shadow-card">
          <FlaskConical className="w-6 h-6" />
        </div>
        <h2 className="text-sm font-semibold text-ink-primary mb-1">Discovery Lab is Idle</h2>
        <p className="text-xs text-ink-muted max-w-sm mb-4 leading-relaxed">
          Select or launch a discovery candidate from the Discoveries Workspace to formulate empirical hypotheses and run falsification protocols.
        </p>
        <button
          onClick={() => setViewMode('discoveries')}
          className="px-3.5 py-1.5 rounded-md bg-royal hover:bg-royal-hover text-white text-xs font-medium shadow-xs transition-all active:scale-98"
        >
          Open Discovery Feed
        </button>
      </div>
    );
  }

  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    const updated = [...activeInvestigation.assumptions, newAssumption.trim()];
    updateHypothesis(activeInvestigation.id, hypothesisText, updated);
    setNewAssumption('');
    setIsSaved(true);
  };

  const handleRemoveAssumption = (idx: number) => {
    const updated = activeInvestigation.assumptions.filter((_, i) => i !== idx);
    updateHypothesis(activeInvestigation.id, hypothesisText, updated);
    setIsSaved(true);
  };

  const handleAddFalsification = () => {
    if (!newFalsification.trim()) return;
    setFalsifications([...falsifications, newFalsification.trim()]);
    setNewFalsification('');
    setIsSaved(true);
  };

  const handleSaveProtocol = () => {
    updateExperimentPlan(
      activeInvestigation.id,
      activeInvestigation.experimentPlan.title,
      methodologyText,
      activeInvestigation.experimentPlan.successCriteria
    );
    setIsSaved(true);
  };

  const handleAddObservation = () => {
    if (!newObservation.trim()) return;
    const timestamp = new Date().toLocaleTimeString();
    const entry = `[${timestamp}] ${newObservation.trim()}`;
    const current = activeInvestigation.experimentPlan.observations || '';
    const updated = current ? `${current}\n${entry}` : entry;
    recordObservation(activeInvestigation.id, updated);
    setNewObservation('');
  };

  const handleAddEvidence = () => {
    if (!newEvidenceQuote.trim()) return;
    const newRecord: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      userId: activeInvestigation.userId || 'user-default',
      sourceId: `src-${Date.now()}`,
      relationshipId: '',
      hypothesisId: activeInvestigation.id,
      sourceTitle: newEvidenceSource.trim() || 'Laboratory Note',
      verbatimQuote: newEvidenceQuote.trim(),
      startChar: 0,
      endChar: newEvidenceQuote.trim().length,
      stance: newEvidenceStance,
      createdAt: new Date().toISOString(),
    };
    const updated = [newRecord, ...evidenceList];
    setEvidenceList(updated);
    setNewEvidenceQuote('');
    setNewEvidenceSource('');
  };

  const handleReconcile = (outcome: InvestigationOutcome) => {
    reconcileInvestigationOutcome(activeInvestigation.id, outcome);
  };

  const handleNavigateToUniverse = () => {
    if (linkedDiscovery) {
      const rel = relationships.find(
        (r) =>
          (r.sourceConceptId === linkedDiscovery.conceptAId && r.targetConceptId === linkedDiscovery.conceptBId) ||
          (r.sourceConceptId === linkedDiscovery.conceptBId && r.targetConceptId === linkedDiscovery.conceptAId)
      );
      if (rel) {
        selectRelationship(rel.id);
      }
    }
    setViewMode('universe');
  };

  const currentStageIndex = STAGES.findIndex((s) => s.key === activeInvestigation.stage);

  return (
    <div className="flex-1 flex flex-col h-full bg-cream overflow-hidden select-none animate-fade-in">
      {/* Workbench Header */}
      <div className="px-6 py-3.5 border-b border-ink/10 bg-[#FCFAF5]/95 backdrop-blur-sm shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-royal-subtle text-royal font-semibold border border-royal/20">
                Discovery Lab Bench
              </span>
              <span className="text-ink-muted text-xs">•</span>
              <span className="text-xs font-mono text-ink-muted">
                {activeInvestigation.id}
              </span>
            </div>
            <h1 className="text-sm md:text-base font-semibold text-ink-primary mt-1 tracking-tight">
              {activeInvestigation.title}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {safetyCheckResult.decision === 'RESTRICT' ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-tangerine-subtle border border-tangerine/30 text-tangerine text-xs font-medium">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Boundary Constrained Investigation</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-royal-subtle border border-royal/20 text-royal text-xs font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ethically Verified Safe Protocol</span>
              </div>
            )}
          </div>
        </div>

        {/* Progression Stepper */}
        <div className="mt-3.5 pt-3 border-t border-ink/8 flex items-center justify-between max-w-2xl">
          {STAGES.map((s, idx) => {
            const isCompleted = idx < currentStageIndex || activeInvestigation.stage === 'completed';
            const isCurrent = s.key === activeInvestigation.stage;

            return (
              <div key={s.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex items-center gap-1.5">
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                      isCompleted
                        ? 'bg-royal text-white shadow-2xs'
                        : isCurrent
                        ? 'bg-tangerine text-white ring-2 ring-tangerine/30'
                        : 'bg-cream-200 text-ink-muted'
                    }`}
                  >
                    {isCompleted ? '✓' : s.step}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors ${
                      isCurrent
                        ? 'text-ink-primary font-semibold'
                        : isCompleted
                        ? 'text-royal'
                        : 'text-ink-muted'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < STAGES.length - 1 && (
                  <div className="flex-1 mx-2.5 h-1 bg-cream-300 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isCompleted ? 'bg-gradient-to-r from-royal via-sky-400 to-royal animate-liquid-bar w-full' : 'bg-transparent w-0'
                      }`}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Investigation Columns */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-w-5xl mx-auto w-full">
        {/* Stage 1: Scientific Question & Hypothesis */}
        <div className="p-4 rounded-xl bg-[#F0F5FF] border border-[#315FE9]/30 shadow-[0_4px_16px_rgba(49,95,233,0.08)] space-y-3 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-royal" />
              <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wide">
                1. Scientific Question & Null Hypothesis
              </h3>
            </div>
            {isSaved && (
              <span className="text-[10px] font-mono text-royal font-medium animate-fade-in">
                Saved ✓
              </span>
            )}
          </div>

          <div>
            <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">
              Governing Research Question
            </label>
            <input
              type="text"
              value={researchQuestion}
              onChange={(e) => setResearchQuestion(e.target.value)}
              className="w-full bg-cream-100 border border-ink/10 rounded-md px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal"
            />
          </div>

          <div>
            <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">
              Mechanistic Hypothesis Statement
            </label>
            <textarea
              rows={2}
              value={hypothesisText}
              onChange={(e) => setHypothesisText(e.target.value)}
              onBlur={() => {
                updateHypothesis(activeInvestigation.id, hypothesisText, activeInvestigation.assumptions);
                setIsSaved(true);
              }}
              className="w-full bg-cream-100 border border-ink/10 rounded-md px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal leading-relaxed"
            />
          </div>

          {/* Falsification Criteria */}
          <div>
            <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">
              Popperian Falsification Invariants
            </label>
            <div className="space-y-1.5 mb-2">
              {falsifications.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded bg-cream-100 border border-ink/8 text-xs text-ink-secondary">
                  <span className="leading-relaxed">&bull; {f}</span>
                  <button
                    onClick={() => setFalsifications(falsifications.filter((_, idx) => idx !== i))}
                    className="text-ink-muted hover:text-tangerine p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add falsification condition (e.g. If jitter exceeds 50ms)..."
                value={newFalsification}
                onChange={(e) => setNewFalsification(e.target.value)}
                className="flex-1 bg-cream-100 border border-ink/10 rounded px-2.5 py-1 text-xs text-ink-primary focus:outline-none focus:border-royal"
              />
              <button
                onClick={handleAddFalsification}
                className="px-2.5 py-1 rounded bg-cream-200 hover:bg-cream-300 text-ink-primary text-xs font-medium border border-ink/10 transition-colors"
              >
                Add Invariant
              </button>
            </div>
          </div>
        </div>

        {/* Stage 2: Empirical Benchmark Protocol */}
        <div className="p-4 rounded-xl bg-[#F5F3FF] border border-[#7C3AED]/30 shadow-[0_4px_16px_rgba(124,58,237,0.08)] space-y-3 animate-fade-in-up" style={{ animationDelay: '50ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-royal" />
              <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wide">
                2. Empirical Benchmark Protocol
              </h3>
            </div>
            <button
              onClick={handleSaveProtocol}
              className="text-[10px] px-2.5 py-1 rounded-lg bg-royal text-white font-medium hover:bg-royal-hover shadow-xs active:scale-98 transition-all"
            >
              Update Protocol
            </button>
          </div>

          <div>
            <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">
              Methodology & Simulation Setup
            </label>
            <textarea
              rows={2}
              value={methodologyText}
              onChange={(e) => setMethodologyText(e.target.value)}
              className="w-full bg-[#FAF7F0] border border-ink/10 rounded-lg px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal leading-relaxed"
            />
          </div>

          {/* Quantitative Acceptance Criteria */}
          <div>
            <label className="text-[10px] font-mono text-ink-muted uppercase block mb-1">
              Quantitative Acceptance Criteria
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {activeInvestigation.experimentPlan.successCriteria?.map((criterion, idx) => (
                <div key={idx} className="p-2.5 rounded-lg bg-[#FAF7F0] border border-ink/8 flex items-center justify-between text-xs">
                  <span className="text-ink-secondary truncate pr-2">{criterion.metricName || (criterion as any).metric}</span>
                  <span className="font-mono text-[10px] text-royal font-semibold shrink-0">
                    {criterion.operator} {criterion.targetThreshold}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stage 3: Telemetry & Observations */}
        <div className="p-4 rounded-xl bg-[#FFF7ED] border border-[#E97942]/35 shadow-[0_4px_16px_rgba(233,121,66,0.08)] space-y-3 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-tangerine" />
              <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wide">
                3. Telemetry & Observations Log
              </h3>
            </div>
            {/* Live Oscilloscope Frequency Waveform */}
            <div className="flex items-end gap-1 h-5 px-2 py-0.5 rounded-md bg-tangerine/10 border border-tangerine/20" title="Live Empirical Waveform Telemetry">
              {[0.2, 0.7, 0.4, 0.9, 0.5, 0.8, 0.3, 0.6].map((delay, i) => (
                <span
                  key={i}
                  className="w-1 bg-tangerine rounded-full"
                  style={{
                    animation: `oscBounce 1.2s ease-in-out infinite`,
                    animationDelay: `${delay}s`,
                  }}
                />
              ))}
            </div>
          </div>

          {activeInvestigation.experimentPlan.observations ? (
            <div className="p-3 rounded-lg bg-white/80 border border-ink/8 text-xs text-ink-secondary font-mono whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
              {activeInvestigation.experimentPlan.observations}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-white/80 border border-dashed border-ink/15 text-center text-xs text-ink-muted">
              No observations recorded yet. Append empirical telemetry below.
            </div>
          )}

          <div className="space-y-2">
            <textarea
              value={newObservation}
              onChange={(e) => setNewObservation(e.target.value)}
              rows={2}
              placeholder="Log quantitative observations or benchmark readings..."
              className="w-full rounded-lg bg-white border border-ink/10 px-3 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal font-mono"
            />
            <div className="flex justify-end">
              <button
                onClick={handleAddObservation}
                disabled={!newObservation.trim()}
                className="px-3 py-1.5 rounded-lg bg-tangerine hover:bg-tangerine-hover text-white text-xs font-medium shadow-card transition-all active:scale-98 disabled:opacity-40"
              >
                Append Telemetry
              </button>
            </div>
          </div>
        </div>

        {/* Stage 4: Verbatim Evidence Records */}
        <div className="p-4 rounded-xl bg-[#ECFEFF] border border-[#06B6D4]/35 shadow-[0_4px_16px_rgba(6,182,212,0.08)] space-y-3 animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center gap-2">
            <Quote className="w-4 h-4 text-royal" />
            <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wide">
              4. Empirical Evidence Grounding
            </h3>
          </div>

          <div className="space-y-2">
            {evidenceList.map((ev) => (
              <div key={ev.id} className="p-2.5 rounded-lg bg-white/90 border border-ink/8 text-xs space-y-1">
                <div className="flex items-center justify-between text-[10px] text-ink-muted font-mono">
                  <span className="font-semibold text-ink-secondary truncate max-w-[200px]">{ev.sourceTitle}</span>
                  <span
                    className={`px-1.5 py-0.2 rounded uppercase font-bold text-[9px] ${
                      ev.stance === 'supports'
                        ? 'text-royal bg-royal-subtle border border-royal/20'
                        : ev.stance === 'refutes'
                        ? 'text-tangerine bg-tangerine-subtle border border-tangerine/20'
                        : 'text-ink-muted bg-cream-200'
                    }`}
                  >
                    {ev.stance}
                  </span>
                </div>
                <p className="text-ink-secondary italic font-mono text-[11px] leading-relaxed">
                  &ldquo;{ev.verbatimQuote}&rdquo;
                </p>
              </div>
            ))}
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-white/80 border border-ink/8">
            <input
              type="text"
              placeholder="Source Title / Paper Reference..."
              value={newEvidenceSource}
              onChange={(e) => setNewEvidenceSource(e.target.value)}
              className="w-full bg-[#FCFAF5] border border-ink/10 rounded-lg px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal"
            />
            <textarea
              placeholder="Verbatim quote or measured excerpt..."
              value={newEvidenceQuote}
              onChange={(e) => setNewEvidenceQuote(e.target.value)}
              rows={2}
              className="w-full bg-[#FCFAF5] border border-ink/10 rounded-lg px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none focus:border-royal font-mono"
            />
            <div className="flex items-center justify-between">
              <select
                value={newEvidenceStance}
                onChange={(e) => setNewEvidenceStance(e.target.value as any)}
                className="bg-[#FCFAF5] border border-ink/10 rounded-lg px-2.5 py-1.5 text-xs text-ink-primary focus:outline-none"
              >
                <option value="supports">Stance: Supports</option>
                <option value="refutes">Stance: Refutes</option>
                <option value="neutral">Stance: Neutral</option>
              </select>
              <button
                onClick={handleAddEvidence}
                disabled={!newEvidenceQuote.trim()}
                className="px-3 py-1.5 rounded-lg bg-royal hover:bg-royal-hover text-white text-xs font-medium disabled:opacity-40 transition-all shadow-card active:scale-98"
              >
                Attach Evidence Record
              </button>
            </div>
          </div>
        </div>

        {/* Stage 5: Epistemic Outcome Reconciliation & Graph Connection */}
        <div className="p-4 rounded-xl bg-[#F0FDF4] border border-[#10B981]/35 shadow-[0_4px_16px_rgba(16,185,129,0.08)] space-y-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-royal" />
              <h3 className="text-xs font-semibold text-ink-primary uppercase tracking-wide">
                5. Epistemic Conclusion & Knowledge Graph Reconciliation
              </h3>
            </div>
            {activeInvestigation.experimentPlan.outcome && (
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                  activeInvestigation.experimentPlan.outcome === 'supported'
                    ? 'bg-royal-subtle text-royal border border-royal/30'
                    : activeInvestigation.experimentPlan.outcome === 'partially_supported'
                    ? 'bg-tangerine-subtle text-tangerine border border-tangerine/30'
                    : activeInvestigation.experimentPlan.outcome === 'refuted'
                    ? 'bg-cream-200 text-ink-muted border border-ink/20'
                    : 'bg-cream-200 text-ink-muted border border-ink/20'
                }`}
              >
                {activeInvestigation.experimentPlan.outcome.replace(/_/g, ' ')}
              </span>
            )}
          </div>

          <p className="text-xs text-ink-muted leading-relaxed">
            Reconcile the investigation to promote verified findings as accepted edges in the Knowledge Graph, or record falsification in the audit ledger.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <button
              onClick={() => handleReconcile('supported')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-royal hover:bg-royal-hover text-white text-xs font-medium shadow-xs transition-all active:scale-98"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Promote as Edge</span>
            </button>
            <button
              onClick={() => handleReconcile('partially_supported')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-tangerine hover:bg-tangerine-hover text-white text-xs font-medium shadow-xs transition-all active:scale-98"
            >
              <span>Partially Valid</span>
            </button>
            <button
              onClick={() => handleReconcile('refuted')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-cream-200 hover:bg-cream-300 text-ink-primary border border-ink/15 text-xs font-medium transition-all active:scale-98"
            >
              <XCircle className="w-3.5 h-3.5 text-tangerine" />
              <span>Record Refuted</span>
            </button>
            <button
              onClick={() => handleReconcile('inconclusive')}
              className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md bg-cream-100 hover:bg-cream-200 text-ink-muted border border-ink/10 text-xs font-medium transition-all active:scale-98"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Inconclusive</span>
            </button>
          </div>

          {/* Connected Findings Back to Knowledge Graph Banner */}
          {activeInvestigation.stage === 'completed' && (
            <div className="mt-4 p-3.5 rounded-lg bg-cream-100 border border-royal/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in-up">
              <div>
                <h4 className="text-xs font-semibold text-ink-primary flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5 text-royal" />
                  <span>Findings Synchronized with Knowledge Universe</span>
                </h4>
                <p className="text-[11px] text-ink-muted mt-0.5">
                  {activeInvestigation.experimentPlan.outcome === 'supported'
                    ? 'A verified relationship edge has been permanently established between these concepts.'
                    : 'The empirical refutation has been recorded in the knowledge audit revision trail.'}
                </p>
              </div>
              <button
                onClick={handleNavigateToUniverse}
                className="px-3 py-1.5 rounded-md bg-royal hover:bg-royal-hover text-white text-xs font-medium flex items-center justify-center gap-1.5 shadow-xs shrink-0 transition-all active:scale-98"
              >
                <span>Inspect in Graph</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
