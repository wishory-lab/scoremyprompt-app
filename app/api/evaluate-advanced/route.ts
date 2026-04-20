import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { runAdvancedEvaluation } from '@/app/lib/prompt-evaluator';

const RequestSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters').max(10000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prompt } = RequestSchema.parse(body);

    const evaluation = runAdvancedEvaluation(prompt);

    return NextResponse.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
