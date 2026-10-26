import { NextRequest, NextResponse } from 'next/server';
import { evaluateSafetyPolicy, isActionPermittedForLab } from '@/lib/safety/safetyClassifier';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    if (typeof req.json === 'function') {
      try {
        body = await req.json();
      } catch {}
    }
    if (!body || Object.keys(body).length === 0) {
      if (typeof req.text === 'function') {
        try {
          const textData = await req.text();
          if (textData && textData.trim()) {
            body = JSON.parse(textData);
          }
        } catch {}
      }
    }

    const { discoveryId, content, claimedSafetyDecision } = body || {};

    if (!discoveryId) {
      return NextResponse.json(
        { error: 'Missing discoveryId parameter' },
        { status: 400 }
      );
    }

    // Server-side trusted safety verification: never trust client-claimed 'ALLOW'
    // If raw content is provided, re-verify using the server policy engine
    let effectiveDecision = claimedSafetyDecision;
    if (content) {
      const evaluation = await evaluateSafetyPolicy(content, 'discovery', 'generate_plan');
      effectiveDecision = evaluation.decision;
    }

    const permission = isActionPermittedForLab(effectiveDecision);

    if (!permission.permitted) {
      return NextResponse.json(
        {
          error: 'Action prohibited by Safety Policy Engine',
          decision: permission.canonicalDecision,
          reason: permission.reason,
          bypassAttemptDetected: claimedSafetyDecision === 'ALLOW' && !permission.permitted,
        },
        { status: 403 }
      );
    }

    // Promotion permitted
    return NextResponse.json({
      success: true,
      investigationId: `inv-srv-${Date.now()}`,
      canonicalDecision: permission.canonicalDecision,
      scope: permission.reason,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Server error during promotion gate' },
      { status: 500 }
    );
  }
}
