'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useTranslation } from '../../i18n';
import type { AnalysisResult, Grade, GradeConfig } from '../../types';
import { trackShare } from '../../lib/analytics';

const ShareCard = dynamic(() => import('../../components/ShareCard'), { ssr: false });

type SharePlatform = 'twitter' | 'linkedin' | 'bluesky' | 'copy';

interface ExtendedGradeConfig extends GradeConfig {
  bg: string;
}

interface ShareSectionProps {
  result: AnalysisResult;
  gradeConfig: ExtendedGradeConfig;
  shareUrl: string;
}

function getShareText(platform: SharePlatform, score: number, grade: string, gradeLabel: string, jobRole: string, percentile: number, url: string): string {
  switch (platform) {
    case 'twitter':
      return `My AI prompt just scored ${score}/100 (${grade}-Tier) on ScoreMyPrompt! \u{1F3AF}\n\nTop ${100 - percentile}% among ${jobRole} professionals.\n\n#PromptScoreChallenge #PromptEngineering\n\nWhat's your PROMPT Score? \u{1F447}\n${url}`;
    case 'linkedin':
      return `I just discovered my AI prompting skill level.\n\nUsing ScoreMyPrompt's PROMPT Framework, my prompt scored ${score}/100 \u2014 ${gradeLabel}.\n\nAs a ${jobRole} professional, this puts me in the top ${100 - percentile}%.\n\nThe 6 dimensions measured: Precision, Role, Output Format, Mission Context, Prompt Structure, and Tailoring.\n\nCurious about your score? Try it free: ${url}\n\n#PromptEngineering #AI #PromptScoreChallenge`;
    case 'bluesky':
      return `My AI prompt scored ${score}/100 (${grade}-Tier) on ScoreMyPrompt! \u{1F3AF}\n\nTop ${100 - percentile}% among ${jobRole} pros.\n\nWhat's your score?\n${url}`;
    case 'copy':
      return `I scored ${score}/100 (Grade ${grade}) on ScoreMyPrompt! Can you beat my score? ${url}`;
  }
}

export default function ShareSection({ result, gradeConfig, shareUrl }: ShareSectionProps) {
  const t = useTranslation();
  const [copied, setCopied] = useState(false);
  const [challengeCopied, setChallengeCopied] = useState(false);
  const [showEmbed, setShowEmbed] = useState(false);
  const [embedCopied, setEmbedCopied] = useState<'html' | 'md' | null>(null);

  const percentile = result.benchmarks?.percentile || 50;
  const jobRole = result.jobRole || 'professionals';
  const gradeLabel = result.scoreLevel || gradeConfig.label;

  const handleShareTwitter = () => {
    trackShare({ method: 'twitter', score: result.overallScore, grade: result.grade });
    const text = getShareText('twitter', result.overallScore, result.grade, gradeLabel, jobRole, percentile, shareUrl);
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareLinkedIn = () => {
    trackShare({ method: 'linkedin', score: result.overallScore, grade: result.grade });
    const text = getShareText('linkedin', result.overallScore, result.grade, gradeLabel, jobRole, percentile, shareUrl);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&summary=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleShareBluesky = () => {
    trackShare({ method: 'bluesky', score: result.overallScore, grade: result.grade });
    const text = getShareText('bluesky', result.overallScore, result.grade, gradeLabel, jobRole, percentile, shareUrl);
    window.open(`https://bsky.app/intent/compose?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    trackShare({ method: 'copy', score: result.overallScore, grade: result.grade });
    // Copy the actual permalink URL (not just text)
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (!navigator.share) return;
    trackShare({ method: 'native', score: result.overallScore, grade: result.grade });
    const text = getShareText('copy', result.overallScore, result.grade, gradeLabel, jobRole, percentile, shareUrl);
    navigator.share({ title: 'My PROMPT Score', text, url: shareUrl });
  };

  const handleChallenge = async () => {
    trackShare({ method: 'challenge', score: result.overallScore, grade: result.grade });
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const challengeUrl = `${origin}/challenge?score=${result.overallScore}&grade=${result.grade}`;
    await navigator.clipboard.writeText(challengeUrl);
    setChallengeCopied(true);
    setTimeout(() => setChallengeCopied(false), 2000);
  };

  return (
    <>
      {/* Desktop Share */}
      <div className="hidden sm:block card mb-12 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
        <h3 className="text-lg font-bold text-white mb-4">{t.result.shareYourScore}</h3>
        <p className="text-gray-400 mb-6 text-sm">
          {t.result.shareSubtitle}
        </p>
        <div className="flex flex-wrap gap-3 mb-4">
          <button onClick={handleShareTwitter} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Share on X">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            Share on X
          </button>
          <button onClick={handleShareLinkedIn} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Share on LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            LinkedIn
          </button>
          <button onClick={handleShareBluesky} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Share on Bluesky">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 600 530"><path d="M135.72 44.03C202.216 93.951 273.74 195.86 300 249.834c26.262-53.974 97.782-155.883 164.28-205.804C520.074-1.248 630-46.996 630 105.28c0 30.394-17.396 255.372-27.6 291.96-35.466 127.196-165.416 159.608-282.348 139.952 204.396 34.764 256.272 149.876 144.012 265.2C345.766 924.724 300 844.5 300 844.5s-45.766 80.224-164.064-42.108C23.676 687.068 75.552 571.956 279.948 537.192 163.016 556.848 33.066 524.436-2.4 397.24-12.596 360.652-30 135.674-30 105.28-30-46.996 79.926-1.248 135.72 44.03z"/></svg>
            Bluesky
          </button>
          <button onClick={handleCopyLink} className="btn-secondary flex items-center gap-2 text-sm" aria-label="Copy share link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
            {copied ? t.result.copied : 'Copy Link'}
          </button>
        </div>
        <div className="flex flex-wrap gap-3">
          {result.dimensions && (
            <ShareCard
              score={result.overallScore}
              grade={result.grade}
              gradeLabel={gradeLabel}
              jobRole={jobRole}
              percentile={percentile}
              dimensions={result.dimensions as unknown as Record<string, { score: number }>}
            />
          )}
          <a
            href={`/api/badge?score=${result.overallScore}&grade=${result.grade}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-3 rounded-lg font-semibold text-sm border border-primary/40 text-primary hover:bg-primary/10 transition-colors flex items-center gap-2"
            aria-label="Download score badge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            {t.result.downloadBadge}
          </a>
          <button
            onClick={handleChallenge}
            className="px-5 py-3 rounded-lg font-semibold text-sm border border-accent/40 text-accent hover:bg-accent/10 transition-colors flex items-center gap-2"
            aria-label="Challenge a friend"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
            {challengeCopied ? t.result.linkCopied : t.result.challengeFriend}
          </button>
        </div>
      </div>

      {/* Embed Section */}
      <div className="hidden sm:block card mb-12">
        <button
          onClick={() => setShowEmbed(!showEmbed)}
          className="w-full flex items-center justify-between text-left min-h-[44px]"
          aria-expanded={showEmbed}
          aria-label="Toggle embed code"
        >
          <div>
            <h3 className="text-lg font-bold text-white">Embed Your Score</h3>
            <p className="text-sm text-gray-400 mt-1">Add your PROMPT Score badge to your website, blog, or portfolio.</p>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showEmbed ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {showEmbed && (
          <div className="mt-6 space-y-6 animate-fade-in">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Preview</p>
              <div className="bg-dark rounded-lg p-4 border border-border flex justify-center">
                <iframe
                  src={`/api/embed?score=${result.overallScore}&grade=${result.grade}&gradeLabel=${encodeURIComponent(gradeLabel)}`}
                  width="280"
                  height="80"
                  style={{ border: 'none', borderRadius: '8px' }}
                  title="PROMPT Score Badge"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">HTML Embed</p>
                <button
                  onClick={async () => {
                    const code = `<iframe src="${shareUrl}/api/embed?score=${result.overallScore}&grade=${result.grade}&gradeLabel=${encodeURIComponent(gradeLabel)}" width="280" height="80" style="border:none;border-radius:8px" title="PROMPT Score Badge"></iframe>`;
                    await navigator.clipboard.writeText(code);
                    setEmbedCopied('html');
                    setTimeout(() => setEmbedCopied(null), 2000);
                  }}
                  className="text-xs text-primary hover:text-accent transition-colors min-h-[44px]"
                >
                  {embedCopied === 'html' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-dark border border-border rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                {`<iframe src="${shareUrl}/api/embed?score=${result.overallScore}&grade=${result.grade}&gradeLabel=${encodeURIComponent(gradeLabel)}" width="280" height="80" style="border:none;border-radius:8px" title="PROMPT Score Badge"></iframe>`}
              </pre>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-400 uppercase tracking-wider">Markdown Badge</p>
                <button
                  onClick={async () => {
                    const code = `[![PROMPT Score: ${result.overallScore} (${result.grade})](${shareUrl}/api/badge?score=${result.overallScore}&grade=${result.grade})](${shareUrl})`;
                    await navigator.clipboard.writeText(code);
                    setEmbedCopied('md');
                    setTimeout(() => setEmbedCopied(null), 2000);
                  }}
                  className="text-xs text-primary hover:text-accent transition-colors min-h-[44px]"
                >
                  {embedCopied === 'md' ? 'Copied!' : 'Copy'}
                </button>
              </div>
              <pre className="bg-dark border border-border rounded-lg p-3 text-xs text-gray-300 overflow-x-auto">
                {`[![PROMPT Score: ${result.overallScore} (${result.grade})](${shareUrl}/api/badge?score=${result.overallScore}&grade=${result.grade})](${shareUrl})`}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Share Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-sm border-t border-border p-4 animate-slide-up">
        <div className="flex gap-2">
          <button onClick={handleShareTwitter} className="min-w-[44px] min-h-[44px] rounded-lg text-sm border border-border text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center" title="Share on X" aria-label="Share on X">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
          </button>
          <button onClick={handleShareLinkedIn} className="min-w-[44px] min-h-[44px] rounded-lg text-sm border border-border text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center" title="Share on LinkedIn" aria-label="Share on LinkedIn">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </button>
          <button onClick={handleCopyLink} className="min-w-[44px] min-h-[44px] rounded-lg text-sm border border-border text-gray-300 hover:bg-white/5 transition-colors flex items-center justify-center" title={copied ? 'Copied!' : 'Copy Link'} aria-label="Copy share link">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/></svg>
          </button>
          <button onClick={handleNativeShare} className="btn-primary flex-1 font-semibold text-sm">
            Share
          </button>
          <a
            href={`/api/badge?score=${result.overallScore}&grade=${result.grade}`}
            target="_blank"
            rel="noopener noreferrer"
            className="min-w-[44px] min-h-[44px] rounded-lg font-semibold text-sm border border-primary/40 text-primary hover:bg-primary/10 transition-colors flex items-center justify-center"
            title="Download Badge"
            aria-label="Download score badge"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          </a>
          <button
            onClick={handleChallenge}
            className="min-w-[44px] min-h-[44px] rounded-lg font-semibold text-sm border border-accent/40 text-accent hover:bg-accent/10 transition-colors flex items-center justify-center"
            title="Challenge a Friend"
            aria-label="Challenge a friend"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
          </button>
        </div>
      </div>
      <div className="sm:hidden h-20" aria-hidden="true" />
    </>
  );
}
