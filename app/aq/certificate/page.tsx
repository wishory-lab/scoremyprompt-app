'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AQ_GRADE_CONFIG, AQ_DOMAIN_META, AQ_MAX_SCORE, AQ_CERTIFICATE_MIN_SCORE } from '../constants';
import type { AQResult, AQGrade, AQDomain } from '../types';

const Footer = dynamic(() => import('../../components/Footer'), { ssr: false });

function generateVerificationCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    if (i === 4) code += '-';
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

export default function AQCertificatePage() {
  const router = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [result, setResult] = useState<AQResult | null>(null);
  const [verificationCode] = useState(generateVerificationCode);
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('aqResult');
    if (data) {
      const parsed = JSON.parse(data) as AQResult;
      if (parsed.totalScore >= AQ_CERTIFICATE_MIN_SCORE) {
        setResult(parsed);
      } else {
        router.push('/aq/result');
      }
    } else {
      router.push('/aq');
    }
  }, [router]);

  const drawCertificate = useCallback(() => {
    if (!result || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const W = 1200;
    const H = 800;
    canvas.width = W;
    canvas.height = H;

    const gradeConfig = AQ_GRADE_CONFIG[result.grade];

    // Background
    const bgGrad = ctx.createLinearGradient(0, 0, W, H);
    bgGrad.addColorStop(0, '#0F0F23');
    bgGrad.addColorStop(1, '#1A1A2E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // Border
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Inner accent border
    const accentGrad = ctx.createLinearGradient(0, 0, W, 0);
    accentGrad.addColorStop(0, '#8B5CF6');
    accentGrad.addColorStop(1, '#3B82F6');
    ctx.strokeStyle = accentGrad;
    ctx.lineWidth = 3;
    ctx.strokeRect(40, 40, W - 80, H - 80);

    // AQ Logo
    const logoGrad = ctx.createLinearGradient(560, 80, 640, 130);
    logoGrad.addColorStop(0, '#8B5CF6');
    logoGrad.addColorStop(1, '#3B82F6');
    ctx.fillStyle = logoGrad;
    roundRect(ctx, 565, 80, 70, 50, 12);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AQ', 600, 113);

    // Title
    ctx.fillStyle = '#888';
    ctx.font = '14px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('AI QUOTIENT CERTIFICATE', 600, 160);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 36px system-ui, sans-serif';
    ctx.fillText('AI 역량 인증서', 600, 200);

    // Score
    ctx.fillStyle = gradeConfig.color;
    ctx.font = 'bold 80px system-ui, sans-serif';
    ctx.fillText(`${result.totalScore}`, 600, 310);

    ctx.fillStyle = '#666';
    ctx.font = '20px system-ui, sans-serif';
    ctx.fillText(`/ ${AQ_MAX_SCORE}`, 600, 345);

    // Grade Badge
    ctx.fillStyle = gradeConfig.color + '30';
    roundRect(ctx, 510, 365, 180, 40, 20);
    ctx.fill();
    ctx.fillStyle = gradeConfig.color;
    ctx.font = 'bold 18px system-ui, sans-serif';
    ctx.fillText(`${gradeConfig.label}등급 — ${gradeConfig.title}`, 600, 392);

    // Percentile
    ctx.fillStyle = '#999';
    ctx.font = '14px system-ui, sans-serif';
    ctx.fillText(`상위 ${result.percentile}%`, 600, 430);

    // Domain scores bar
    const domains: AQDomain[] = ['prompt', 'tool', 'ethics', 'concept'];
    const barY = 470;
    const barWidth = 200;
    const barSpacing = 250;
    const startX = (W - (barSpacing * 3 + barWidth)) / 2;

    domains.forEach((domain, i) => {
      const meta = AQ_DOMAIN_META[domain];
      const d = result.domains.find(d => d.domain === domain);
      const score = d?.rawScore ?? 0;
      const x = startX + i * barSpacing;

      ctx.fillStyle = '#666';
      ctx.font = '12px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${meta.icon} ${meta.label}`, x + barWidth / 2, barY);

      // Bar bg
      ctx.fillStyle = '#222';
      roundRect(ctx, x, barY + 10, barWidth, 8, 4);
      ctx.fill();

      // Bar fill
      ctx.fillStyle = meta.color;
      roundRect(ctx, x, barY + 10, barWidth * (score / 100), 8, 4);
      ctx.fill();

      // Score text
      ctx.fillStyle = meta.color;
      ctx.font = 'bold 14px system-ui, sans-serif';
      ctx.fillText(`${score}`, x + barWidth / 2, barY + 40);
    });

    // Date & verification
    ctx.textAlign = 'center';
    ctx.fillStyle = '#555';
    ctx.font = '12px system-ui, sans-serif';
    const dateStr = new Date(result.testedAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
    ctx.fillText(`발급일: ${dateStr}`, 600, 570);
    ctx.fillText(`인증코드: ${verificationCode}`, 600, 595);

    // Bottom branding
    ctx.fillStyle = '#444';
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText('aq.ai.kr — AI Quotient by ScoreMyPrompt', 600, 700);
    ctx.fillText('이 인증서는 AQ 테스트 결과를 기반으로 발급되었습니다.', 600, 720);

  }, [result, verificationCode]);

  useEffect(() => {
    drawCertificate();
  }, [drawCertificate]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `AQ-Certificate-${result?.grade}-${result?.totalScore}.png`;
    link.href = canvasRef.current.toDataURL('image/png');
    link.click();
    setDownloaded(true);
  };

  const handleShareLinkedIn = () => {
    const text = encodeURIComponent(`나의 AQ(AI Quotient)는 ${result?.totalScore}/${AQ_MAX_SCORE} (${result?.grade}등급)! 🧠 AI 역량을 공식 인증받았습니다.\n\n#AQ #AIQuotient #AI역량`);
    const url = encodeURIComponent('https://aq.ai.kr');
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}&summary=${text}`, '_blank');
  };

  if (!result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
      </main>
    );
  }

  const gradeConfig = AQ_GRADE_CONFIG[result.grade];

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50 bg-dark/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AQ</span>
            </div>
            <span className="text-lg font-bold text-white">AQ 인증서</span>
          </div>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">🎉 AQ 인증서가 발급되었습니다!</h2>
          <p className="text-gray-400">
            {gradeConfig.label}등급 · {result.totalScore}/{AQ_MAX_SCORE} · 상위 {result.percentile}%
          </p>
        </div>

        {/* Certificate Canvas */}
        <div className="card p-2 mb-8 overflow-hidden">
          <canvas
            ref={canvasRef}
            className="w-full h-auto rounded-lg"
            style={{ maxWidth: '100%' }}
          />
        </div>

        {/* Verification Code */}
        <div className="card text-center py-4 mb-8">
          <p className="text-gray-500 text-xs mb-1">인증 코드</p>
          <p className="text-white font-mono text-lg font-bold tracking-wider">{verificationCode}</p>
          <p className="text-gray-500 text-xs mt-1">이 코드로 인증서의 진위를 확인할 수 있습니다.</p>
        </div>

        {/* Actions */}
        <div className="grid sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownload}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-3 rounded-xl transition-all"
          >
            {downloaded ? '✓ 다운로드 완료' : '📥 이미지 다운로드'}
          </button>
          <button
            onClick={handleShareLinkedIn}
            className="btn-secondary py-3 font-semibold"
          >
            🔗 LinkedIn 공유
          </button>
          <button
            onClick={() => {
              const text = `나의 AQ(AI Quotient): ${result.totalScore}/${AQ_MAX_SCORE} (${gradeConfig.label}등급)\n인증코드: ${verificationCode}\nhttps://aq.ai.kr`;
              navigator.clipboard.writeText(text);
            }}
            className="btn-secondary py-3 font-semibold"
          >
            📋 결과 복사
          </button>
        </div>

        {/* Back links */}
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => router.push('/aq/result')} className="text-gray-400 text-sm hover:text-white transition-colors">
            ← 결과 상세 보기
          </button>
          <button onClick={() => router.push('/aq')} className="text-gray-400 text-sm hover:text-white transition-colors">
            AQ 홈으로
          </button>
        </div>
      </section>

      <Footer />
    </main>
  );
}

// Canvas roundRect helper
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
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
