'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { AQ_GRADE_CONFIG, AQ_DOMAIN_META, AQ_MAX_SCORE, AQ_CERTIFICATE_MIN_SCORE } from '../constants';
import type { AQResult, AQGrade, AQDomain } from '../types';
import { trackAqCertificateGenerated, trackAqShareClicked } from '../../lib/analytics';

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
        trackAqCertificateGenerated(parsed.totalScore, parsed.grade);
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
    const H = 850;
    canvas.width = W;
    canvas.height = H;

    const gradeConfig = AQ_GRADE_CONFIG[result.grade];

    // ── Color palette: 클래식 인증서 (아이보리 + 골드 + 잉크) ──
    const INK = '#1B2438';        // 짙은 네이비-잉크
    const INK_SOFT = '#475569';   // 본문 회색
    const GOLD = '#B8945A';       // 앤티크 골드
    const GOLD_DEEP = '#8B6F3D';  // 어두운 골드
    const PAPER_TOP = '#FBF7EE';  // 아이보리
    const PAPER_BOT = '#F2E9D6';  // 크림
    const SEPIA = '#7B4B26';

    const SERIF = 'Georgia, "Playfair Display", "Times New Roman", "Noto Serif KR", serif';
    const SANS = '"Inter", system-ui, sans-serif';

    // ── 배경: 종이 그라디언트 + 미세 텍스처 ──
    const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
    bgGrad.addColorStop(0, PAPER_TOP);
    bgGrad.addColorStop(1, PAPER_BOT);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, W, H);

    // 종이 텍스처 (미세 노이즈)
    ctx.save();
    ctx.globalAlpha = 0.04;
    for (let i = 0; i < 1500; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#000' : '#8B6F3D';
      ctx.fillRect(Math.random() * W, Math.random() * H, 1, 1);
    }
    ctx.restore();

    // ── 외곽 더블 보더 (얇은 잉크 + 두꺼운 골드) ──
    ctx.strokeStyle = INK;
    ctx.lineWidth = 1;
    ctx.strokeRect(36, 36, W - 72, H - 72);

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 3;
    ctx.strokeRect(48, 48, W - 96, H - 96);

    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 1;
    ctx.strokeRect(58, 58, W - 116, H - 116);

    // ── 4모서리 플로럴 장식 ──
    drawCornerOrnament(ctx, 58, 58, 'tl', GOLD);
    drawCornerOrnament(ctx, W - 58, 58, 'tr', GOLD);
    drawCornerOrnament(ctx, 58, H - 58, 'bl', GOLD);
    drawCornerOrnament(ctx, W - 58, H - 58, 'br', GOLD);

    // ── 상단 라틴 헤드라인 (small caps) ──
    ctx.fillStyle = GOLD_DEEP;
    ctx.font = `500 13px ${SERIF}`;
    ctx.textAlign = 'center';
    drawSpacedText(ctx, 'C E R T I F I C A T E   O F   A I   L I T E R A C Y', W / 2, 110, 2);

    // 메인 타이틀 (한글 큰 serif)
    ctx.fillStyle = INK;
    ctx.font = `400 44px ${SERIF}`;
    ctx.fillText('AI 역량 인증서', W / 2, 165);

    // 헤어라인 (얇은 골드 라인 + 중앙 다이아몬드)
    drawHairline(ctx, W / 2 - 180, 195, W / 2 + 180, 195, GOLD);

    // ── 본문 격식체 ──
    ctx.fillStyle = INK_SOFT;
    ctx.font = `italic 16px ${SERIF}`;
    ctx.fillText('This is to certify that the holder has demonstrated', W / 2, 232);
    ctx.fillText('a verified level of artificial-intelligence literacy.', W / 2, 256);

    // ── 큰 점수 (좌측) + 페탈 차트 (우측) — 2분할 레이아웃 ──
    const midY = 380;
    const leftCenterX = 360;
    const rightCenterX = 840;

    // 좌: 점수 카드
    ctx.save();
    ctx.fillStyle = GOLD_DEEP;
    ctx.font = `400 13px ${SERIF}`;
    drawSpacedText(ctx, 'O V E R A L L   S C O R E', leftCenterX, midY - 80, 2);

    ctx.fillStyle = INK;
    ctx.font = `400 130px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.fillText(`${result.totalScore}`, leftCenterX, midY + 30);

    // 점수 밑줄 (golden filigree)
    drawHairline(ctx, leftCenterX - 80, midY + 50, leftCenterX + 80, midY + 50, GOLD);

    ctx.fillStyle = GOLD_DEEP;
    ctx.font = `italic 18px ${SERIF}`;
    ctx.fillText(`out of ${AQ_MAX_SCORE}`, leftCenterX, midY + 80);

    // 등급 라틴 small caps
    ctx.fillStyle = INK;
    ctx.font = `500 15px ${SERIF}`;
    drawSpacedText(ctx, `G R A D E   ${gradeConfig.label}`, leftCenterX, midY + 120, 2);
    ctx.font = `italic 16px ${SERIF}`;
    ctx.fillStyle = SEPIA;
    ctx.fillText(`— ${gradeConfig.title} —`, leftCenterX, midY + 150);

    ctx.fillStyle = INK_SOFT;
    ctx.font = `13px ${SERIF}`;
    ctx.fillText(`상위 ${result.percentile}%`, leftCenterX, midY + 178);
    ctx.restore();

    // 중앙 수직 분리선
    drawHairline(ctx, 600, midY - 100, 600, midY + 200, GOLD);

    // 우: 4도메인 페탈 차트 (꽃잎)
    drawPetalChart(ctx, rightCenterX, midY + 30, 130, result.domains, INK, GOLD, SEPIA, SERIF);

    // ── 도메인 4개 라벨 (페탈 아래) ──
    const domains: AQDomain[] = ['prompt', 'tool', 'ethics', 'concept'];
    const labelY = midY + 200;
    const labelStartX = 660;
    const labelSpacing = 90;
    domains.forEach((domain, i) => {
      const meta = AQ_DOMAIN_META[domain];
      const d = result.domains.find((d) => d.domain === domain);
      const score = d?.rawScore ?? 0;
      const x = labelStartX + i * labelSpacing;
      ctx.fillStyle = INK_SOFT;
      ctx.font = `11px ${SERIF}`;
      ctx.textAlign = 'center';
      ctx.fillText(meta.label, x, labelY);
      ctx.fillStyle = INK;
      ctx.font = `500 14px ${SERIF}`;
      ctx.fillText(`${score}`, x, labelY + 18);
    });

    // ── 하단 좌: 발급일 + 사인 ──
    const sigBaseY = H - 180;
    ctx.fillStyle = INK_SOFT;
    ctx.font = `12px ${SERIF}`;
    ctx.textAlign = 'center';
    const dateStr = new Date(result.testedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 좌측 사인 라인
    drawHairline(ctx, 220, sigBaseY, 460, sigBaseY, INK);
    ctx.fillStyle = SEPIA;
    ctx.font = `italic 22px ${SERIF}`;
    ctx.fillText('ScoreMyPrompt', 340, sigBaseY - 8);
    ctx.fillStyle = INK_SOFT;
    ctx.font = `10px ${SERIF}`;
    drawSpacedText(ctx, 'D I R E C T O R ,   A I   L I T E R A C Y', 340, sigBaseY + 18, 1.5);

    // 우측 발급일
    drawHairline(ctx, 740, sigBaseY, 980, sigBaseY, INK);
    ctx.fillStyle = INK;
    ctx.font = `italic 18px ${SERIF}`;
    ctx.fillText(dateStr, 860, sigBaseY - 8);
    ctx.fillStyle = INK_SOFT;
    ctx.font = `10px ${SERIF}`;
    drawSpacedText(ctx, 'D A T E   O F   I S S U E', 860, sigBaseY + 18, 1.5);

    // ── 하단 중앙 원형 도장 (Seal) ──
    drawSeal(ctx, W / 2, sigBaseY + 5, 52, GOLD, GOLD_DEEP, INK, SERIF, verificationCode);

    // ── 푸터 ──
    ctx.fillStyle = INK_SOFT;
    ctx.font = `11px ${SERIF}`;
    ctx.textAlign = 'center';
    ctx.fillText('AQ.AI.KR  ·  Powered by ScoreMyPrompt 6-Dimension Engine', W / 2, H - 78);
    ctx.fillStyle = GOLD_DEEP;
    ctx.font = `italic 11px ${SERIF}`;
    ctx.fillText('IQ는 고정형, AQ는 성장형. 측정 시점 기준 인증입니다.', W / 2, H - 60);
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
    trackAqShareClicked('clipboard');
  };

  const handleShareLinkedIn = () => {
    trackAqShareClicked('linkedin');
    const text = encodeURIComponent(
      `AQ ${result?.totalScore}/${AQ_MAX_SCORE} · ${result?.grade}등급. AI 활용 역량을 측정하고 공식 인증받았습니다.\n\n#AQ #AIQuotient #AI역량 #ScoreMyPrompt`,
    );
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
          <h2 className="text-3xl font-bold text-white mb-2">인증서가 발급되었습니다</h2>
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
          <p className="text-gray-500 text-xs mt-1">인증서 진위는 이 코드로 확인할 수 있습니다.</p>
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
              const text = `AQ ${result.totalScore}/${AQ_MAX_SCORE} · ${gradeConfig.label}등급 (${gradeConfig.title})\n인증 코드: ${verificationCode}\nhttps://aq.ai.kr`;
              navigator.clipboard.writeText(text);
              trackAqShareClicked('clipboard');
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

// 자간을 둔 small-caps 스타일 텍스트 (인증서 격식체용)
function drawSpacedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  spacing: number,
) {
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  // 전체 폭 측정 후 중앙 정렬
  let totalW = 0;
  for (const ch of text) totalW += ctx.measureText(ch).width + spacing;
  totalW -= spacing;
  let x = cx - totalW / 2;
  for (const ch of text) {
    ctx.fillText(ch, x, y);
    x += ctx.measureText(ch).width + spacing;
  }
  ctx.restore();
}

// 얇은 헤어라인 — 끝점에 작은 다이아몬드 액센트
function drawHairline(
  ctx: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: string,
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  // 양 끝 + 중앙에 작은 다이아몬드
  const drawDiamond = (cx: number, cy: number, s: number) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s, cy);
    ctx.lineTo(cx, cy + s);
    ctx.lineTo(cx - s, cy);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  };
  drawDiamond(x1, y1, 2);
  drawDiamond(x2, y2, 2);
  if (x1 === x2 || y1 === y2) {
    drawDiamond((x1 + x2) / 2, (y1 + y2) / 2, 3);
  }
  ctx.restore();
}

// 4모서리 플로럴 장식 (스크롤 곡선 + 작은 점들)
function drawCornerOrnament(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  corner: 'tl' | 'tr' | 'bl' | 'br',
  color: string,
) {
  ctx.save();
  ctx.translate(cx, cy);
  // 회전: tl 0, tr 90, br 180, bl 270
  const rot = corner === 'tl' ? 0 : corner === 'tr' ? Math.PI / 2 : corner === 'br' ? Math.PI : -Math.PI / 2;
  ctx.rotate(rot);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 1.2;

  // 메인 스크롤 (S자 곡선)
  ctx.beginPath();
  ctx.moveTo(0, 14);
  ctx.bezierCurveTo(0, 30, 30, 30, 50, 14);
  ctx.bezierCurveTo(60, 8, 70, 14, 72, 22);
  ctx.stroke();

  // 보조 곡선
  ctx.beginPath();
  ctx.moveTo(14, 0);
  ctx.bezierCurveTo(30, 0, 30, 30, 14, 50);
  ctx.bezierCurveTo(8, 60, 14, 70, 22, 72);
  ctx.stroke();

  // 작은 점·꽃잎
  for (const [px, py, r] of [
    [40, 22, 2.5],
    [22, 40, 2.5],
    [56, 12, 1.5],
    [12, 56, 1.5],
    [30, 30, 2],
  ] as const) {
    ctx.beginPath();
    ctx.arc(px, py, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // 꽃잎 (작은 타원 4개)
  for (let i = 0; i < 4; i++) {
    ctx.save();
    ctx.translate(30, 30);
    ctx.rotate((i * Math.PI) / 2 + Math.PI / 4);
    ctx.beginPath();
    ctx.ellipse(0, -7, 1.5, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  ctx.restore();
}

// 4도메인 페탈 차트 (꽃잎 4개 — 점수에 따라 길이)
function drawPetalChart(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  maxR: number,
  domains: { domain: string; rawScore: number }[],
  ink: string,
  gold: string,
  sepia: string,
  serif: string,
) {
  ctx.save();
  ctx.translate(cx, cy);

  const order = ['prompt', 'tool', 'ethics', 'concept'];
  const angles = [-Math.PI / 2, 0, Math.PI / 2, Math.PI]; // 위·우·아래·좌

  // 가이드 원 3개
  ctx.strokeStyle = gold + '40';
  ctx.lineWidth = 0.8;
  for (const r of [maxR * 0.33, maxR * 0.66, maxR]) {
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.stroke();
  }

  // 십자 가이드
  ctx.strokeStyle = gold + '30';
  ctx.beginPath();
  ctx.moveTo(-maxR, 0);
  ctx.lineTo(maxR, 0);
  ctx.moveTo(0, -maxR);
  ctx.lineTo(0, maxR);
  ctx.stroke();

  // 페탈 4개
  order.forEach((domain, i) => {
    const d = domains.find((x) => x.domain === domain);
    const score = d?.rawScore ?? 0;
    const len = (score / 100) * maxR;
    const angle = angles[i];

    ctx.save();
    ctx.rotate(angle);

    // 페탈 (길쭉한 타원)
    const grad = ctx.createLinearGradient(0, 0, len, 0);
    grad.addColorStop(0, gold + '20');
    grad.addColorStop(1, sepia + '80');
    ctx.fillStyle = grad;
    ctx.strokeStyle = sepia;
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(len * 0.3, -12, len * 0.7, -12, len, 0);
    ctx.bezierCurveTo(len * 0.7, 12, len * 0.3, 12, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 페탈 끝 점
    ctx.beginPath();
    ctx.arc(len, 0, 3, 0, Math.PI * 2);
    ctx.fillStyle = ink;
    ctx.fill();

    ctx.restore();
  });

  // 중앙 작은 도트 + 라벨
  ctx.beginPath();
  ctx.arc(0, 0, 5, 0, Math.PI * 2);
  ctx.fillStyle = ink;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(0, 0, 8, 0, Math.PI * 2);
  ctx.strokeStyle = gold;
  ctx.lineWidth = 1;
  ctx.stroke();

  // 페탈 외곽에 도메인 머리글자
  ctx.fillStyle = ink;
  ctx.font = `italic 11px ${serif}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const labels = ['Prompt', 'Tool', 'Ethics', 'Concept'];
  const labelR = maxR + 18;
  angles.forEach((a, i) => {
    ctx.fillText(labels[i], Math.cos(a) * labelR, Math.sin(a) * labelR);
  });

  ctx.restore();
}

// 원형 도장 (Seal) — 둘레 라틴 + 중앙 모노그램
function drawSeal(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  gold: string,
  goldDeep: string,
  ink: string,
  serif: string,
  code: string,
) {
  ctx.save();

  // 외곽 두 원
  ctx.strokeStyle = goldDeep;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 0.8;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r - 14, 0, Math.PI * 2);
  ctx.stroke();

  // 둘레 라틴 텍스트 (위쪽 호)
  ctx.fillStyle = goldDeep;
  ctx.font = `500 8px ${serif}`;
  drawCircularText(ctx, '★ AI QUOTIENT · 2026 ★', cx, cy, r - 9, -Math.PI / 2, 0.5);

  // 중앙 모노그램 "AQ"
  ctx.fillStyle = ink;
  ctx.font = `400 22px ${serif}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('AQ', cx, cy - 4);

  // 인증코드 (작게)
  ctx.fillStyle = goldDeep;
  ctx.font = `8px "Courier New", monospace`;
  ctx.fillText(code, cx, cy + 14);

  // 작은 별 4개 (도장 외곽)
  ctx.fillStyle = gold;
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2 + Math.PI / 4;
    const sx = cx + Math.cos(a) * (r + 8);
    const sy = cy + Math.sin(a) * (r + 8);
    drawStar(ctx, sx, sy, 3, gold);
  }

  ctx.restore();
}

// 원형 텍스트
function drawCircularText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  spacing: number,
) {
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // 전체 각도 = 글자수 × (글자폭/r)
  const widths: number[] = [];
  let total = 0;
  for (const ch of text) {
    const w = ctx.measureText(ch).width + spacing;
    widths.push(w);
    total += w;
  }
  const totalAngle = total / r;
  let angle = startAngle - totalAngle / 2;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const w = widths[i];
    const charAngle = w / r;
    angle += charAngle / 2;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * r, cy + Math.sin(angle) * r);
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(ch, 0, 0);
    ctx.restore();
    angle += charAngle / 2;
  }
  ctx.restore();
}

// 작은 5각 별
function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = cx + Math.cos(a) * r;
    const y = cy + Math.sin(a) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a2) * (r * 0.45), cy + Math.sin(a2) * (r * 0.45));
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}
