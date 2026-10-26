import { NextRequest, NextResponse } from 'next/server';
import { evaluateSafetyPolicy } from '@/lib/safety/safetyClassifier';

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      const textData = await req.text();
      if (textData && textData.trim()) {
        try {
          body = JSON.parse(textData);
        } catch {
          body = { text: textData };
        }
      }
    } catch {
      body = {};
    }

    const { text = '', entityType = 'concept', intendedAction = 'capture' } = body || {};

    const evaluation = await evaluateSafetyPolicy(text, entityType, intendedAction);

    return NextResponse.json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal safety policy evaluation error',
      },
      { status: 500 }
    );
  }
}
