'use client';

import { useRef, useState } from 'react';
import { gradeColors, colors } from '../constants/tokens';
import type { Grade } from '../types';

interface ShareCardProps {
  score: number;
  grade: Grade;
  gradeLabel: string;
  jobRole: string;
  percentile: number;
  dimensions: Record<string, { score: number }>;
}

const DIM_LABELS: Record<string, string> = {
  precision: 'P',
  role: 'R',
  outputFormat: 'O',
  missionContext: 'M',
  promptStructure: 'S',
  tailoring: 'T',
};

/**
 * ShareCard — renders a visual share card as a canvas and lets the user download it.
 * Used on the result page for social sharing as an image.
 */
export default function ShareCard({ score, grade, gradeLabel, jobRole, percentile, dimensions }: ShareCardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [generating, setGenerating] = useState(false);

  const generateCard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setGenerating(true);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 630;
    canvas.width = W;
    canvas.height = H;

    // Background gradient
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, '#0a0f1a');
    grad.addColorStop(1, '#1e293b');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    // Border accent
    ctx.strokeStyle = gradeColors[grade] || colors.primary;
    ctx.lineWidth = 4;
    ctx.strokeRect(2, 2, W - 4, H - 4);

    // Score circle
    const cx = 200;
    const cy = 260;
    const r = 100;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fillStyle = (gradeColors[grade] || colors.primary) + '22';
    ctx.fill();
    ctx.strokeStyle = gradeColors[grade] || colors.primary;
    ctx.lineWidth = 6;
    ctx.stroke();

    // Score number
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px Inter, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(score), cx, cy - 10);

    // Grade letter
    ctx.fillStyle = gradeColors[grade] || colors.primary;
    ctx.font = 'bold 24px Inter, -apple-system, sans-serif';
    ctx.fillText(`${grade}-Tier`, cx, cy + 40);

    // Title and subtitle
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Inter, -apple-system, sans-serif';
    ctx.fillText('My PROMPT Score', 360, 120);

    ctx.fillStyle = '#9ca3af';
    ctx.font = '22px Inter, -apple-system, sans-serif';
    ctx.fillText(`${gradeLabel} — Top ${100 - percentile}% among ${jobRole} pros`, 360, 170);

    // Dimension bars
    const barStartX = 360;
    const barY = 220;
    const barW = 700;
    const barH = 32;
    const gap = 50;

    const dimKeys = Object.keys(DIM_LABELS);
    dimKeys.forEach((key, i) => {
      const dim = dimensions[key];
      if (!dim) return;
      const y = barY + i * gap;
      const maxScore = key === 'precision' || key === 'role' ? 20 : 15;
      const pct = Math.min(dim.score / maxScore, 1);

      // Label
      ctx.fillStyle = '#9ca3af';
      ctx.font = 'bold 16px Inter, -apple-system, sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(DIM_LABELS[key], barStartX, y + barH / 2 + 5);

      // Bar background
      ctx.fillStyle = '#1e293b';
      roundRect(ctx, barStartX + 30, y, barW - 30, barH, 6);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = gradeColors[grade] || colors.primary;
      roundRect(ctx, barStartX + 30, y, (barW - 30) * pct, barH, 6);
      ctx.fill();

      // Score text
      ctx.fillStyle = '#ffffff';
      ctx.font = '14px Inter, -apple-system, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(`${dim.score}/${maxScore}`, barStartX + barW + 50, y + barH / 2 + 5);
    });

    // Branding
    ctx.textAlign = 'right';
    ctx.fillStyle = '#64748b';
    ctx.font = '18px Inter, -apple-system, sans-serif';
    ctx.fillText('scoremyprompt.com', W - 40, H - 30);

    // Trigger download
    const link = document.createElement('a');
    link.download = `prompt-score-${score}-${grade}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    setGenerating(false);
  };

  return (
    <>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <button
        onClick={generateCard}
        disabled={generating}
        className="btn-secondary flex items-center gap-2 text-sm"
        aria-label="Download share card image"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        {generating ? 'Generating...' : 'Download Share Card'}
      </button>
    </>
  );
}

// Canvas rounded rect helper
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (w < 0) w = 0;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
