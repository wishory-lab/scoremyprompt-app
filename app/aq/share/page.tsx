import type { Metadata } from 'next';
import Link from 'next/link';
import { AQ_GRADE_CONFIG, AQ_MAX_SCORE } from '../constants';
import type { AQGrade } from '../types';

interface PageProps {
  searchParams: { score?: string; grade?: string };
}

function getOrigin(): string {
  const aq = process.env.NEXT_PUBLIC_AQ_URL;
  if (aq) return aq.replace(/\/$/, '');
  const base = process.env.NEXT_PUBLIC_BASE_URL;
  if (base) return base.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return 'https://aq.ai.kr';
}

function parse(searchParams: PageProps['searchParams']) {
  const score = Math.max(0, Math.min(AQ_MAX_SCORE, parseInt(searchParams.score || '0', 10) || 0));
  const rawGrade = (searchParams.grade || 'D').toUpperCase();
  const grade: AQGrade = (['S', 'A', 'B', 'C', 'D'] as const).includes(rawGrade as AQGrade)
    ? (rawGrade as AQGrade)
    : 'D';
  return { score, grade };
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { score, grade } = parse(searchParams);
  const cfg = AQ_GRADE_CONFIG[grade];
  const origin = getOrigin();
  const ogUrl = `${origin}/api/aq/og?score=${score}&grade=${grade}`;
  const url = `${origin}/aq/share?score=${score}&grade=${grade}`;
  const title = `AQ ${score}/${AQ_MAX_SCORE} · ${grade}등급 ${cfg.title}`;
  const description = '당신의 AQ는 몇 점입니까? IQ는 고정형, AQ는 성장형. 5분 만에 측정.';

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'website',
      images: [{ url: ogUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogUrl] },
  };
}

export default function AQSharePage({ searchParams }: PageProps) {
  const { score, grade } = parse(searchParams);
  const cfg = AQ_GRADE_CONFIG[grade];

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.2em] uppercase text-purple-400 mb-3">AQ — Shared Result</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
            누군가 당신의<br />AQ를 궁금해합니다
          </h1>
          <p className="text-gray-400">친구의 AQ 결과입니다. 당신은 몇 점일까요?</p>
        </div>

        {/* Result card */}
        <div
          className="card text-center py-10 mb-8"
          style={{ borderColor: `${cfg.color}40` }}
        >
          <div
            className="inline-flex items-center justify-center w-32 h-32 rounded-full border-4 mb-4"
            style={{ borderColor: `${cfg.color}40` }}
          >
            <div>
              <div className="text-4xl font-bold" style={{ color: cfg.color }}>
                {score}
              </div>
              <div className="text-xs text-gray-500 mt-1">/ {AQ_MAX_SCORE}</div>
            </div>
          </div>
          <div
            className="inline-block px-4 py-1 rounded-full text-sm font-bold mb-3"
            style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}
          >
            {cfg.emoji} {grade}등급 — {cfg.title}
          </div>
          <p className="text-gray-400 text-sm max-w-md mx-auto leading-relaxed px-4">
            {cfg.description}
          </p>
        </div>

        <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/5 px-5 py-4 mb-8">
          <p className="text-sm text-emerald-200/90 leading-relaxed">
            <strong className="text-white">AQ는 IQ와 다릅니다 — 모든 등급은 출발점입니다.</strong> 5분이면 측정합니다.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/aq"
            className="flex-1 text-center bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold py-4 rounded-xl"
          >
            나도 AQ 측정하기 →
          </Link>
          <Link
            href="/aq"
            className="flex-1 text-center btn-secondary py-4 font-semibold"
          >
            AQ가 뭔가요?
          </Link>
        </div>

        <p className="text-center text-gray-600 text-xs font-mono mt-12 tracking-wide">
          POWERED BY{' '}
          <Link href="/" className="text-gray-400 hover:text-purple-400">
            SCOREMYPROMPT
          </Link>{' '}
          · PROMPT 6-DIMENSION ENGINE
        </p>
      </section>
    </main>
  );
}
