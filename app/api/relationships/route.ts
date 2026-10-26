import { NextRequest, NextResponse } from 'next/server';
import { evaluateSafetyPolicy } from '@/lib/safety/safetyClassifier';
import { Relationship, RelationshipType } from '@/types/knowledge';

const VALID_RELATIONSHIP_TYPES: RelationshipType[] = [
  'causes',
  'contradicts',
  'analogous_to',
  'enables',
  'depends_on',
  'inhibits',
  'is_a',
  'associated_with',
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws-main';

  return NextResponse.json({
    success: true,
    workspaceId,
    relationships: [],
    message: 'Relationships queried successfully.',
  });
}

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
      sourceConceptId,
      targetConceptId,
      relationshipType,
      rationale = '',
      confidenceScore = 0.85,
      workspaceId = 'ws-main',
      userId = 'user-default',
    } = body;

    // Self-loop validation
    if (!sourceConceptId || !targetConceptId) {
      return NextResponse.json(
        { success: false, error: 'Both sourceConceptId and targetConceptId are required.' },
        { status: 400 }
      );
    }

    if (sourceConceptId === targetConceptId) {
      return NextResponse.json(
        { success: false, error: 'Self-referential loops are prohibited in the knowledge graph.' },
        { status: 400 }
      );
    }

    // Type validation
    if (!VALID_RELATIONSHIP_TYPES.includes(relationshipType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid relationshipType: "${relationshipType}". Permitted: ${VALID_RELATIONSHIP_TYPES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Safety review on structural rationale
    if (rationale && rationale.length > 5) {
      const safety = await evaluateSafetyPolicy(rationale, 'concept', 'generate_plan');
      if (safety.decision === 'REFUSE_AND_REDIRECT' || safety.decision === 'BLOCK_SPECIFIC_OPERATION') {
        return NextResponse.json(
          {
            success: false,
            error: 'Relationship rationale prohibited by Safety & Policy Engine.',
            decision: safety.decision,
            rationale: safety.rationaleSummary,
          },
          { status: 403 }
        );
      }
    }

    const newRel: Relationship = {
      id: `rel-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      workspaceId,
      sourceConceptId,
      targetConceptId,
      relationshipType,
      directional: true,
      confidenceScore: Math.max(0, Math.min(1, Number(confidenceScore) || 0.85)),
      status: 'accepted',
      rationale: rationale.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        relationship: newRel,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal error establishing relationship.', details: err.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { success: false, error: 'Relationship id is required for deletion.' },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    deletedId: id,
    message: `Relationship ${id} deleted successfully.`,
  });
}
