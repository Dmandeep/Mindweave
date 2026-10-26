import { NextRequest, NextResponse } from 'next/server';
import { evaluateSafetyPolicy, sanitizeAndFrameUntrustedContent } from '@/lib/safety/safetyClassifier';
import { Concept } from '@/types/knowledge';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId') || 'ws-main';
  const query = (searchParams.get('q') || '').toLowerCase().trim();

  return NextResponse.json({
    success: true,
    workspaceId,
    query,
    count: 0,
    concepts: [],
    message: 'Concepts queried successfully.',
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
      canonicalName,
      description,
      domainCategory = 'General',
      aliases = [],
      tags = [],
      color = '#06B6D4',
      workspaceId = 'ws-main',
      userId = 'user-default',
    } = body;

    // Validation
    if (!canonicalName || typeof canonicalName !== 'string' || canonicalName.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'canonicalName is required and must be at least 2 characters.' },
        { status: 400 }
      );
    }

    if (!description || typeof description !== 'string' || description.trim().length < 5) {
      return NextResponse.json(
        { success: false, error: 'description is required and must be at least 5 characters.' },
        { status: 400 }
      );
    }

    // Sanitize input
    const framedName = sanitizeAndFrameUntrustedContent(canonicalName);
    const framedDesc = sanitizeAndFrameUntrustedContent(description);

    // Server-side safety assessment
    const safetyAssessment = await evaluateSafetyPolicy(
      `${canonicalName}: ${description}`,
      'concept',
      'generate_plan'
    );

    if (
      safetyAssessment.decision === 'REFUSE_AND_REDIRECT' ||
      safetyAssessment.decision === 'BLOCK_SPECIFIC_OPERATION'
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Concept creation prohibited by Safety & Policy Engine.',
          decision: safetyAssessment.decision,
          rationale: safetyAssessment.rationaleSummary,
          safeAlternative: safetyAssessment.safeAlternative,
        },
        { status: 403 }
      );
    }

    const newConcept: Concept = {
      id: `c-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
      userId,
      workspaceId,
      canonicalName: framedName.sanitizedText.trim(),
      description: framedDesc.sanitizedText.trim(),
      domainCategory: typeof domainCategory === 'string' ? domainCategory.trim() : 'General',
      aliases: Array.isArray(aliases) ? aliases.map(String) : [],
      tags: Array.isArray(tags) ? tags.map(String) : [],
      color: typeof color === 'string' ? color : '#06B6D4',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(
      {
        success: true,
        concept: newConcept,
        safetyDecision: safetyAssessment.decision,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: 'Internal server error processing concept creation.', details: err.message },
      { status: 500 }
    );
  }
}
