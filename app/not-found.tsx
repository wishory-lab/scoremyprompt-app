import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '404 - 페이지를 찾을 수 없습니다 | ScoreMyPrompt',
  description: '요청하신 페이지를 찾을 수 없습니다.',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center p-4">
      <div className="max-w-lg text-center">
        {/* SVG Illustration */}
        <div className="mb-8">
          <svg className="w-32 h-32 mx-auto" viewBox="0 0 128 128" fill="none" aria-hidden="true">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="2" className="text-gray-700" />
            <path d="M48 80c0-8.837 7.163-16 16-16s16 7.163 16 16" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="text-gray-500" transform="rotate(180 64 80)" />
            <circle cx="48" cy="52" r="4" fill="currentColor" className="text-primary" />
            <circle cx="80" cy="52" r="4" fill="currentColor" className="text-primary" />
            <path d="M40 40l-8-8M88 40l8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-600" />
          </svg>
        </div>

        <div className="text-7xl font-bold text-gradient mb-4" aria-hidden="true">404</div>
        <h1 className="text-2xl font-bold text-white mb-3">페이지를 찾을 수 없습니다</h1>
        <p className="text-gray-400 mb-8">
          찾으시는 페이지가 이동되었거나 더 이상 존재하지 않습니다.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/" className="btn-primary inline-flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            홈으로
          </Link>
          <Link href="/guides" className="btn-secondary inline-flex items-center justify-center gap-2">
            가이드 보기
          </Link>
        </div>

        {/* Suggested pages */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-gray-500 mb-4">이런 페이지를 찾고 계신가요:</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/templates" className="text-sm text-primary hover:text-accent transition-colors">템플릿</Link>
            <Link href="/pricing" className="text-sm text-primary hover:text-accent transition-colors">요금제</Link>
            <Link href="/dashboard" className="text-sm text-primary hover:text-accent transition-colors">대시보드</Link>
            <Link href="/guides" className="text-sm text-primary hover:text-accent transition-colors">가이드</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
