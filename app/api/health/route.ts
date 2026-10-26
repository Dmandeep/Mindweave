import { NextResponse } from 'next/server';

const START_TIME = Date.now();

export async function GET() {
  const uptimeSeconds = Math.floor((Date.now() - START_TIME) / 1000);
  const memory = process.memoryUsage();

  return NextResponse.json(
    {
      status: 'healthy',
      version: '1.0.0',
      service: 'mindweave-api',
      timestamp: new Date().toISOString(),
      uptimeSeconds,
      memory: {
        rssMB: Math.round(memory.rss / (1024 * 1024) * 100) / 100,
        heapUsedMB: Math.round(memory.heapUsed / (1024 * 1024) * 100) / 100,
        heapTotalMB: Math.round(memory.heapTotal / (1024 * 1024) * 100) / 100,
      },
      capabilities: {
        autonomousDiscovery: true,
        discoveryLab: true,
        knowledgeUniverse: true,
        safetyAndPolicyEngine: true,
        multiWorkspaceIsolation: true,
      },
    },
    { status: 200 }
  );
}
