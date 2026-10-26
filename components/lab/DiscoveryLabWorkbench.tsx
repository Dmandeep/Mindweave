'use client';

import React, { useState, useEffect } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import {
  FlaskConical,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
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
  Link as LinkIcon,
  Quote,
  ShieldAlert,
} from 'lucide-react';
import { InvestigationStage, InvestigationOutcome, EvidenceRecord } from '@/types/knowledge';
import { evaluateSafetyPolicy } from '@/lib/safety/safetyClassifier';

const STAGES: { key: InvestigationStage; label: string; step: number }[] = [
  { key: 'hypothesis', label: '1. Hypothesis', step: 1 },
  { key: 'design', label: '2. Experiment Design', step: 2 },
  { key: 'execution', label: '3. Execution & Logs', step: 3 },
  { key: 'evaluation', label: '4. Evaluation', step: 4 },
  { key: 'completed', label: '5. Outcome', step: 5 },
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
    setActiveInvestigation,
    setViewMode,
  } = useKnowledgeStore();

  const activeInvestigation = investigations.find((inv) => inv.id === activeInvestigationId);
  const linkedDiscovery = discoveryCandidates.find((d) => d.id === activeInvestigation?.discoveryId);

  // Local state for editing fields
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
      'If asynchronous consensus fails under bounded clock skew despite lease expiration.',
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

  // Sync local fields when active investigation changes
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

      // Run safety check on methodology
      evaluateSafetyPolicy(activeInvestigation.experimentPlan.methodology, 'experiment', 'generate_plan').then((res) => {
        setSafetyCheckResult({
          decision: res.decision,
          rationale: res.rationaleSummary,
        });
      });
    }
  }, [activeInvestigationId, activeInvestigation, linkedDiscovery]);

  if (!activeInvestigation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-cosmic-950">
        <div className="w-16 h-16 rounded-2xl bg-discovery/10 border border-discovery/20 flex items-center justify-center text-discovery mb-4 shadow-xl">
          <FlaskConical className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">No Active Investigation</h3>
        <p className="text-xs text-text-muted max-w-md mb-6 leading-relaxed">
          Select an ongoing investigation from the left sidebar, or promote a candidate from the Discoveries Workspace to start an empirical test protocol.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setViewMode('discoveries')}
            className="px-4 py-2 rounded-lg bg-discovery hover:bg-discovery-dark text-white text-xs font-medium transition-colors"
          >
            Explore Discoveries Queue
          </button>
          <button
            onClick={() => setViewMode('universe')}
            className="px-4 py-2 rounded-lg bg-cosmic-800 hover:bg-cosmic-700 text-foreground text-xs font-medium border border-border transition-colors"
          >
            Open Knowledge Universe
          </button>
        </div>
      </div>
    );
  }

  const currentStageIndex = STAGES.findIndex((s) => s.key === activeInvestigation.stage);

  // Handlers
  const handleSaveHypothesis = () => {
    updateHypothesis(activeInvestigation.id, hypothesisText, activeInvestigation.assumptions);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddAssumption = () => {
    if (!newAssumption.trim()) return;
    const updated = [...activeInvestigation.assumptions, newAssumption.trim()];
    updateHypothesis(activeInvestigation.id, hypothesisText, updated);
    setNewAssumption('');
  };

  const handleRemoveAssumption = (indexToRemove: number) => {
    const updated = activeInvestigation.assumptions.filter((_, idx) => idx !== indexToRemove);
    updateHypothesis(activeInvestigation.id, hypothesisText, updated);
  };

  const handleAddFalsification = () => {
    if (!newFalsification.trim()) return;
    setFalsifications([...falsifications, newFalsification.trim()]);
    setNewFalsification('');
  };

  const handleSaveMethodology = () => {
    updateExperimentPlan(
      activeInvestigation.id,
      activeInvestigation.experimentPlan.title,
      methodologyText,
      activeInvestigation.experimentPlan.successCriteria
    );
    evaluateSafetyPolicy(methodologyText, 'experiment', 'generate_plan').then((res) => {
      setSafetyCheckResult({
        decision: res.decision,
        rationale: res.rationaleSummary,
      });
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddObservation = () => {
    if (!newObservation.trim()) return;
    recordObservation(activeInvestigation.id, newObservation.trim());
    setNewObservation('');
  };

  const handleAddEvidence = () => {
    if (!newEvidenceQuote.trim()) return;
    const newRecord: EvidenceRecord = {
      id: `ev-${Date.now()}`,
      userId: 'user-default',
      sourceId: linkedDiscovery?.conceptAId || 'src-manual',
      sourceTitle: newEvidenceSource.trim() || 'Empirical Lab Observation',
      verbatimQuote: newEvidenceQuote.trim(),
      startChar: 0,
      endChar: newEvidenceQuote.trim().length,
      stance: newEvidenceStance,
      createdAt: new Date().toISOString(),
    };
    const updated = [...evidenceList, newRecord];
    setEvidenceList(updated);
    setNewEvidenceQuote('');
    setNewEvidenceSource('');
  };

  const handleReconcile = (outcome: InvestigationOutcome) => {
    reconcileInvestigationOutcome(activeInvestigation.id, outcome);
  };

  return (
    <div className="h-full flex flex-col bg-cosmic-950 overflow-y-auto">
      {/* Workbench Header */}
      <div className="p-6 border-b border-border bg-cosmic-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-discovery/15 text-discovery border border-discovery/30 font-mono">
                <FlaskConical className="w-3 h-3" />
                Discovery Lab • Phase 3 Investigation
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium font-mono border ${
                  safetyCheckResult.decision === 'ALLOW'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-conflict/10 text-conflict border-conflict/30'
                }`}
              >
                {safetyCheckResult.decision === 'ALLOW' ? (
                  <ShieldCheck className="w-3 h-3" />
                ) : (
                  <ShieldAlert className="w-3 h-3" />
                )}
                Safety: {safetyCheckResult.decision}
              </span>
            </div>
            <h1 className="text-xl font-bold text-foreground">{activeInvestigation.title}</h1>
            <p className="text-xs text-text-muted mt-1 max-w-3xl leading-relaxed">
              {activeInvestigation.summary}
            </p>
          </div>

          {/* Quick Stage Indicator */}
          <div className="flex items-center gap-1.5 bg-cosmic-950/80 p-1.5 rounded-lg border border-border">
            {STAGES.map((s, idx) => {
              const isPast = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              return (
                <div
                  key={s.key}
                  className={`
                    px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors
                    ${
                      isCurrent
                        ? 'bg-discovery text-white shadow-sm'
                        : isPast
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-text-muted bg-transparent'
                    }
                  `}
                >
                  {s.label}
                </div>
              );
            })}
          </div>
        </div>

        {/* Linked Discovery Reference Banner */}
        {linkedDiscovery && (
          <div className="p-3 rounded-lg bg-discovery/5 border border-discovery/20 flex items-start justify-between gap-3 text-xs text-text-secondary">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-discovery shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-discovery-light">Origin Discovery:</span>{' '}
                {linkedDiscovery.explanation}
                <div className="mt-1 flex items-center gap-3 text-[11px] text-text-muted font-mono">
                  <span>Domain A: {linkedDiscovery.conceptADomain}</span>
                  <span>•</span>
                  <span>Domain B: {linkedDiscovery.conceptBDomain}</span>
                  <span>•</span>
                  <span>Composite Score: {Math.round(linkedDiscovery.compositeScore * 100)}%</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setViewMode('universe')}
              className="px-2.5 py-1 rounded bg-cosmic-800 hover:bg-cosmic-700 text-text-secondary hover:text-foreground text-[11px] font-mono border border-border shrink-0 flex items-center gap-1"
            >
              <Compass className="w-3 h-3 text-causal" />
              <span>Locate in Graph</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Investigation Content Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Hypothesis, Assumptions, and Falsification */}
        <div className="space-y-6">
          {/* Step 1: Research Question & Falsifiable Hypothesis Statement */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-discovery" />
                <h3 className="text-sm font-semibold text-foreground">
                  Falsifiable Hypothesis Formulation
                </h3>
              </div>
              {isSaved && (
                <span className="text-xs text-emerald-400 font-medium animate-pulse">
                  ✓ Saved
                </span>
              )}
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Core Research Question
              </label>
              <input
                type="text"
                value={researchQuestion}
                onChange={(e) => setResearchQuestion(e.target.value)}
                className="w-full rounded-lg bg-cosmic-950 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-discovery/60 font-mono"
                placeholder="e.g. Can localized biological decay invariants prevent computational split-brain states?"
              />
            </div>

            <div className="mb-3">
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1">
                Formal Hypothesis Statement
              </label>
              <textarea
                value={hypothesisText}
                onChange={(e) => setHypothesisText(e.target.value)}
                rows={4}
                className="w-full rounded-lg bg-cosmic-950 border border-border px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:border-discovery/60 transition-colors font-mono leading-relaxed"
                placeholder="If [Condition X], then [Measurable Consequence Y] because [Causal Invariant Z]..."
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveHypothesis}
                className="px-3.5 py-1.5 rounded-lg bg-discovery hover:bg-discovery-dark text-white text-xs font-medium transition-colors shadow-sm"
              >
                Update Hypothesis
              </button>
            </div>
          </div>

          {/* Hidden Assumptions Checklist */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-causal" />
              <h3 className="text-sm font-semibold text-foreground">
                Foundational Axioms & Assumptions
              </h3>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Identify latent operational prerequisites that must hold true for this hypothesis to be valid.
            </p>

            <ul className="space-y-2 mb-4">
              {activeInvestigation.assumptions.map((assumption, index) => (
                <li
                  key={index}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-cosmic-950/70 border border-border text-xs text-text-secondary"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-causal font-mono text-[11px] shrink-0 mt-0.5">
                      #{index + 1}
                    </span>
                    <span className="leading-relaxed">{assumption}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAssumption(index)}
                    className="text-text-muted hover:text-conflict transition-colors shrink-0 p-0.5"
                    title="Remove assumption"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <input
                type="text"
                value={newAssumption}
                onChange={(e) => setNewAssumption(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddAssumption()}
                placeholder="Add another underlying assumption..."
                className="flex-1 rounded-lg bg-cosmic-950 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-causal"
              />
              <button
                onClick={handleAddAssumption}
                className="px-3 py-1.5 rounded-lg bg-cosmic-800 hover:bg-cosmic-700 text-foreground text-xs font-medium border border-border transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>

          {/* Falsification Conditions */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-conflict" />
              <h3 className="text-sm font-semibold text-foreground">
                Explicit Falsification Conditions
              </h3>
            </div>
            <p className="text-xs text-text-muted mb-3">
              Define the exact measurable criteria under which this hypothesis is empirically rejected.
            </p>

            <ul className="space-y-2 mb-3">
              {falsifications.map((cond, idx) => (
                <li
                  key={idx}
                  className="flex items-start justify-between gap-2 p-2 rounded bg-conflict/5 border border-conflict/20 text-xs text-conflict-light"
                >
                  <span className="leading-relaxed font-mono text-[11px]">✕ {cond}</span>
                  <button
                    onClick={() => setFalsifications(falsifications.filter((_, i) => i !== idx))}
                    className="text-conflict/60 hover:text-conflict p-0.5"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
            </ul>

            <div className="flex gap-2">
              <input
                type="text"
                value={newFalsification}
                onChange={(e) => setNewFalsification(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFalsification()}
                placeholder="Condition under which hypothesis is false..."
                className="flex-1 rounded-lg bg-cosmic-950 border border-border px-3 py-1.5 text-xs text-foreground focus:outline-none focus:border-conflict"
              />
              <button
                onClick={handleAddFalsification}
                className="px-3 py-1.5 rounded-lg bg-conflict/20 hover:bg-conflict/30 text-conflict-light text-xs font-medium border border-conflict/30 transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Experiment Design, Evidence Records, Observations & Outcome */}
        <div className="space-y-6">
          {/* Step 2: Experiment Plan & Success Criteria */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Experiment Plan & Quantitative Criteria
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">
                Experimental Protocol & Methodology
              </label>
              <textarea
                value={methodologyText}
                onChange={(e) => setMethodologyText(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-cosmic-950 border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-emerald-400 transition-colors font-mono"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleSaveMethodology}
                  className="px-3 py-1 rounded bg-cosmic-800 hover:bg-cosmic-700 text-xs text-foreground transition-colors font-medium border border-border"
                >
                  Save Protocol
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                Quantitative Success Criteria
              </label>
              <div className="space-y-2">
                {activeInvestigation.experimentPlan.successCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-cosmic-950/70 border border-border text-xs"
                  >
                    <span className="font-medium text-text-secondary">{criterion.metricName}</span>
                    <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {criterion.operator} {criterion.targetThreshold}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Evidence Records Grounding */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Quote className="w-4 h-4 text-discovery" />
              <h3 className="text-sm font-semibold text-foreground">
                Empirical Evidence Records
              </h3>
            </div>

            <div className="space-y-2 mb-3">
              {evidenceList.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-cosmic-950/80 border border-border text-xs space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px] text-text-muted font-mono">
                    <span className="font-semibold text-text-secondary">{ev.sourceTitle}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded uppercase font-bold text-[9px] ${
                        ev.stance === 'supports'
                          ? 'text-emerald-400 bg-emerald-500/10'
                          : ev.stance === 'refutes'
                          ? 'text-conflict bg-conflict/10'
                          : 'text-text-muted bg-cosmic-900'
                      }`}
                    >
                      {ev.stance}
                    </span>
                  </div>
                  <p className="text-text-secondary italic font-mono text-[11px]">
                    &ldquo;{ev.verbatimQuote}&rdquo;
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-2 p-3 rounded-lg bg-cosmic-950/40 border border-border">
              <input
                type="text"
                placeholder="Source Citation / Paper Title / Benchmark Run..."
                value={newEvidenceSource}
                onChange={(e) => setNewEvidenceSource(e.target.value)}
                className="w-full bg-cosmic-950 border border-border rounded px-3 py-1 text-xs text-foreground focus:outline-none focus:border-discovery"
              />
              <textarea
                placeholder="Verbatim quote or measured telemetry excerpt..."
                value={newEvidenceQuote}
                onChange={(e) => setNewEvidenceQuote(e.target.value)}
                rows={2}
                className="w-full bg-cosmic-950 border border-border rounded px-3 py-1 text-xs text-foreground focus:outline-none focus:border-discovery font-mono"
              />
              <div className="flex items-center justify-between">
                <select
                  value={newEvidenceStance}
                  onChange={(e) => setNewEvidenceStance(e.target.value as any)}
                  className="bg-cosmic-950 border border-border rounded px-2 py-1 text-xs text-foreground focus:outline-none"
                >
                  <option value="supports">Stance: Supports</option>
                  <option value="refutes">Stance: Refutes</option>
                  <option value="neutral">Stance: Neutral</option>
                </select>
                <button
                  onClick={handleAddEvidence}
                  disabled={!newEvidenceQuote.trim()}
                  className="px-3 py-1 rounded bg-discovery hover:bg-discovery-dark text-white text-xs font-medium disabled:opacity-40"
                >
                  Attach Evidence Record
                </button>
              </div>
            </div>
          </div>

          {/* Observations Log */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-foreground">
                Empirical Telemetry & Observations Log
              </h3>
            </div>

            {activeInvestigation.experimentPlan.observations ? (
              <div className="p-3 rounded-lg bg-cosmic-950/90 border border-border text-xs text-text-secondary font-mono whitespace-pre-wrap leading-relaxed mb-4 max-h-48 overflow-y-auto">
                {activeInvestigation.experimentPlan.observations}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-cosmic-950/50 border border-dashed border-border text-center text-xs text-text-muted mb-4">
                No observations recorded yet. Run benchmark iterations or telemetry queries and document measured data.
              </div>
            )}

            <div className="space-y-2">
              <textarea
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                rows={2}
                placeholder="Log quantitative telemetry, metrics, or observed anomalies..."
                className="w-full rounded-lg bg-cosmic-950 border border-border px-3 py-2 text-xs text-foreground focus:outline-none focus:border-amber-400 font-mono"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddObservation}
                  disabled={!newObservation.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  Append Telemetry Entry
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 & 5: Outcome Reconciliation */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-border shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-foreground">
                  Epistemic Outcome Reconciliation
                </h3>
              </div>
              {activeInvestigation.experimentPlan.outcome && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                    activeInvestigation.experimentPlan.outcome === 'supported'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : activeInvestigation.experimentPlan.outcome === 'partially_supported'
                      ? 'bg-causal/20 text-causal-light border border-causal/40'
                      : activeInvestigation.experimentPlan.outcome === 'refuted'
                      ? 'bg-conflict/20 text-conflict border border-conflict/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {activeInvestigation.experimentPlan.outcome.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Upon verifying empirical telemetry against success criteria, conclude the inquiry to promote the relationship to the persistent Knowledge Universe, or record the refutation in the audit history.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                onClick={() => handleReconcile('supported')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Promote Edge</span>
              </button>
              <button
                onClick={() => handleReconcile('partially_supported')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-causal/20 hover:bg-causal/30 text-causal-light border border-causal/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <span>Partially Valid</span>
              </button>
              <button
                onClick={() => handleReconcile('refuted')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-conflict/20 hover:bg-conflict/30 text-conflict border border-conflict/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Record Refuted</span>
              </button>
              <button
                onClick={() => handleReconcile('inconclusive')}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-cosmic-800 hover:bg-cosmic-700 text-text-secondary border border-border text-xs font-medium transition-all"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Inconclusive</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
