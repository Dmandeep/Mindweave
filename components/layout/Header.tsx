'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { 
  Sparkles, 
  Plus, 
  Search, 
  FlaskConical, 
  Compass, 
  X,
  Loader2,
  ChevronDown,
  Download,
  FolderPlus,
  Play
} from 'lucide-react';

interface HeaderProps {
  onReplayIntro?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onReplayIntro }) => {
  const { 
    viewMode, 
    setViewMode, 
    setCaptureModalOpen, 
    searchQuery, 
    setSearchQuery,
    discoveryCandidates,
    investigations,
    isScanningDiscoveries,
    triggerDiscoveryScan,
    workspaces,
    currentWorkspaceId,
    switchWorkspace,
    createWorkspace,
    exportKnowledgeSpace
  } = useKnowledgeStore();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  const currentWorkspace = workspaces.find((w) => w.id === currentWorkspaceId) || workspaces[0];
  const unreadDiscoveries = discoveryCandidates.filter((d) => d.status === 'unread').length;
  const activeLabs = investigations.filter((i) => i.stage !== 'completed').length;

  const handleCreateWorkspace = () => {
    const name = window.prompt('Enter new workspace name:');
    if (!name || !name.trim()) return;
    const desc = window.prompt('Enter workspace research focus / description:') || '';
    createWorkspace(name.trim(), desc.trim(), ['General Research']);
    setIsWorkspaceMenuOpen(false);
  };

  const handleExport = (format: 'json' | 'markdown') => {
    const content = exportKnowledgeSpace(format);
    const blob = new Blob([content], { type: format === 'json' ? 'application/json' : 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindweave-${(currentWorkspace?.name || 'universe').toLowerCase().replace(/\s+/g, '-')}.${format === 'json' ? 'json' : 'md'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setIsExportMenuOpen(false);
  };

  return (
    <header className="h-12 border-b border-ink/10 bg-[#FCFAF5]/90 backdrop-blur-md px-4 flex items-center justify-between z-30 select-none relative shadow-xs">
      {/* Brand & Workspace Switcher */}
      <div className="flex items-center space-x-3">
        {/* Real MindWeave Logo Integration */}
        <button
          onClick={onReplayIntro}
          className="flex items-center space-x-2.5 focus:outline-none group text-left"
          title="MindWeave — Click to replay intro"
          aria-label="MindWeave home and introduction"
        >
          <div className="w-7 h-7 rounded-lg overflow-hidden border border-ink/12 flex items-center justify-center bg-[#FAF7F0] shadow-xs group-hover:border-royal/50 group-hover:shadow-card transition-all">
            <img 
              src="/logo.png" 
              alt="MindWeave Logo" 
              className="w-full h-full object-cover scale-110 transition-transform group-hover:scale-125"
            />
          </div>
          <div className="flex items-baseline space-x-1.5">
            <span className="font-bold text-xs tracking-tight text-ink font-sans">
              Mind<span className="text-royal">Weave</span>
            </span>
            <span className="text-[10px] font-mono text-ink-muted hidden md:inline">
              Weaving Knowledge Into Discovery
            </span>
          </div>
        </button>

        {/* Workspace Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#FAF7F0] border border-ink/10 text-xs text-ink-secondary hover:text-ink hover:border-royal/40 transition-colors shadow-2xs"
            title="Switch Research Workspace"
          >
            <span className="max-w-[130px] truncate font-medium text-[11px]">
              {currentWorkspace?.name || 'Primary Universe'}
            </span>
            <ChevronDown className="w-3 h-3 text-ink-muted" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute left-0 mt-1.5 w-64 rounded-lg bg-[#FCFAF5] border border-ink/12 shadow-card py-1 z-50 text-xs animate-scale-in">
              <div className="px-3 py-1.5 border-b border-ink/8 text-[10px] font-mono uppercase text-ink-muted font-semibold tracking-wider">
                Workspaces ({workspaces.length})
              </div>
              <div className="max-h-48 overflow-y-auto py-1">
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      switchWorkspace(ws.id);
                      setIsWorkspaceMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex flex-col transition-colors ${
                      ws.id === currentWorkspaceId
                        ? 'bg-royal-subtle text-royal font-medium'
                        : 'text-ink-secondary hover:bg-[#FAF7F0] hover:text-ink'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {ws.description && (
                      <span className="text-[10px] text-ink-muted truncate">
                        {ws.description}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-ink/8 pt-1 mt-1">
                <button
                  onClick={handleCreateWorkspace}
                  className="w-full text-left px-3 py-1.5 text-xs text-royal hover:bg-royal-subtle flex items-center space-x-1.5 font-medium transition-colors"
                >
                  <FolderPlus className="w-3.5 h-3.5" />
                  <span>Create Workspace...</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search */}
      <div className="flex-1 max-w-sm mx-4 hidden md:block">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            placeholder="Search concepts, domains, evidence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAF7F0] border border-ink/10 text-xs rounded-lg pl-8 pr-7 py-1 text-ink placeholder:text-ink-muted focus:outline-none focus:border-royal focus:ring-1 focus:ring-royal/30 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              aria-label="Clear search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* View Switcher & Action Controls */}
      <div className="flex items-center space-x-2">
        <nav className="flex items-center bg-[#F3EDE0] p-0.5 rounded-lg border border-ink/8" aria-label="Views">
          <button
            onClick={() => setViewMode('universe')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'universe'
                ? 'bg-[#FCFAF5] text-royal shadow-xs border border-ink/8 font-semibold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-royal" />
            <span>Universe</span>
          </button>

          <button
            onClick={() => setViewMode('discoveries')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'discoveries'
                ? 'bg-[#FCFAF5] text-tangerine shadow-xs border border-ink/8 font-semibold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-tangerine" />
            <span>Discoveries</span>
            {unreadDiscoveries > 0 && (
              <span className="w-4 h-4 rounded-full bg-tangerine text-[9px] font-mono flex items-center justify-center text-white font-bold ml-0.5 shadow-xs">
                {unreadDiscoveries}
              </span>
            )}
          </button>

          <button
            onClick={() => setViewMode('lab')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
              viewMode === 'lab'
                ? 'bg-[#FCFAF5] text-royal shadow-xs border border-ink/8 font-semibold'
                : 'text-ink-secondary hover:text-ink'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5 text-royal" />
            <span>Lab</span>
            {activeLabs > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#FAF7F0] border border-ink/10 text-[9px] font-mono flex items-center justify-center text-ink-muted ml-0.5">
                {activeLabs}
              </span>
            )}
          </button>
        </nav>

        {/* Discovery Scan Trigger */}
        <button
          onClick={() => triggerDiscoveryScan()}
          disabled={isScanningDiscoveries}
          className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
            isScanningDiscoveries
              ? 'bg-tangerine-subtle border border-tangerine/40 text-tangerine animate-pulse'
              : 'text-ink-secondary hover:text-ink hover:bg-[#F3EDE0] border border-transparent hover:border-ink/10 active:scale-98'
          } disabled:opacity-50`}
          title="Run discovery analysis scan across concepts"
        >
          {isScanningDiscoveries ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin text-tangerine" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-tangerine" />
          )}
          <span className="hidden lg:inline">{isScanningDiscoveries ? 'Scanning Space...' : 'Scan'}</span>
        </button>

        {/* Replay Brand Intro Button */}
        {onReplayIntro && (
          <button
            onClick={onReplayIntro}
            className="hidden xl:flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium text-royal bg-royal-subtle hover:bg-royal/15 border border-royal/20 transition-all shadow-2xs active:scale-98"
            title="Replay Brand Introduction Animation"
            aria-label="Replay Brand Intro"
          >
            <Play className="w-3 h-3 text-royal fill-royal/20" />
            <span>Intro</span>
          </button>
        )}

        {/* Space Export Menu */}
        <div className="relative">
          <button
            onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
            className="flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium text-ink-secondary hover:text-ink hover:bg-[#F3EDE0] border border-transparent hover:border-ink/10 transition-colors"
            title="Export knowledge universe"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Export</span>
          </button>

          {isExportMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-40 rounded-lg bg-[#FCFAF5] border border-ink/12 shadow-card py-1 z-50 text-xs animate-scale-in">
              <button
                onClick={() => handleExport('json')}
                className="w-full text-left px-3 py-1.5 text-ink-secondary hover:bg-[#FAF7F0] hover:text-ink flex items-center justify-between"
              >
                <span>Export as JSON</span>
                <span className="font-mono text-[10px] text-ink-muted">.json</span>
              </button>
              <button
                onClick={() => handleExport('markdown')}
                className="w-full text-left px-3 py-1.5 text-ink-secondary hover:bg-[#FAF7F0] hover:text-ink flex items-center justify-between"
              >
                <span>Export as Markdown</span>
                <span className="font-mono text-[10px] text-ink-muted">.md</span>
              </button>
            </div>
          )}
        </div>

        {/* Fast Capture Action */}
        <button
          onClick={() => setCaptureModalOpen(true)}
          className="bg-royal hover:bg-royal-hover text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center space-x-1 shadow-card transition-all active:scale-98"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Capture</span>
        </button>
      </div>
    </header>
  );
};
