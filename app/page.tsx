'use client';

import React, { useState } from 'react';
import { useKnowledgeStore } from '@/stores/knowledgeStore';
import { Header } from '@/components/layout/Header';
import { NavSidebar } from '@/components/layout/NavSidebar';
import { InspectorPanel } from '@/components/layout/InspectorPanel';
import { KnowledgeCanvas } from '@/components/canvas/KnowledgeCanvas';
import { DiscoveryLabWorkbench } from '@/components/lab/DiscoveryLabWorkbench';
import { DiscoveriesWorkspace } from '@/components/discoveries/DiscoveriesWorkspace';
import { CaptureModal } from '@/components/capture/CaptureModal';
import { TheWeaveIntro } from '@/components/intro/TheWeaveIntro';

export default function Home() {
  const { viewMode } = useKnowledgeStore();
  const [playIntro, setPlayIntro] = useState(false);

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-surface-base">
      {/* Signature MindWeave Introduction Animation (plays once per session or on demand) */}
      <TheWeaveIntro 
        forcePlay={playIntro} 
        onComplete={() => setPlayIntro(false)} 
      />

      {/* Top Application Header */}
      <Header onReplayIntro={() => setPlayIntro(true)} />

      {/* Main Studio Workspace */}
      <div className="flex flex-1 overflow-hidden relative min-h-0">
        {/* Left Column: Nav Sidebar */}
        <NavSidebar />

        {/* Center Canvas / Workspaces with Smooth Cinematic Transition */}
        <main className="flex-1 relative overflow-hidden flex flex-col h-full min-h-0 w-full bg-surface-base">
          <div key={viewMode} className="w-full h-full flex-1 flex flex-col min-h-0 animate-workspace-enter">
            {viewMode === 'universe' && <KnowledgeCanvas />}
            {viewMode === 'discoveries' && <DiscoveriesWorkspace />}
            {viewMode === 'lab' && <DiscoveryLabWorkbench />}
          </div>
        </main>

        {/* Right Column: Contextual Inspector Panel */}
        <InspectorPanel />
      </div>

      {/* Fast Capture Modal Dialog */}
      <CaptureModal />
    </div>
  );
}
