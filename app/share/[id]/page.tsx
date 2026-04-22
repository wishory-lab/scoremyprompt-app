import ShareClient from './ShareClient';
import type { Metadata } from 'next';
import type { Grade } from '@/app/types';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

/**
 * Fetch analysis from DB by share_id.
 * Returns null if not found or on error.
 */
async function fetchAnalysis(shareId: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';
  try {
    const res = await fetch(`${baseUrl}/api/share/${shareId}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/** Build data object from either DB result or search params */
function buildData(
  sp: Record<string, string | undefined>,
  dbResult: { score: number; grade: string; jobRole: string; result: Record<string, unknown> } | null
) {
  // If we have query params with score, use them (backward compat)
  if (sp.score) {
    return {
      score: parseInt(sp.score || '0'),
      grade: (sp.grade || 'B') as Grade,
      gradeLabel: sp.gradeLabel || 'Skilled Prompter',
      jobRole: sp.jobRole || 'Marketing',
      percentile: parseInt(sp.percentile || '50'),
      dimensions: {
        p: parseInt(sp.p || '0'),
        r: parseInt(sp.r || '0'),
        o: parseInt(sp.o || '0'),
        m: parseInt(sp.m || '0'),
        s: parseInt(sp.s || '0'),
        t: parseInt(sp.t || '0'),
      },
    };
  }

  // Otherwise use DB result
  if (dbResult?.result) {
    const r = dbResult.result as Record<string, unknown>;
    const dims = r.dimensions as Record<string, { score: number }> | undefined;
    const benchmarks = r.benchmarks as Record<string, number> | undefined;

    return {
      score: dbResult.score || (r.overallScore as number) || 0,
      grade: (dbResult.grade || r.grade || 'B') as Grade,
      gradeLabel: (r.scoreLevel as string) || 'Skilled Prompter',
      jobRole: dbResult.jobRole || (r.jobRole as string) || 'Marketing',
      percentile: benchmarks?.percentile || 50,
      dimensions: {
        p: dims?.precision?.score || 0,
        r: dims?.role?.score || 0,
        o: dims?.outputFormat?.score || 0,
        m: dims?.missionContext?.score || 0,
        s: dims?.promptStructure?.score || 0,
        t: dims?.tailoring?.score || 0,
      },
    };
  }

  // Fallback
  return {
    score: 0,
    grade: 'B' as Grade,
    gradeLabel: 'Skilled Prompter',
    jobRole: 'Marketing',
    percentile: 50,
    dimensions: { p: 0, r: 0, o: 0, m: 0, s: 0, t: 0 },
  };
}

export default async function SharePage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;

  // Try DB fetch when no query params
  const dbResult = !sp.score ? await fetchAnalysis(id) : null;
  const data = buildData(sp, dbResult);

  return <ShareClient shareId={id} data={data} />;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;

  // Try DB fetch for metadata when no query params
  const dbResult = !sp.score ? await fetchAnalysis(id) : null;
  const data = buildData(sp, dbResult);

  const { score, grade, gradeLabel, jobRole, percentile, dimensions } = data;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';
  const ogImageUrl = new URL(`${baseUrl}/api/og`);

  ogImageUrl.searchParams.append('score', String(score));
  ogImageUrl.searchParams.append('grade', grade);
  ogImageUrl.searchParams.append('gradeLabel', gradeLabel);
  ogImageUrl.searchParams.append('jobRole', jobRole);
  ogImageUrl.searchParams.append('percentile', String(percentile));
  ogImageUrl.searchParams.append('p', String(dimensions.p));
  ogImageUrl.searchParams.append('r', String(dimensions.r));
  ogImageUrl.searchParams.append('o', String(dimensions.o));
  ogImageUrl.searchParams.append('m', String(dimensions.m));
  ogImageUrl.searchParams.append('s', String(dimensions.s));
  ogImageUrl.searchParams.append('t', String(dimensions.t));

  const shareUrl = `${baseUrl}/share/${id}`;
  const shareTitle = `I got a ${score} PROMPT Score on ScoreMyPrompt!`;
  const shareDescription = `I'm a ${gradeLabel} prompter, ranking in the top ${100 - percentile}% of ${jobRole} professionals. See how you compare on ScoreMyPrompt.`;

  return {
    title: shareTitle,
    description: shareDescription,
    openGraph: {
      title: shareTitle,
      description: shareDescription,
      url: shareUrl,
      type: 'website',
      siteName: 'ScoreMyPrompt',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: 'My PROMPT Score Card',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: shareTitle,
      description: shareDescription,
      images: ogImageUrl.toString(),
      creator: '@scoremyprompt',
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}
