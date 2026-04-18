'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/app/components/AuthProvider';
import { useTranslation } from '@/app/i18n';
import AdSlot from '@/app/components/AdSlot';
import { trackBuilderShared } from '@/app/lib/analytics';
import type { BuilderFileMap } from '@/app/types/builder';

interface LoadedBuild {
  files: BuilderFileMap;
  isProBuild: boolean;
  expiresAt: string;
  downloadUrl: string;
}

export default function BuilderResultClient({ id }: { id: string }) {
  const t = useTranslation();
  const { user, supabase, setShowAuth } = useAuth();
  const [build, setBuild] = useState<LoadedBuild | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [shareState, setShareState] = useState<'idle' | 'claimed' | 'error'>('idle');
  // Live countdown: update every second so user sees time running out.
  const [secondsLeft, setSecondsLeft] = useState<number>(0);

  useEffect(() => {
    if (!user) {
      setShowAuth(true);
      return;
    }
    if (!supabase) return;
    (async () => {
      setLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) throw new Error('Not signed in');

        // We cannot fetch the raw files via a JSON endpoint because we only
        // have /api/builder/download that streams a ZIP. For the preview we
        // read directly from Supabase using the authenticated client.
        const { data, error } = await supabase
          .from('builder_outputs')
          .select('files, is_pro_build, expires_at')
          .eq('id', id)
          .maybeSingle();
        if (error) throw new Error(error.message);
        if (!data) throw new Error('Build not found or expired');
        if (new Date(data.expires_at as string) < new Date()) {
          throw new Error('This build has expired (5-minute TTL)');
        }
        const loadedBuild: LoadedBuild = {
          files: data.files as BuilderFileMap,
          isProBuild: data.is_pro_build as boolean,
          expiresAt: data.expires_at as string,
          downloadUrl: `/api/builder/download/${id}`,
        };
        setBuild(loadedBuild);
        setSecondsLeft(Math.max(0, Math.round((new Date(loadedBuild.expiresAt).getTime() - Date.now()) / 1000)));
      } catch (err) {
        setLoadError((err as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [user, supabase, id, setShowAuth]);

  useEffect(() => {
    if (!build) return;
    const interval = setInterval(() => {
      const s = Math.max(0, Math.round((new Date(build.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsLeft(s);
      if (s === 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [build]);

  async function claimShare() {
    try {
      const url = typeof window !== 'undefined' ? window.location.href : '';
      trackBuilderShared({ id });
      const hasNativeShare =
        typeof navigator !== 'undefined' &&
        typeof (navigator as Navigator & { share?: unknown }).share === 'function';
      if (hasNativeShare) {
        await (navigator as Navigator).share({
          title: 'I built an AI harness in 2 minutes',
          url,
        });
      } else {
        await navigator.clipboard?.writeText(url);
      }
      if (!supabase) {
        setShareState('error');
        return;
      }
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setShareState('error');
        return;
      }
      const res = await fetch('/api/builder/claim-share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ buildId: id }),
      });
      if (res.ok) setShareState('claimed');
      else setShareState('error');
    } catch {
      setShareState('error');
    }
  }

  async function downloadZip() {
    if (!supabase) return;
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    if (!token) return;
    try {
      const res = await fetch(`/api/builder/download/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `harness-${id.slice(0, 8)}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-dark flex items-center justify-center text-gray-400">
        Loading your harness…
      </main>
    );
  }
  if (loadError || !build) {
    return (
      <main className="min-h-screen bg-dark flex flex-col items-center justify-center gap-4 p-6">
        <div className="text-red-300 text-center">{loadError ?? 'Build not found'}</div>
        <Link href="/builder" className="rounded-lg bg-primary px-4 py-2 text-white">
          Build another
        </Link>
      </main>
    );
  }

  const fileEntries = Object.entries(build.files);
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const ss = String(secondsLeft % 60).padStart(2, '0');
  const expiresMin = Math.ceil(secondsLeft / 60);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">{t.builder.result.title}</h1>
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 border border-amber-500/30 px-3 py-1">
            <span className="text-xs text-amber-300">⏱</span>
            <span className={`text-sm font-mono font-semibold ${secondsLeft < 60 ? 'text-red-300' : 'text-amber-300'}`}>
              {mm}:{ss}
            </span>
            <span className="text-xs text-amber-300/80">left to download</span>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            {t.builder.result.expiresNotice.replace('{min}', String(expiresMin))}
          </p>
        </header>

        {/* Download CTA stack */}
        <div className="space-y-3 mb-8">
          <button
            type="button"
            onClick={downloadZip}
            className="block w-full text-center rounded-lg bg-gradient-to-r from-primary to-accent py-3 font-semibold text-white"
          >
            {t.builder.result.downloadCta}
          </button>
          <a
            href={`vscode://file/${encodeURIComponent('./harness-' + id.slice(0, 8))}`}
            className="block text-center rounded-lg border border-border py-3 text-white hover:bg-surface"
          >
            {t.builder.result.vscodeCta}
          </a>
          <a
            href="https://youtube.com/watch?v=PLACEHOLDER_60S_GUIDE"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center rounded-lg border border-border py-3 text-gray-300 hover:bg-surface"
          >
            {t.builder.result.videoGuideCta}
          </a>
        </div>

        {/* File preview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-3">{t.builder.result.previewTitle}</h2>
          <div className="space-y-3 max-h-[400px] overflow-y-auto rounded-lg border border-border bg-surface/50 p-4">
            {fileEntries.map(([path, content]) => (
              <details key={path} className="text-sm">
                <summary className="cursor-pointer font-mono text-primary">{path}</summary>
                <pre className="mt-2 p-3 bg-dark rounded whitespace-pre-wrap text-xs text-gray-300">
                  {content}
                </pre>
              </details>
            ))}
          </div>
        </section>

        {!build.isProBuild && (
          <section className="mb-8 rounded-xl border border-primary/40 bg-primary/5 p-5">
            <h3 className="font-semibold text-white">{t.builder.result.shareBonusTitle}</h3>
            <p className="mt-1 text-sm text-gray-300">{t.builder.result.shareBonusBody}</p>
            <button
              type="button"
              onClick={claimShare}
              disabled={shareState === 'claimed'}
              className="mt-3 rounded-lg bg-gradient-to-r from-primary to-accent px-5 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {shareState === 'claimed' ? t.builder.result.shareClaimed : t.builder.result.shareCta}
            </button>
            {shareState === 'error' && (
              <div className="mt-2 text-xs text-red-300">{t.builder.result.shareError}</div>
            )}
          </section>
        )}

        <AdSlot placement="ResultBottom" isPro={build.isProBuild} />

        <div className="mt-8 flex gap-3">
          <Link href="/builder" className="flex-1 rounded-lg border border-border py-3 text-center text-white hover:bg-surface">
            {t.builder.result.buildAnotherCta}
          </Link>
          <Link href="/harness" className="flex-1 rounded-lg border border-border py-3 text-center text-white hover:bg-surface">
            {t.builder.result.scoreItCta}
          </Link>
        </div>
      </section>
      <AdSlot placement="FooterSticky" isPro={build.isProBuild} />
    </main>
  );
}
