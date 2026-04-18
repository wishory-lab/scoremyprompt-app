'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { trackLaunchVisited } from '@/app/lib/analytics';

export default function LaunchClient() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get('ref') ?? '';
    const source: 'direct' | 'producthunt' | 'social' | 'unknown' =
      ref.includes('producthunt') ? 'producthunt'
        : ref.includes('twitter') || ref.includes('linkedin') ? 'social'
        : ref ? 'unknown'
        : 'direct';
    trackLaunchVisited({ source });
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/20 border border-primary/40 px-4 py-1.5 text-sm font-medium text-primary">
          🚀 Launching on Product Hunt today
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
          Grade & Build<br />
          your <span className="text-gradient">AI setup</span>.
        </h1>
        <p className="mt-6 text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
          Three free tools: score your prompts, score your Claude Code setup, and
          build a production-ready harness in 2 minutes.
        </p>

        {/* Product Hunt badge — rendered only when NEXT_PUBLIC_PRODUCTHUNT_POST_ID is set */}
        {process.env.NEXT_PUBLIC_PRODUCTHUNT_POST_ID && (
          <div className="mt-8">
            <a
              href="https://www.producthunt.com/posts/scoremyprompt?utm_source=badge-featured"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block"
            >
              <Image
                src={`https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=${process.env.NEXT_PUBLIC_PRODUCTHUNT_POST_ID}&theme=dark`}
                alt="ScoreMyPrompt - Launching on Product Hunt"
                width={250}
                height={54}
                unoptimized
              />
            </a>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
          <Link href="/" className="rounded-xl border border-border bg-surface/60 p-6 hover:border-primary transition">
            <div className="text-3xl mb-2">📝</div>
            <div className="font-bold text-white">Score a Prompt</div>
            <div className="text-sm text-gray-400 mt-1">30 seconds · Free</div>
          </Link>
          <Link href="/harness" className="rounded-xl border border-primary/50 bg-surface/60 p-6 hover:border-primary transition">
            <div className="text-3xl mb-2">🧩</div>
            <div className="font-bold text-white">Score a Setup</div>
            <div className="text-sm text-gray-400 mt-1">Free · New</div>
          </Link>
          <Link href="/builder" className="rounded-xl border border-border bg-surface/60 p-6 hover:border-primary transition">
            <div className="text-3xl mb-2">🏗</div>
            <div className="font-bold text-white">Build a Setup</div>
            <div className="text-sm text-gray-400 mt-1">Pro · 2 min</div>
          </Link>
        </div>
      </section>
    </main>
  );
}
