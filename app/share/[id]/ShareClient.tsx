'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ShareClientProps {
  shareId?: string;
}

export default function ShareClient({ shareId }: ShareClientProps) {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push(shareId ? `/?share=${shareId}` : '/');
    }, 2000);
    return () => clearTimeout(timer);
  }, [router, shareId]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">P</span>
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Preparing your score card...</h1>
        <p className="text-gray-400">You&apos;ll be redirected shortly.</p>
      </div>
    </main>
  );
}
