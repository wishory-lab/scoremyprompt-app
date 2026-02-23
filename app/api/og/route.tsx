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

const GRADE_TAGLINES: Record<string, string> = {
  S: 'Prompt Master \u{1F3C6} Can anyone beat this?',
  A: 'Top tier! \u{1F31F} Think you can do better?',
  B: 'Solid score! \u{1F4AA} Challenge accepted?',
  C: 'Room to grow! \u{1F3AF} Beat this score!',
  D: 'Just getting started! \u{1F4DD} Show me how it\'s done!',
};

const OGParamsSchema = z.object({
  score: z.coerce.number().int().min(0).max(100).catch(0),
  grade: z.string().transform((v) => v.toUpperCase()).catch('A'),
  gradeLabel: z.string().optional(),
  jobRole: z.string().catch('Marketing'),
  percentile: z.coerce.number().int().min(0).max(100).catch(50),
  p: z.coerce.number().int().min(0).max(100).catch(0),
  r: z.coerce.number().int().min(0).max(100).catch(0),
  o: z.coerce.number().int().min(0).max(100).catch(0),
  m: z.coerce.number().int().min(0).max(100).catch(0),
  s: z.coerce.number().int().min(0).max(100).catch(0),
  t: z.coerce.number().int().min(0).max(100).catch(0),
});

function getBarColor(pct: number) {
  if (pct >= 85) return '#10b981';
  if (pct >= 70) return '#3b82f6';
  if (pct >= 50) return '#f59e0b';
  return '#ef4444';
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const params = OGParamsSchema.parse({
      score: searchParams.get('score') ?? 0,
      grade: searchParams.get('grade') ?? 'A',
      gradeLabel: searchParams.get('gradeLabel') || undefined,
      jobRole: searchParams.get('jobRole') ?? 'Marketing',
      percentile: searchParams.get('percentile') ?? 50,
      p: searchParams.get('p') ?? 0,
      r: searchParams.get('r') ?? 0,
      o: searchParams.get('o') ?? 0,
      m: searchParams.get('m') ?? 0,
      s: searchParams.get('s') ?? 0,
      t: searchParams.get('t') ?? 0,
    });

    const { score, grade, jobRole, percentile, p, r, o, m, s, t } = params;
    const gradeLabel = params.gradeLabel || GRADE_LABELS[grade as Grade] || 'Skilled Prompter';
    const gradeColor = GRADE_COLORS[grade as Grade] || '#3b82f6';

    const dimensions = [
      { letter: 'P', label: 'Precision', score: p },
      { letter: 'R', label: 'Role', score: r },
      { letter: 'O', label: 'Output', score: o },
      { letter: 'M', label: 'Mission', score: m },
      { letter: 'P', label: 'Structure', score: s },
      { letter: 'T', label: 'Tailoring', score: t },
    ];

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            width: '1200px',
            height: '630px',
            background: 'linear-gradient(145deg, #0a0f1a 0%, #1a1145 50%, #0f172a 100%)',
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
              top: '-120px',
              right: '-80px',
              width: '500px',
              height: '500px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              borderRadius: '50%',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-150px',
              left: '-100px',
              width: '450px',
              height: '450px',
              background: 'radial-gradient(circle, rgba(59, 130, 246, 0.12) 0%, transparent 70%)',
              borderRadius: '50%',
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '200px',
              right: '300px',
              width: '300px',
              height: '300px',
              background: `radial-gradient(circle, ${gradeColor}10 0%, transparent 60%)`,
              borderRadius: '50%',
              display: 'flex',
            }}
          />

          {/* Main layout: left + right columns */}
          <div
            style={{
              display: 'flex',
              width: '100%',
              height: '100%',
              padding: '48px 56px',
              position: 'relative',
              zIndex: 1,
            }}
          >
            {/* Left column: Branding + Score + Grade */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '55%',
                height: '100%',
              }}
            >
              {/* Branding */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  marginBottom: '36px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '44px',
                    height: '44px',
                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    borderRadius: '10px',
                    fontSize: '26px',
                    fontWeight: 800,
                    color: 'white',
                  }}
                >
                  S
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontSize: '24px',
                      fontWeight: 800,
                      letterSpacing: '-0.5px',
                      color: 'white',
                    }}
                  >
                    ScoreMyPrompt
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 500,
                      color: '#8b5cf6',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                    }}
                  >
                    PROMPT Score Report
                  </span>
                </div>
              </div>

              {/* Large score display */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '20px',
                  marginBottom: '12px',
                }}
              >
                <span
                  style={{
                    fontSize: '120px',
                    fontWeight: 900,
                    lineHeight: 0.85,
                    color: gradeColor,
                    letterSpacing: '-4px',
                  }}
                >
                  {score}
                </span>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 500,
                    color: '#64748b',
                    marginBottom: '14px',
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
                  gap: '16px',
                  marginBottom: '32px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '64px',
                    height: '64px',
                    background: `linear-gradient(135deg, ${gradeColor}, ${gradeColor}88)`,
                    borderRadius: '16px',
                    fontSize: '36px',
                    fontWeight: 900,
                    color: 'white',
                    boxShadow: `0 8px 32px ${gradeColor}40`,
                  }}
                >
                  {grade}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'white',
                    }}
                  >
                    {gradeLabel}
                  </span>
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: gradeColor,
                    }}
                  >
                    Top {percentile}% among {jobRole} professionals
                  </span>
                </div>
              </div>

              {/* CTA footer */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginTop: 'auto',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 500,
                    color: '#94a3b8',
                  }}
                >
                  {"What's your PROMPT Score?"}
                </span>
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    color: '#8b5cf6',
                  }}
                >
                  scoremyprompt.com
                </span>
              </div>
            </div>

            {/* Right column: Dimension bars */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '45%',
                height: '100%',
                paddingLeft: '40px',
                borderLeft: '1px solid rgba(148, 163, 184, 0.15)',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#94a3b8',
                  letterSpacing: '2px',
                  textTransform: 'uppercase',
                  marginBottom: '28px',
                }}
              >
                PROMPT Dimensions
              </span>

              {/* Dimension bars */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '20px',
                  flex: 1,
                }}
              >
                {dimensions.map((dim) => {
                  const barColor = getBarColor(dim.score);
                  return (
                    <div
                      key={dim.label}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              background: `${barColor}22`,
                              fontSize: '14px',
                              fontWeight: 800,
                              color: barColor,
                            }}
                          >
                            {dim.letter}
                          </div>
                          <span
                            style={{
                              fontSize: '15px',
                              fontWeight: 600,
                              color: '#e2e8f0',
                            }}
                          >
                            {dim.label}
                          </span>
                        </div>
                        <span
                          style={{
                            fontSize: '15px',
                            fontWeight: 700,
                            color: barColor,
                          }}
                        >
                          {dim.score}%
                        </span>
                      </div>
                      {/* Bar track */}
                      <div
                        style={{
                          display: 'flex',
                          width: '100%',
                          height: '10px',
                          borderRadius: '5px',
                          background: '#1e293b',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Filled portion */}
                        <div
                          style={{
                            width: `${dim.score}%`,
                            height: '100%',
                            borderRadius: '5px',
                            background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Grade tagline */}
              <div
                style={{
                  fontSize: 20,
                  color: gradeColor,
                  marginTop: 12,
                  display: 'flex',
                }}
              >
                {GRADE_TAGLINES[grade] || ''}
              </div>

              {/* CTA */}
              <div
                style={{
                  fontSize: 18,
                  color: '#94a3b8',
                  marginTop: 8,
                  display: 'flex',
                }}
              >
                {"What's YOUR score? → scoremyprompt.com"}
              </div>

              {/* Subtle branding bottom-right */}
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 500,
                  color: '#475569',
                  textAlign: 'right',
                  marginTop: '12px',
                }}
              >
                Powered by the PROMPT Framework
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('OG Image generation error:', error);
    return new Response('Failed to generate OG image', { status: 500 });
  }
}
