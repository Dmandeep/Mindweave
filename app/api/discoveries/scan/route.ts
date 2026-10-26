import { NextRequest, NextResponse } from 'next/server';
import { AutonomousDiscoveryEngine } from '@/lib/discovery/discoveryEngine';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const textData = await req.text();
      if (textData && textData.trim()) {
        try {
          body = JSON.parse(textData);
        } catch {
          body = {};
        }
      }
    } catch {
      body = {};
    }

    const {
      concepts = [],
      relationships = [],
      existingCandidates = [],
      userId = 'user-default',
    } = body;

    if (!Array.isArray(concepts) || concepts.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'At least 2 concepts are required to run autonomous discovery analysis.',
        },
        { status: 400 }
      );
    }

    const report = await AutonomousDiscoveryEngine.runDiscoveryScanWithReport(
      concepts,
      relationships,
      existingCandidates,
      userId
    );

    return NextResponse.json(
      {
        success: true,
        report,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Discovery scan failed.', details: err.message },
      { status: 500 }
    );
  }
}
