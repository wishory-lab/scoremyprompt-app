/**
 * POST /api/export
 * Generates and exports analysis as downloadable HTML file
 * Requires authenticated user with Pro tier
 * Input: { analysisId: string }
 * Returns: HTML file with analysis report (dark theme styled)
 */

import { getSupabaseAdmin } from '@/app/lib/supabase';
import { logger } from '@/app/lib/logger';

interface DimensionData {
  score: number;
  maxScore: number;
  feedback: string;
}

interface ResultJson {
  dimensions?: {
    precision?: DimensionData;
    role?: DimensionData;
    outputFormat?: DimensionData;
    missionContext?: DimensionData;
    promptStructure?: DimensionData;
    tailoring?: DimensionData;
  };
  strengths?: string[];
  improvements?: string[];
  rewriteSuggestion?: string;
}

interface AnalysisRow {
  overall_score: number;
  grade: string;
  job_role: string;
  prompt_text: string;
  result_json: ResultJson | null;
  rewrite_suggestion: string | null;
  created_at: string;
}

const DEFAULT_DIM: DimensionData = { score: 0, maxScore: 0, feedback: 'N/A' };

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return Response.json(
        { error: 'Unauthorized: Missing or invalid auth token' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return Response.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return Response.json(
        { error: 'Unauthorized: Invalid auth token' },
        { status: 401 }
      );
    }

    // Check user tier (must be Pro)
    const { data: userProfile, error: profileError } = await supabase
      .from('user_profiles')
      .select('tier')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return Response.json(
        { error: 'User profile not found' },
        { status: 404 }
      );
    }

    if (userProfile.tier !== 'pro') {
      return Response.json(
        { error: 'Pro subscription required for exports' },
        { status: 403 }
      );
    }

    // Parse request body
    const { analysisId } = await request.json();

    if (!analysisId) {
      return Response.json(
        { error: 'analysisId is required' },
        { status: 400 }
      );
    }

    // Query analysis from Supabase
    const { data: analysis, error: analysisError } = await supabase
      .from('analyses')
      .select('overall_score, grade, job_role, prompt_text, result_json, rewrite_suggestion, created_at')
      .eq('id', analysisId)
      .eq('user_id', user.id)
      .single();

    if (analysisError || !analysis) {
      return Response.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // Generate HTML
    const html = generateAnalysisHTML(analysis as AnalysisRow);

    // Return HTML file
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="prompt-analysis-${analysisId}.html"`,
      },
    });
  } catch (error) {
    logger.error('Export error', { error: String(error) });
    return Response.json(
      { error: 'Failed to generate export. Please try again.' },
      { status: 500 }
    );
  }
}

function generateAnalysisHTML(analysis: AnalysisRow) {
  const {
    overall_score,
    grade,
    job_role,
    prompt_text,
    result_json,
    rewrite_suggestion,
    created_at,
  } = analysis;

  // Extract dimensions from result_json
  const dims = result_json?.dimensions;
  const precision = dims?.precision || DEFAULT_DIM;
  const role = dims?.role || DEFAULT_DIM;
  const outputFormat = dims?.outputFormat || DEFAULT_DIM;
  const missionContext = dims?.missionContext || DEFAULT_DIM;
  const promptStructure = dims?.promptStructure || DEFAULT_DIM;
  const tailoring = dims?.tailoring || DEFAULT_DIM;

  const strengths = result_json?.strengths || [];
  const improvements = result_json?.improvements || [];
  const rewrite = rewrite_suggestion || result_json?.rewriteSuggestion || '';

  const gradeColor = getGradeColor(grade);

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Prompt Analysis Report - ${grade} Grade</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #0f172a;
            color: #e2e8f0;
            line-height: 1.6;
        }

        .container {
            max-width: 900px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        .header {
            text-align: center;
            margin-bottom: 50px;
            padding-bottom: 30px;
            border-bottom: 1px solid rgba(226, 232, 240, 0.1);
        }

        .header h1 {
            font-size: 28px;
            margin-bottom: 10px;
            color: #f1f5f9;
        }

        .header p {
            color: #94a3b8;
            font-size: 14px;
        }

        .score-circle {
            display: inline-flex;
            width: 140px;
            height: 140px;
            border-radius: 50%;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            margin: 20px 0;
            border: 3px solid ${gradeColor};
            background: rgba(226, 232, 240, 0.03);
        }

        .score-circle-score {
            font-size: 48px;
            font-weight: bold;
            color: ${gradeColor};
            line-height: 1;
        }

        .score-circle-grade {
            font-size: 24px;
            color: ${gradeColor};
            margin-top: 5px;
            font-weight: 600;
        }

        .metadata {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 20px;
            margin: 30px 0;
            padding: 20px;
            background: rgba(226, 232, 240, 0.05);
            border-radius: 8px;
        }

        .metadata-item {
            text-align: center;
        }

        .metadata-label {
            font-size: 12px;
            color: #94a3b8;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
        }

        .metadata-value {
            font-size: 18px;
            font-weight: 600;
            color: #f1f5f9;
        }

        .section {
            margin-bottom: 40px;
        }

        .section h2 {
            font-size: 20px;
            color: #f1f5f9;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid rgba(100, 116, 255, 0.3);
        }

        .prompt-text {
            background: rgba(226, 232, 240, 0.05);
            border-left: 3px solid #6474ff;
            padding: 15px;
            border-radius: 4px;
            font-size: 14px;
            line-height: 1.7;
            margin-bottom: 20px;
            color: #cbd5e1;
        }

        .dimensions-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }

        .dimensions-table th,
        .dimensions-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid rgba(226, 232, 240, 0.1);
        }

        .dimensions-table th {
            background: rgba(226, 232, 240, 0.05);
            font-weight: 600;
            color: #cbd5e1;
            font-size: 13px;
        }

        .dimensions-table td {
            color: #94a3b8;
            font-size: 14px;
        }

        .dimension-name {
            font-weight: 600;
            color: #f1f5f9;
        }

        .dimension-score {
            font-weight: 700;
            color: #6474ff;
        }

        .dimension-feedback {
            font-size: 13px;
            color: #64748b;
            padding-top: 5px;
            font-style: italic;
        }

        .list-items {
            list-style: none;
            padding: 0;
        }

        .list-items li {
            padding: 10px 0;
            padding-left: 25px;
            position: relative;
            color: #cbd5e1;
            font-size: 14px;
        }

        .list-items li:before {
            content: "\\2713";
            position: absolute;
            left: 0;
            color: #6474ff;
            font-weight: bold;
        }

        .improvements li:before {
            content: "\\2192";
            color: #f59e0b;
        }

        .rewrite-box {
            background: rgba(100, 116, 255, 0.1);
            border: 1px solid rgba(100, 116, 255, 0.3);
            padding: 20px;
            border-radius: 8px;
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.8;
            margin-top: 10px;
        }

        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid rgba(226, 232, 240, 0.1);
            text-align: center;
            font-size: 12px;
            color: #64748b;
        }

        .footer-logo {
            font-weight: 600;
            color: #6474ff;
            margin-bottom: 10px;
        }

        @media print {
            body { background-color: white; color: #1e293b; }
            .score-circle { border-color: #334155; }
            .score-circle-score, .score-circle-grade { color: #334155; }
            .dimension-score { color: #3b82f6; }
            .metadata { background: #f1f5f9; }
            .prompt-text { background: #f8fafc; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Prompt Analysis Report</h1>
            <p>ScoreMyPrompt Evaluation</p>

            <div class="score-circle">
                <div class="score-circle-score">${overall_score}</div>
                <div class="score-circle-grade">${grade}</div>
            </div>
        </div>

        <div class="metadata">
            <div class="metadata-item">
                <div class="metadata-label">Job Role</div>
                <div class="metadata-value">${escapeHtml(job_role || 'General')}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Grade</div>
                <div class="metadata-value">${grade}</div>
            </div>
            <div class="metadata-item">
                <div class="metadata-label">Date</div>
                <div class="metadata-value">${new Date(created_at).toLocaleDateString()}</div>
            </div>
        </div>

        <div class="section">
            <h2>Your Prompt</h2>
            <div class="prompt-text">${escapeHtml(prompt_text)}</div>
        </div>

        <div class="section">
            <h2>Dimension Scores</h2>
            <table class="dimensions-table">
                <thead>
                    <tr>
                        <th>Dimension</th>
                        <th>Score</th>
                        <th>Feedback</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="dimension-name">Precision</td>
                        <td class="dimension-score">${precision.score}/${precision.maxScore}</td>
                        <td><div class="dimension-feedback">${escapeHtml(precision.feedback)}</div></td>
                    </tr>
                    <tr>
                        <td class="dimension-name">Role</td>
                        <td class="dimension-score">${role.score}/${role.maxScore}</td>
                        <td><div class="dimension-feedback">${escapeHtml(role.feedback)}</div></td>
                    </tr>
                    <tr>
                        <td class="dimension-name">Output Format</td>
                        <td class="dimension-score">${outputFormat.score}/${outputFormat.maxScore}</td>
                        <td><div class="dimension-feedback">${escapeHtml(outputFormat.feedback)}</div></td>
                    </tr>
                    <tr>
                        <td class="dimension-name">Mission Context</td>
                        <td class="dimension-score">${missionContext.score}/${missionContext.maxScore}</td>
                        <td><div class="dimension-feedback">${escapeHtml(missionContext.feedback)}</div></td>
                    </tr>
                    <tr>
                        <td class="dimension-name">Prompt Structure</td>
                        <td class="dimension-score">${promptStructure.score}/${promptStructure.maxScore}</td>
                        <td><div class="dimension-feedback">${escapeHtml(promptStructure.feedback)}</div></td>
                    </tr>
                    <tr>
                        <td class="dimension-name">Tailoring</td>
                        <td class="dimension-score">${tailoring.score}/${tailoring.maxScore}</td>
                        <td><div class="dimension-feedback">${escapeHtml(tailoring.feedback)}</div></td>
                    </tr>
                </tbody>
            </table>
        </div>

        <div class="section">
            <h2>Strengths</h2>
            <ul class="list-items">
                ${strengths.map((s: string) => `<li>${escapeHtml(s)}</li>`).join('')}
            </ul>
        </div>

        <div class="section">
            <h2>Areas for Improvement</h2>
            <ul class="list-items improvements">
                ${improvements.map((i: string) => `<li>${escapeHtml(i)}</li>`).join('')}
            </ul>
        </div>

        ${rewrite ? `<div class="section">
            <h2>Rewrite Suggestion</h2>
            <div class="rewrite-box">
                ${escapeHtml(rewrite)}
            </div>
        </div>` : ''}

        <div class="footer">
            <div class="footer-logo">ScoreMyPrompt</div>
            <p>Elevate your prompt engineering</p>
        </div>
    </div>
</body>
</html>`;
}

function getGradeColor(grade: string) {
  const colors: Record<string, string> = {
    S: '#10b981',
    A: '#3b82f6',
    B: '#f59e0b',
    C: '#ef4444',
    D: '#6b7280',
  };
  return colors[grade] || '#9ca3af';
}

function escapeHtml(text: string) {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
