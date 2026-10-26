'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { X, Sparkles, FileText, ArrowRight } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-cosmic-900 border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-cosmic-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 rounded bg-discovery/20 flex items-center justify-center text-discovery">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-text-primary">Frictionless Knowledge Capture</h3>
              <p className="text-[11px] text-text-muted">
                Capture ideas, papers, or observations. Concepts and relationships will be extracted automatically.
              </p>
            </div>
          </div>
          <button
            onClick={() => setCaptureModalOpen(false)}
            className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-cosmic-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div>
            <label className="text-xs font-medium text-text-secondary block mb-1">
              Note Title or Subject
            </label>
            <input
              type="text"
              placeholder="e.g. Asynchronous Paxos Consensus Benchmarks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-cosmic-950 border border-border text-xs rounded-md px-3 py-2 text-foreground placeholder:text-text-muted focus:outline-none focus:border-discovery/60 focus:ring-1 focus:ring-discovery/30"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-text-secondary">
                Raw Content / Research Notes
              </label>
              <div className="flex items-center space-x-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSourceType('text')}
                  className={`px-2 py-0.5 rounded ${sourceType === 'text' ? 'bg-discovery/20 text-discovery-light' : 'text-text-muted'}`}
                >
                  Plain Text
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('markdown')}
                  className={`px-2 py-0.5 rounded ${sourceType === 'markdown' ? 'bg-discovery/20 text-discovery-light' : 'text-text-muted'}`}
                >
                  Markdown
                </button>
              </div>
            </div>
            <textarea
              rows={8}
              placeholder="Paste research text, hypotheses, paper excerpts, or architectural specifications here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="w-full bg-cosmic-950 border border-border text-xs rounded-md p-3 text-foreground placeholder:text-text-muted focus:outline-none focus:border-discovery/60 focus:ring-1 focus:ring-discovery/30 leading-relaxed font-mono"
            />
            <div className="flex justify-between items-center text-[10px] text-text-muted mt-1">
              <span>Supports dual-use and technical research safely</span>
              <span>{content.length} characters</span>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setCaptureModalOpen(false)}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:text-text-primary hover:bg-cosmic-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!content.trim()}
              className="flex items-center space-x-1.5 bg-discovery hover:bg-discovery-dark disabled:opacity-40 text-white px-4 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm shadow-discovery/30"
            >
              <span>Extract & Connect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
