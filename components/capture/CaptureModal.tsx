'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { X, Sparkles, ArrowRight } from 'lucide-react';

export const CaptureModal: React.FC = () => {
  const { isCaptureModalOpen, setCaptureModalOpen, addSourceAndExtract } = useKnowledgeStore();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [sourceType, setSourceType] = useState<'text' | 'markdown'>('text');

  if (!isCaptureModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    addSourceAndExtract(title || 'Untitled Note', content, sourceType);
    setTitle('');
    setContent('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-xs animate-fade-in select-none"
      onClick={() => setCaptureModalOpen(false)}
    >
      <div 
        className="w-full max-w-lg bg-white border border-ink/12 rounded-xl shadow-xl overflow-hidden flex flex-col animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-3.5 border-b border-ink/10 flex items-center justify-between bg-cream-100">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded-md bg-royal-subtle flex items-center justify-center text-royal border border-royal/20">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-xs font-semibold text-ink-primary">Knowledge Note Capture</h3>
              <p className="text-[10px] text-ink-muted">
                Capture research observations. Concepts and relationships will be extracted automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCaptureModalOpen(false)}
            className="p-1 rounded text-ink-muted hover:text-ink-primary hover:bg-cream-200 transition-colors"
            aria-label="Close capture modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-[11px] font-medium text-ink-secondary block mb-1">
              Note Title or Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Asynchronous Paxos Consensus Benchmarks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-cream-100 border border-ink/10 text-xs rounded-md px-2.5 py-1.5 text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-medium text-ink-secondary">
                Raw Content / Research Notes
              </label>
              <div className="flex items-center space-x-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSourceType('text')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sourceType === 'text' 
                      ? 'bg-royal text-white font-medium shadow-2xs' 
                      : 'text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('markdown')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    sourceType === 'markdown' 
                      ? 'bg-royal text-white font-medium shadow-2xs' 
                      : 'text-ink-muted hover:text-ink-primary'
                  }`}
                >
                  Markdown
                </button>
              </div>
            </div>
            <textarea
              rows={6}
              placeholder="Paste empirical observations, paper excerpts, or research ideas..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full bg-cream-100 border border-ink/10 text-xs rounded-md px-2.5 py-2 text-ink-primary placeholder:text-ink-muted focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30 font-mono leading-relaxed"
              required
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-2 flex items-center justify-between">
            <span className="text-[10px] text-ink-muted font-mono">
              Auto-extracts nodes &amp; computes Goldilocks cross-domain bridges
            </span>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setCaptureModalOpen(false)}
                className="px-3 py-1.5 rounded-md text-xs text-ink-muted hover:text-ink-primary hover:bg-cream-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-royal hover:bg-royal-hover text-white px-3.5 py-1.5 rounded-md text-xs font-medium flex items-center space-x-1.5 shadow-xs transition-all active:scale-98"
              >
                <span>Ingest &amp; Extract</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
