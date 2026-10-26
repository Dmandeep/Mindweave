'use client';

import React from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { Header } from '@/components/layout/Header';
import { NavSidebar } from '@/components/layout/NavSidebar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { KnowledgeCanvas } from '@/components/canvas/KnowledgeCanvas';
import { DiscoveryLabWorkbench } from '@/components/lab/DiscoveryLabWorkbench';
import { DiscoveriesWorkspace } from '@/components/discoveries/DiscoveriesWorkspace';
import { CaptureModal } from '@/components/capture/CaptureModal';

export default function Home() {
  const { viewMode } = useKnowledgeStore();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-base">
      {/* Top Application Header */}
      <Header />

      {/* Main Studio Workspace */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Left Column: Nav Sidebar */}
        <NavSidebar />

        {/* Center Canvas / Workspaces */}
        <main className="flex-1 relative overflow-hidden flex flex-col h-full min-h-0 w-full bg-surface-base">
          {viewMode === 'universe' && <KnowledgeCanvas />}
          {viewMode === 'discoveries' && <DiscoveriesWorkspace />}
          {viewMode === 'lab' && <DiscoveryLabWorkbench />}
        </main>

        {/* Right Column: Contextual Inspector Panel */}
        <InspectorPanel />
      </div>

      {/* Fast Capture Modal Dialog */}
      <CaptureModal />
    </div>
  );
}
