import { ImageResponse } from '@vercel/og';
import { z } from 'zod';
import { GRADE_COLORS } from '@/app/constants';
import type { Grade } from '@/app/types';

const GRADE_LABELS: Record<Grade, string> = {
  S: 'Exceptional',
  A: 'Skilled',
  B: 'Competent',
  C: 'Developing',
  D: 'Needs Work',
};

const BadgeParamsSchema = z.object({
  score: z.coerce.number().int().min(0).max(100).catch(0),
  grade: z.string().transform((v) => v.toUpperCase()).catch('A'),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = BadgeParamsSchema.parse({
      score: searchParams.get('score') ?? 0,
      grade: searchParams.get('grade') ?? 'A',
    });

    const score = params.score;
    const grade = params.grade;
    const gradeColor = GRADE_COLORS[grade as Grade] || '#3b82f6';
    const gradeLabel = GRADE_LABELS[grade as Grade] || 'Skilled';

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '600px',
            height: '600px',
            background: 'linear-gradient(180deg, #0a0f1a 0%, #111827 50%, #0a0f1a 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorative orb */}
          <div
            style={{
              position: 'absolute',
              top: '100px',
              left: '100px',
              width: '400px',
              height: '400px',
              background: `radial-gradient(circle, ${gradeColor}18 0%, transparent 70%)`,
              borderRadius: '50%',
              display: 'flex',
            }}
          />

          {/* Top branding */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '40px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                borderRadius: '10px',
                fontSize: '22px',
                fontWeight: 800,
                color: 'white',
              }}
            >
              S
            </div>
            <span
              style={{
                fontSize: '22px',
                fontWeight: 800,
                letterSpacing: '-0.5px',
                color: 'white',
              }}
            >
              ScoreMyPrompt
            </span>
          </div>

          {/* Large score number */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '8px',
              marginBottom: '16px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: '140px',
                fontWeight: 900,
                lineHeight: 0.85,
                color: gradeColor,
                letterSpacing: '-6px',
              }}
            >
              {score}
            </span>
            <span
              style={{
                fontSize: '28px',
                fontWeight: 500,
                color: '#64748b',
                marginBottom: '16px',
              }}
            >
              / 100
            </span>
          </div>

          {/* Grade badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '32px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '56px',
                height: '56px',
                background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}88)`,
                borderRadius: '14px',
                fontSize: '32px',
                fontWeight: 900,
                color: 'white',
                boxShadow: `0 8px 32px ${gradeColor}40`,
              }}
            >
              {grade}
            </div>
            <span
              style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#e2e8f0',
              }}
            >
              {gradeLabel}
            </span>
          </div>

          {/* "My Prompt Score" label */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px 24px',
              background: 'rgba(139, 92, 246, 0.15)',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              borderRadius: '999px',
              marginBottom: '32px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            <span
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#a78bfa',
                letterSpacing: '1px',
                textTransform: 'uppercase',
              }}
            >
              My Prompt Score
            </span>
          </div>

          {/* App URL at bottom */}
          <span
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: '#64748b',
              position: 'relative',
              zIndex: 1,
            }}
          >
            scoremyprompt.com
          </span>
        </div>
      ),
      {
        width: 600,
        height: 600,
      }
    );
  } catch (error) {
    console.error('Badge image generation error:', error);
    return new Response('Failed to generate badge image', { status: 500 });
  }
}
