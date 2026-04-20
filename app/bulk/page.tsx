'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../components/AuthProvider';
import type { Grade, JobRole } from '../types';
import Footer from '../components/Footer';

interface BulkResult {
  overallScore: number;
  grade: Grade;
  dimensions?: Record<string, { score: number; maxScore: number; feedback: string }>;
  strengths?: string[];
  improvements?: string[];
  rewriteSuggestion?: string;
  jobRole: string;
  error?: string;
}

const JOB_ROLES: JobRole[] = ['Marketing', 'Design', 'Product', 'Finance', 'Freelance', 'Engineering', 'Other'];

const GRADE_COLORS: Record<string, string> = {
  S: '#10b981',
  A: '#3b82f6',
  B: '#f59e0b',
  C: '#f97316',
  D: '#ef4444',
};

export default function BulkAnalysisPage() {
  const router = useRouter();
  const { user, tier, supabase, loading: authLoading, setShowAuth, setAuthMessage } = useAuth();
  const [prompts, setPrompts] = useState<string[]>(['']);
  const [jobRole, setJobRole] = useState<JobRole>('Marketing');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<BulkResult[] | null>(null);
  const [error, setError] = useState('');

  const isPro = tier === 'premium' || tier === 'pro';

  const addPrompt = () => {
    if (prompts.length < 5) {
      setPrompts([...prompts, '']);
    }
  };

  const removePrompt = (index: number) => {
    if (prompts.length > 1) {
      setPrompts(prompts.filter((_, i) => i !== index));
    }
  };

  const updatePrompt = (index: number, value: string) => {
    const updated = [...prompts];
    updated[index] = value;
    setPrompts(updated);
  };

  const handleAnalyze = async () => {
    if (!supabase) return;

    const validPrompts = prompts.filter((p) => p.trim().length >= 10);
    if (validPrompts.length === 0) {
      setError('Enter at least one prompt (minimum 10 characters each).');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResults(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        setAuthMessage('Sign in to use Bulk Analysis.');
        setShowAuth(true);
        return;
      }

      const response = await fetch('/api/analyze-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ prompts: validPrompts, jobRole }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Analysis failed (${response.status})`);
      }

      const data = await response.json();
      setResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Auth redirect for non-logged-in users
  if (!authLoading && !user) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
        <Nav />
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Bulk Analysis</h2>
          <p className="text-gray-400 mb-8">Sign in to analyze multiple prompts at once.</p>
          <button
            onClick={() => {
              setAuthMessage('Sign in to use Bulk Analysis.');
              setShowAuth(true);
            }}
            className="btn-primary"
          >
            Sign In
          </button>
        </section>
      </main>
    );
  }

  // Non-Pro upgrade CTA
  if (!authLoading && user && !isPro) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
        <Nav />
        <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="card bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30 py-12">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-6 text-primary" aria-hidden="true"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <h2 className="text-3xl font-bold text-white mb-3">Bulk Analysis</h2>
            <p className="text-gray-400 mb-2 text-sm">Analyze up to 5 prompts at once.</p>
            <p className="text-gray-400 mb-8 text-sm">This feature requires a Pro subscription.</p>
            <Link href="/pricing" className="btn-primary inline-block">
              Upgrade to Pro
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <Nav />

      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Bulk Analysis</h2>
            <p className="text-gray-400 text-sm mt-1">Analyze up to 5 prompts at once</p>
          </div>
          <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded font-medium">PRO</span>
        </div>

        {/* Job Role Selection */}
        <div className="card mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">Job Role</label>
          <select
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value as JobRole)}
            className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
          >
            {JOB_ROLES.map((role) => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>
        </div>

        {/* Prompt Inputs */}
        <div className="space-y-4 mb-6">
          {prompts.map((prompt, index) => (
            <div key={index} className="card">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-300">
                  Prompt {index + 1}
                </label>
                {prompts.length > 1 && (
                  <button
                    onClick={() => removePrompt(index)}
                    className="text-xs text-gray-500 hover:text-red-400 transition-colors"
                    aria-label={`Remove prompt ${index + 1}`}
                  >
                    Remove
                  </button>
                )}
              </div>
              <textarea
                value={prompt}
                onChange={(e) => updatePrompt(index, e.target.value)}
                placeholder="Enter your prompt here (minimum 10 characters)..."
                className="w-full bg-dark border border-border rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors resize-none"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">{prompt.length}/5000</p>
            </div>
          ))}
        </div>

        {/* Add Prompt / Analyze Buttons */}
        <div className="flex gap-3 mb-8">
          {prompts.length < 5 && (
            <button
              onClick={addPrompt}
              className="btn-secondary text-sm flex items-center gap-1"
            >
              <span className="text-lg leading-none">+</span> Add Prompt
            </button>
          )}
          <button
            onClick={handleAnalyze}
            disabled={loading || prompts.every((p) => p.trim().length < 10)}
            className="btn-primary font-semibold flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                Analyzing {prompts.filter((p) => p.trim().length >= 10).length} prompts...
              </>
            ) : (
              `Analyze ${prompts.filter((p) => p.trim().length >= 10).length || ''} Prompt${prompts.filter((p) => p.trim().length >= 10).length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="card mb-6 border-red-500/30 bg-red-500/5">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Results */}
        {results && (
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">Results</h3>
            {results.map((result, index) => {
              const color = GRADE_COLORS[result.grade] || '#6b7280';
              return (
                <div key={index} className="card">
                  <div className="flex items-center gap-4">
                    {/* Score Circle */}
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <svg width={64} height={64} className="transform -rotate-90">
                        <circle cx={32} cy={32} r={28} fill="none" stroke="#1e293b" strokeWidth="6" />
                        <circle
                          cx={32}
                          cy={32}
                          r={28}
                          fill="none"
                          stroke={color}
                          strokeWidth="6"
                          strokeDasharray={Math.PI * 56}
                          strokeDashoffset={Math.PI * 56 - (result.overallScore / 100) * Math.PI * 56}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-sm font-bold" style={{ color }}>{result.overallScore}</p>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-medium text-sm">Prompt {index + 1}</span>
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: color + '22', color }}
                        >
                          Grade {result.grade}
                        </span>
                      </div>
                      <p className="text-gray-400 text-xs line-clamp-2">
                        {prompts[index]?.substring(0, 100)}{(prompts[index]?.length || 0) > 100 ? '...' : ''}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Improvements */}
                  {(result.strengths || result.improvements) && (
                    <div className="mt-4 pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                      {result.strengths && result.strengths.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-green-400 mb-2">Strengths</p>
                          <ul className="space-y-1">
                            {result.strengths.slice(0, 2).map((s, i) => (
                              <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                                <span className="text-green-500 mt-0.5">{'\u2713'}</span> {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {result.improvements && result.improvements.length > 0 && (
                        <div>
                          <p className="text-xs font-bold text-blue-400 mb-2">Improvements</p>
                          <ul className="space-y-1">
                            {result.improvements.slice(0, 2).map((imp, i) => (
                              <li key={i} className="text-xs text-gray-400 flex items-start gap-1">
                                <span className="text-blue-500 mt-0.5">{'\u2192'}</span> {imp}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav className="border-b border-border backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
          <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">S</span>
          </div>
          <h1 className="text-xl font-bold text-white">ScoreMyPrompt</h1>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors hidden sm:block">
            Home
          </Link>
          <Link href="/dashboard" className="text-sm text-gray-400 hover:text-white transition-colors">
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
