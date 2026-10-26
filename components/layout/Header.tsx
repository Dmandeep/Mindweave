'use client';

import React from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  Sparkles, 
  Plus, 
  Search, 
  FlaskConical, 
  Compass, 
  SlidersHorizontal,
  Layers
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    viewMode, 
    setViewMode, 
    setCaptureModalOpen, 
    searchQuery, 
    setSearchQuery,
    discoveryCandidates,
    investigations
  } = useKnowledgeStore();

  const unreadDiscoveries = discoveryCandidates.filter((d) => d.status === 'unread').length;
  const activeLabs = investigations.filter((i) => i.stage !== 'completed').length;

  return (
    <header className="h-14 border-b border-border bg-cosmic-900/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none">
      {/* Brand & Vision */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-discovery/15 border border-discovery/30 flex items-center justify-center text-discovery shadow-sm shadow-discovery/20">
          <Layers className="w-4 h-4 text-discovery" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-sm tracking-tight text-foreground">Web of Thoughts</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cosmic-800 text-discovery-light border border-border">
              Path C
            </span>
          </div>
          <p className="text-[10px] text-text-muted hidden sm:block">
            Autonomous Discovery Engine + Discovery Lab
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-6 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search concepts, domains, or evidence claims (Cmd+K)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-cosmic-950 border border-border text-xs rounded-md pl-9 pr-3 py-1.5 text-foreground placeholder:text-text-muted focus:outline-none focus:border-discovery/50 focus:ring-1 focus:ring-discovery/30 transition-all"
          />
        </div>
      </div>

      {/* View Mode Switcher & Fast Capture */}
      <div className="flex items-center space-x-2">
        <div className="flex items-center bg-cosmic-950 p-1 rounded-md border border-border">
          <button
            onClick={() => setViewMode('universe')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'universe'
                ? 'bg-cosmic-800 text-foreground border border-border shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-causal" />
            <span>Universe</span>
          </button>

          <button
            onClick={() => setViewMode('lab')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-medium transition-all ${
              viewMode === 'lab'
                ? 'bg-cosmic-800 text-foreground border border-border shadow-sm'
                : 'text-text-muted hover:text-foreground'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-discovery" />
            <span>Discovery Lab</span>
            {activeLabs > 0 && (
              <span className="w-4 h-4 rounded-full bg-discovery text-[9px] font-mono flex items-center justify-center text-white font-bold ml-1">
                {activeLabs}
              </span>
            )}
          </button>
        </div>

        {/* Capture Trigger Button */}
        <button
          onClick={() => setCaptureModalOpen(true)}
          className="flex items-center space-x-1.5 bg-discovery hover:bg-discovery-dark text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm shadow-discovery/30 active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Capture Note</span>
        </button>
      </div>
    </header>
  );
};
