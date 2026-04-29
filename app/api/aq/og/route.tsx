import { ImageResponse } from '@vercel/og';
import { z } from 'zod';
import { logger } from '@/app/lib/logger';

export const runtime = 'edge';

// AQ grade colors: S=gold, A=purple, B=blue, C=green, D=gray
const AQ_GRADE_COLORS: Record<string, string> = {
  S: '#F59E0B', // gold
  A: '#8B5CF6', // purple
  B: '#3B82F6', // blue
  C: '#10B981', // green
  D: '#6B7280', // gray
};

const AQ_GRADE_LABELS: Record<string, string> = {
  S: 'AI Genius',
  A: 'AI Expert',
  B: 'AI Proficient',
  C: 'AI Learner',
  D: 'AI Beginner',
};

const AQ_GRADE_TAGLINES: Record<string, string> = {
  S: 'Top of the AI curve',
  A: 'Ahead of the pack',
  B: 'Solid AI foundations',
  C: 'Growing fast',
  D: 'The journey starts here',
};

const OGParamsSchema = z.object({
  score: z.coerce
    .number()
    .int()
    .min(0)
    .max(200),
  grade: z
    .string()
    .transform((v) => v.toUpperCase())
    .refine((v) => ['S', 'A', 'B', 'C', 'D'].includes(v), {
      message: 'grade must be one of S, A, B, C, D',
    }),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const rawScore = searchParams.get('score');
    const rawGrade = searchParams.get('grade');

    if (rawScore === null || rawGrade === null) {
      return new Response(
        JSON.stringify({ error: 'Missing required params: score, grade' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsed = OGParamsSchema.safeParse({ score: rawScore, grade: rawGrade });
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Invalid params', details: parsed.error.flatten() }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { score, grade } = parsed.data;
    const gradeColor = AQ_GRADE_COLORS[grade] ?? '#8B5CF6';
    const gradeLabel = AQ_GRADE_LABELS[grade] ?? 'AI Proficient';
    const gradeTagline = AQ_GRADE_TAGLINES[grade] ?? '';

    // Score ring fill percentage (0–200 → 0–100%)
    const scorePct = Math.round((score / 200) * 100);

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(145deg, #080c18 0%, #120a2e 45%, #0d1a3a 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            color: 'white',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background decorative orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-140px',
              right: '-100px',
              width: '560px',
              height: '560px',
              background: `radial-gradient(circle, ${gradeColor}1a 0%, transparent 68%)`,
              borderRadius: '50%',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-160px',
              left: '-120px',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(99, 102, 241, 0.14) 0%, transparent 68%)',
              borderRadius: '50%',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: '400px',
              height: '400px',
              background: `radial-gradient(circle, ${gradeColor}0d 0%, transparent 60%)`,
              borderRadius: '50%',
              display: 'flex',
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Subtle grid lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
              display: 'flex',
            }}
          />

          {/* Main layout */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: '48px 60px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left column: branding + score */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '56%',
                height: '100%',
              }}
            >
              {/* AQ logo top-left */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  marginBottom: '40px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '52px',
                    height: '52px',
                    background: `linear-gradient(135deg, ${gradeColor}, #6366f1)`,
                    borderRadius: '12px',
                    fontSize: '26px',
                    fontWeight: 900,
                    color: 'white',
                    letterSpacing: '-1px',
                  }}
                >
                  AQ
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                      color: 'white',
                    }}
                  >
                    AI Quotient
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: gradeColor,
                      letterSpacing: '2px',
                      textTransform: 'uppercase',
                    }}
                  >
                    Intelligence Score
                  </span>
                </div>
              </div>

              {/* Large score number */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '16px',
                  marginBottom: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '148px',
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
                    fontSize: '30px',
                    fontWeight: 500,
                    color: '#4b5563',
                    marginBottom: '18px',
                  }}
                >
                  / 200
                </span>
              </div>

              {/* Score bar */}
              <div
                style={{
                  display: 'flex',
                  width: '340px',
                  height: '8px',
                  borderRadius: '4px',
                  background: '#1e293b',
                  overflow: 'hidden',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    width: `${scorePct}%`,
                    height: '100%',
                    borderRadius: '4px',
                    background: `linear-gradient(90deg, ${gradeColor}99, ${gradeColor})`,
                  }}
                />
              </div>

              {/* Grade badge + label */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '18px',
                  marginBottom: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '72px',
                    height: '72px',
                    background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}88)`,
                    borderRadius: '18px',
                    fontSize: '40px',
                    fontWeight: 900,
                    color: 'white',
                    boxShadow: `0 8px 32px ${gradeColor}44`,
                  }}
                >
                  {grade}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '26px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {gradeLabel}
                  </span>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 500,
                      color: gradeColor,
                    }}
                  >
                    {gradeTagline}
                  </span>
                </div>
              </div>
            </div>

            {/* Right column: visual + tagline */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '44%',
                height: '100%',
                paddingLeft: '44px',
                borderLeft: '1px solid rgba(148, 163, 184, 0.12)',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              {/* Circular score ring */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '220px',
                  height: '220px',
                  borderRadius: '50%',
                  background: `conic-gradient(${gradeColor} ${scorePct * 3.6}deg, #1e293b 0deg)`,
                  marginBottom: '32px',
                  position: 'relative',
                }}
              >
                {/* Inner circle cutout */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '170px',
                    height: '170px',
                    borderRadius: '50%',
                    background: 'linear-gradient(145deg, #080c18 0%, #120a2e 100%)',
                  }}
                >
                  <span
                    style={{
                      fontSize: '52px',
                      fontWeight: 900,
                      color: gradeColor,
                      lineHeight: 1,
                      letterSpacing: '-2px',
                    }}
                  >
                    {grade}
                  </span>
                  <span
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#94a3b8',
                      letterSpacing: '1px',
                      textTransform: 'uppercase',
                      marginTop: '4px',
                    }}
                  >
                    Grade
                  </span>
                </div>
              </div>

              {/* AQ label */}
              <span
                style={{
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '12px',
                  textAlign: 'center',
                }}
              >
                AI Quotient Score
              </span>

              {/* Score percentage text */}
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#64748b',
                  textAlign: 'center',
                }}
              >
                {scorePct}% of max potential
              </span>
            </div>
          </div>

          {/* Bottom bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '28px',
              left: '60px',
              right: '60px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#475569',
              }}
            >
              {"What's your AQ?"}
            </span>
            <span
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: '#6366f1',
                letterSpacing: '0.5px',
              }}
            >
              aq.ai.kr
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    logger.error('AQ OG image generation error', { error: String(error) });
    return new Response('Failed to generate AQ OG image', { status: 500 });
  }
}
