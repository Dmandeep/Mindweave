'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { InvestigationStage, InvestigationOutcome } from '@/types/knowledge';

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
  } = useKnowledgeStore();

  const activeInvestigation = investigations.find((inv) => inv.id === activeInvestigationId);
  const linkedDiscovery = discoveryCandidates.find((d) => d.id === activeInvestigation?.discoveryId);

  // Local state for editing fields
  const [hypothesisText, setHypothesisText] = useState(activeInvestigation?.hypothesisStatement || '');
  const [newAssumption, setNewAssumption] = useState('');
  const [methodologyText, setMethodologyText] = useState(
    activeInvestigation?.experimentPlan?.methodology || ''
  );
  const [newObservation, setNewObservation] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Sync local fields when active investigation changes
  React.useEffect(() => {
    if (activeInvestigation) {
      setHypothesisText(activeInvestigation.hypothesisStatement);
      setMethodologyText(activeInvestigation.experimentPlan.methodology);
      setIsSaved(false);
    }
  }, [activeInvestigationId, activeInvestigation]);

  if (!activeInvestigation) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-cosmic-950">
        <div className="w-16 h-16 rounded-2xl bg-discovery-500/10 border border-discovery-500/20 flex items-center justify-center text-discovery-400 mb-4 shadow-xl">
          <FlaskConical className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-semibold text-cosmic-100 mb-2">No Active Investigation</h3>
        <p className="text-sm text-cosmic-400 max-w-md mb-6 leading-relaxed">
          Select an ongoing investigation from the left sidebar or promote a discovery candidate from the queue to start an empirical test protocol.
        </p>
        {investigations.length > 0 && (
          <div className="flex flex-col gap-2 w-full max-w-sm">
            <span className="text-xs font-semibold text-cosmic-400 uppercase tracking-wider mb-1">
              Recent Investigations:
            </span>
            {investigations.map((inv) => (
              <button
                key={inv.id}
                onClick={() => setActiveInvestigation(inv.id)}
                className="text-left px-3 py-2 rounded-lg bg-cosmic-900 hover:bg-cosmic-800 border border-cosmic-700/60 text-xs text-cosmic-200 transition-colors flex items-center justify-between group"
              >
                <span className="truncate font-medium">{inv.title}</span>
                <ArrowRight className="w-3.5 h-3.5 text-cosmic-400 group-hover:text-discovery-400 transition-colors" />
              </button>
            ))}
          </div>
        )}
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

  const handleSaveMethodology = () => {
    updateExperimentPlan(
      activeInvestigation.id,
      activeInvestigation.experimentPlan.title,
      methodologyText,
      activeInvestigation.experimentPlan.successCriteria
    );
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddObservation = () => {
    if (!newObservation.trim()) return;
    recordObservation(activeInvestigation.id, newObservation.trim());
    setNewObservation('');
  };

  const handleReconcile = (outcome: InvestigationOutcome) => {
    reconcileInvestigationOutcome(activeInvestigation.id, outcome);
  };

  return (
    <div className="h-full flex flex-col bg-cosmic-950 overflow-y-auto">
      {/* Workbench Header */}
      <div className="p-6 border-b border-cosmic-800/80 bg-cosmic-900/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-discovery-500/10 text-discovery-400 border border-discovery-500/30">
                <FlaskConical className="w-3 h-3" />
                Discovery Lab • Phase 8 Investigation
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3 h-3" />
                Policy Safe (Tier 1 Verified)
              </span>
            </div>
            <h1 className="text-xl font-bold text-cosmic-100">{activeInvestigation.title}</h1>
            <p className="text-xs text-cosmic-400 mt-1 max-w-3xl leading-relaxed">
              {activeInvestigation.summary}
            </p>
          </div>

          {/* Quick Stage Indicator */}
          <div className="flex items-center gap-1.5 bg-cosmic-950/80 p-1.5 rounded-lg border border-cosmic-800">
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
                        ? 'bg-discovery-500 text-white shadow-sm'
                        : isPast
                        ? 'text-emerald-400 bg-emerald-500/10'
                        : 'text-cosmic-500 bg-transparent'
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
          <div className="p-3 rounded-lg bg-discovery-950/40 border border-discovery-500/20 flex items-start gap-3 text-xs text-cosmic-300">
            <Sparkles className="w-4 h-4 text-discovery-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold text-discovery-300">Origin Discovery:</span>{' '}
              {linkedDiscovery.explanation}
              <div className="mt-1 flex items-center gap-3 text-[11px] text-cosmic-400 font-mono">
                <span>Domain A: {linkedDiscovery.conceptADomain}</span>
                <span>•</span>
                <span>Domain B: {linkedDiscovery.conceptBDomain}</span>
                <span>•</span>
                <span>Novelty: {Math.round(linkedDiscovery.noveltyScore * 100)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Investigation Content Grid */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Hypothesis & Assumptions */}
        <div className="space-y-6">
          {/* Step 1: Falsifiable Hypothesis Statement */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-cosmic-800/80 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-discovery-400" />
                <h3 className="text-sm font-semibold text-cosmic-100">
                  Falsifiable Hypothesis Statement
                </h3>
              </div>
              {isSaved && (
                <span className="text-xs text-emerald-400 font-medium animate-pulse">
                  ✓ Saved
                </span>
              )}
            </div>
            <p className="text-xs text-cosmic-400 mb-3">
              Must be empirically testable with unambiguous conditions under which the hypothesis is rejected.
            </p>
            <textarea
              value={hypothesisText}
              onChange={(e) => setHypothesisText(e.target.value)}
              rows={4}
              className="w-full rounded-lg bg-cosmic-950 border border-cosmic-700/80 px-3.5 py-2.5 text-xs text-cosmic-100 focus:outline-none focus:border-discovery-400 transition-colors font-mono leading-relaxed"
              placeholder="e.g. If stigmergic gradient propagation is introduced into Raft leader leases..."
            />
            <div className="mt-2.5 flex justify-end">
              <button
                onClick={handleSaveHypothesis}
                className="px-3.5 py-1.5 rounded-lg bg-discovery-600 hover:bg-discovery-500 text-white text-xs font-medium transition-colors shadow-sm"
              >
                Update Hypothesis
              </button>
            </div>
          </div>

          {/* Hidden Assumptions Checklist */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-cosmic-800/80 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-cosmic-100">
                Foundational Assumptions Checklist
              </h3>
            </div>
            <p className="text-xs text-cosmic-400 mb-3">
              Identify latent axioms that must hold true for this hypothesis to be valid.
            </p>

            <ul className="space-y-2 mb-4">
              {activeInvestigation.assumptions.map((assumption, index) => (
                <li
                  key={index}
                  className="flex items-start justify-between gap-3 p-2.5 rounded-lg bg-cosmic-950/70 border border-cosmic-800 text-xs text-cosmic-200"
                >
                  <div className="flex items-start gap-2">
                    <span className="text-cyan-400 font-mono text-[11px] shrink-0 mt-0.5">
                      #{index + 1}
                    </span>
                    <span className="leading-relaxed">{assumption}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveAssumption(index)}
                    className="text-cosmic-500 hover:text-rose-400 transition-colors shrink-0 p-0.5"
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
                className="flex-1 rounded-lg bg-cosmic-950 border border-cosmic-700/80 px-3 py-1.5 text-xs text-cosmic-200 focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <button
                onClick={handleAddAssumption}
                className="px-3 py-1.5 rounded-lg bg-cosmic-800 hover:bg-cosmic-700 text-cosmic-200 text-xs font-medium transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Experiment Design, Observations & Reconciliation */}
        <div className="space-y-6">
          {/* Step 2: Experiment Plan & Success Criteria */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-cosmic-800/80 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-cosmic-100">
                Experiment Plan & Success Criteria
              </h3>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] font-semibold text-cosmic-400 uppercase tracking-wider mb-1.5">
                Methodology & Setup
              </label>
              <textarea
                value={methodologyText}
                onChange={(e) => setMethodologyText(e.target.value)}
                rows={3}
                className="w-full rounded-lg bg-cosmic-950 border border-cosmic-700/80 px-3 py-2 text-xs text-cosmic-200 focus:outline-none focus:border-emerald-400 transition-colors font-mono"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={handleSaveMethodology}
                  className="px-3 py-1 rounded bg-cosmic-800 hover:bg-cosmic-700 text-xs text-cosmic-200 transition-colors font-medium"
                >
                  Save Methodology
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-cosmic-400 uppercase tracking-wider mb-2">
                Quantitative Success Thresholds
              </label>
              <div className="space-y-2">
                {activeInvestigation.experimentPlan.successCriteria.map((criterion) => (
                  <div
                    key={criterion.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-cosmic-950/70 border border-cosmic-800 text-xs"
                  >
                    <span className="font-medium text-cosmic-200">{criterion.metricName}</span>
                    <span className="font-mono text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      {criterion.operator} {criterion.targetThreshold}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Observations & Empirical Notes */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-cosmic-800/80 shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-cosmic-100">
                Empirical Observations Log
              </h3>
            </div>

            {activeInvestigation.experimentPlan.observations ? (
              <div className="p-3 rounded-lg bg-cosmic-950/90 border border-cosmic-800 text-xs text-cosmic-300 font-mono whitespace-pre-wrap leading-relaxed mb-4 max-h-48 overflow-y-auto">
                {activeInvestigation.experimentPlan.observations}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-cosmic-950/50 border border-dashed border-cosmic-800 text-center text-xs text-cosmic-500 mb-4">
                No observations recorded yet. Run tests or simulation runs and document measured results.
              </div>
            )}

            <div className="space-y-2">
              <textarea
                value={newObservation}
                onChange={(e) => setNewObservation(e.target.value)}
                rows={2}
                placeholder="Log quantitative telemetry, metrics, or observed anomalies..."
                className="w-full rounded-lg bg-cosmic-950 border border-cosmic-700/80 px-3 py-2 text-xs text-cosmic-200 focus:outline-none focus:border-amber-400 transition-colors"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleAddObservation}
                  disabled={!newObservation.trim()}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-medium transition-colors disabled:opacity-40"
                >
                  Append Log Entry
                </button>
              </div>
            </div>
          </div>

          {/* Step 4 & 5: Outcome Reconciliation */}
          <div className="p-5 rounded-xl bg-cosmic-900/60 border border-cosmic-800/80 shadow-md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-cosmic-100">
                  Epistemic Outcome Reconciliation
                </h3>
              </div>
              {activeInvestigation.experimentPlan.outcome && (
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider ${
                    activeInvestigation.experimentPlan.outcome === 'supported'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : activeInvestigation.experimentPlan.outcome === 'refuted'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                  }`}
                >
                  {activeInvestigation.experimentPlan.outcome}
                </span>
              )}
            </div>
            <p className="text-xs text-cosmic-400 mb-4 leading-relaxed">
              Upon verifying test results against success criteria, conclude the inquiry to promote the relationship to the persistent Knowledge Universe or document the refutation in the audit log.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => handleReconcile('supported')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <CheckCircle2 className="w-4 h-4" />
                Promote Edge
              </button>
              <button
                onClick={() => handleReconcile('refuted')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 text-xs font-semibold transition-all hover:scale-[1.02]"
              >
                <XCircle className="w-4 h-4" />
                Record Refuted
              </button>
              <button
                onClick={() => handleReconcile('inconclusive')}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-cosmic-800 hover:bg-cosmic-700 text-cosmic-300 border border-cosmic-700 text-xs font-medium transition-all"
              >
                <HelpCircle className="w-4 h-4" />
                Inconclusive
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
