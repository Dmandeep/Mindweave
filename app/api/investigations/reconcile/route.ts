import { NextRequest, NextResponse } from 'next/server';
import { evaluateSafetyPolicy } from '@/lib/safety/safetyClassifier';
import { InvestigationOutcome, RelationshipStatus } from '@/types/knowledge';

const VALID_OUTCOMES: InvestigationOutcome[] = [
  'supported',
  'partially_supported',
  'refuted',
  'inconclusive',
];

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
      investigationId,
      outcome,
      conceptAId,
      conceptBId,
      proposedRelationship = 'associated_with',
      title = 'Investigation',
      explanation = '',
      observations = '',
      userId = 'user-default',
      workspaceId = 'ws-main',
    } = body;

    if (!investigationId || !outcome) {
      return NextResponse.json(
        { success: false, error: 'investigationId and outcome are required.' },
        { status: 400 }
      );
    }

    if (!VALID_OUTCOMES.includes(outcome)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid outcome "${outcome}". Permitted: ${VALID_OUTCOMES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Safety review on empirical observations and explanation
    const safety = await evaluateSafetyPolicy(
      `${title}: ${explanation} ${observations}`,
      'investigation',
      'generate_plan'
    );

    if (safety.decision === 'REFUSE_AND_REDIRECT' || safety.decision === 'BLOCK_SPECIFIC_OPERATION') {
      return NextResponse.json(
        {
          success: false,
          error: 'Epistemic reconciliation refused by Safety & Policy Engine.',
          decision: safety.decision,
          rationale: safety.rationaleSummary,
        },
        { status: 403 }
      );
    }

    let status: RelationshipStatus = 'proposed';
    let confidenceScore = 0.5;

    if (outcome === 'supported') {
      status = 'accepted';
      confidenceScore = 0.88;
    } else if (outcome === 'partially_supported') {
      status = 'accepted';
      confidenceScore = 0.65;
    } else if (outcome === 'refuted') {
      status = 'rejected';
      confidenceScore = 0.15;
    } else if (outcome === 'inconclusive') {
      status = 'disputed';
      confidenceScore = 0.4;
    }

    const reconciledRel = {
      id: `rel-${Date.now().toString(36)}`,
      userId,
      workspaceId,
      sourceConceptId: conceptAId,
      targetConceptId: conceptBId,
      relationshipType: proposedRelationship,
      directional: true,
      confidenceScore,
      status,
      rationale: `${outcome.toUpperCase()} empirically in Discovery Lab [${title}]: ${explanation}`,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        investigationId,
        outcome,
        stage: 'completed',
        reconciledRelationship: reconciledRel,
        revisionReason: `Empirical investigation concluded as ${outcome.toUpperCase()}`,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Reconciliation failed.', details: err.message },
      { status: 500 }
    );
  }
}
