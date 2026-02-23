import ShareClient from './ShareClient';
import type { Metadata } from 'next';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export default async function SharePage({ params }: PageProps) {
  const { id } = await params;
  return <ShareClient shareId={id} />;
}

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;

  const score = sp.score || '0';
  const grade = sp.grade || 'A';
  const gradeLabel = sp.gradeLabel || 'Skilled Prompter';
  const jobRole = sp.jobRole || 'Marketing';
  const percentile = sp.percentile || '50';
  const p = sp.p || '0';
  const r = sp.r || '0';
  const o = sp.o || '0';
  const m = sp.m || '0';
  const s = sp.s || '0';
  const t = sp.t || '0';

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://scoremyprompt.com';
  const ogImageUrl = new URL(`${baseUrl}/api/og`);

  ogImageUrl.searchParams.append('score', score);
  ogImageUrl.searchParams.append('grade', grade);
  ogImageUrl.searchParams.append('gradeLabel', gradeLabel);
  ogImageUrl.searchParams.append('jobRole', jobRole);
  ogImageUrl.searchParams.append('percentile', percentile);
  ogImageUrl.searchParams.append('p', p);
  ogImageUrl.searchParams.append('r', r);
  ogImageUrl.searchParams.append('o', o);
  ogImageUrl.searchParams.append('m', m);
  ogImageUrl.searchParams.append('s', s);
  ogImageUrl.searchParams.append('t', t);

  const shareUrl = `${baseUrl}/share/${id}`;
  const shareTitle = `I got a ${score} PROMPT Score on ScoreMyPrompt!`;
  const shareDescription = `I'm a ${gradeLabel} prompter, ranking in the top ${percentile}% of ${jobRole} professionals. See how you compare on ScoreMyPrompt.`;

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
      creator: '@PromptTribe',
    },
    alternates: {
      canonical: shareUrl,
    },
  };
}
