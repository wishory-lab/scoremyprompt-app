'use client';

import Link from 'next/link';

function getErrorCategory(error: Error) {
  const msg = error?.message?.toLowerCase() || '';
  if (msg.includes('network') || msg.includes('fetch'))
    return { label: 'Network Error', hint: 'Check your internet connection and try again.' };
  if (msg.includes('auth') || msg.includes('unauthorized') || msg.includes('401'))
    return { label: 'Authentication Error', hint: 'You may need to sign in again.' };
  if (msg.includes('not found') || msg.includes('404'))
    return { label: 'Not Found', hint: 'The requested resource could not be found.' };
  return { label: 'Something went wrong', hint: 'An unexpected error occurred.' };
}

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const category = getErrorCategory(error);

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center p-4">
      <div className="card max-w-md text-center">
        <div className="text-4xl mb-4">&#x26A0;&#xFE0F;</div>
        <h2 className="text-xl font-bold text-white mb-1">{category.label}</h2>
        <p className="text-gray-400 mb-6 text-sm">
          {process.env.NODE_ENV === 'production' ? category.hint : error?.message || category.hint}
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={reset} className="btn-primary">
            Try Again
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm bg-gray-700 hover:bg-gray-600 text-white transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
