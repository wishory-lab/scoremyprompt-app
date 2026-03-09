import type { Metadata } from 'next';
import Link from 'next/link';
import Footer from '../components/Footer';

export const metadata: Metadata = {
  title: 'Privacy Policy — ScoreMyPrompt',
  description: 'How ScoreMyPrompt handles your data. We do not store your prompt text.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <Link href="/" className="text-primary hover:underline text-sm">&larr; Back to ScoreMyPrompt</Link>

        <h1 className="text-3xl font-bold mt-6 mb-2">Privacy Policy</h1>
        <p className="text-gray-400 text-sm mb-10">Last updated: February 24, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          {/* 1 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">1. What We Collect</h2>
            <p className="text-gray-300 leading-relaxed">
              ScoreMyPrompt is designed with privacy at its core. Here is exactly what we collect and what we do not.
            </p>

            <h3 className="text-lg font-medium mt-4 mb-2 text-green-400">We DO NOT Store</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li><strong>Your full prompt text</strong> &mdash; After grading, the full prompt is immediately discarded. We store only a brief preview (first ~80 characters) so you can identify past analyses in your history. The full prompt is never written to our database.</li>
              <li>Cookies for tracking (we use analytics cookies only with your consent)</li>
              <li>Browsing history or keystrokes</li>
            </ul>

            <h3 className="text-lg font-medium mt-4 mb-2 text-blue-400">We DO Store (when you create an account)</h3>
            <ul className="list-disc list-inside text-gray-300 space-y-1">
              <li><strong>Score metadata</strong> &mdash; overall score, grade (S/A/B/C/D), per-dimension scores, job role, timestamp, and a brief prompt preview (~80 characters)</li>
              <li><strong>Account info</strong> &mdash; email address, display name (for the leaderboard)</li>
              <li><strong>Usage counts</strong> &mdash; daily analysis count for free-tier limits</li>
            </ul>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">2. Guest Users (No Account)</h2>
            <p className="text-gray-300 leading-relaxed">
              If you use ScoreMyPrompt without signing in, we store nothing on our servers. Your most recent result is kept in your browser&apos;s session storage and disappears when you close the tab. We use an anonymized hash of your IP address solely to enforce the 3-grades-per-day guest limit &mdash; the actual IP is never stored.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">3. How Grading Works</h2>
            <p className="text-gray-300 leading-relaxed">
              When you submit a prompt, it is sent to Anthropic&apos;s Claude API for evaluation. The full prompt text exists in memory only for the duration of the API call (&lt;10 seconds). Once the score is returned, the full prompt text is discarded. We store the resulting scores, feedback, and a brief preview (first ~80 characters) of your prompt for your history &mdash; but never the full original prompt.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">4. Third-Party Services</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-gray-300">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-2 pr-4">Service</th>
                    <th className="py-2 pr-4">Purpose</th>
                    <th className="py-2">Data Shared</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr><td className="py-2 pr-4">Anthropic (Claude)</td><td className="py-2 pr-4">AI grading engine</td><td className="py-2">Prompt text (in-memory, not stored)</td></tr>
                  <tr><td className="py-2 pr-4">Supabase</td><td className="py-2 pr-4">Database & auth</td><td className="py-2">Account info, score metadata</td></tr>
                  <tr><td className="py-2 pr-4">Vercel</td><td className="py-2 pr-4">Hosting</td><td className="py-2">Standard web logs</td></tr>
                  <tr><td className="py-2 pr-4">Stripe</td><td className="py-2 pr-4">Payments</td><td className="py-2">Payment info (Pro plan only)</td></tr>
                  <tr><td className="py-2 pr-4">PostHog</td><td className="py-2 pr-4">Analytics</td><td className="py-2">Anonymous usage events</td></tr>
                  <tr><td className="py-2 pr-4">Sentry</td><td className="py-2 pr-4">Error tracking</td><td className="py-2">Error logs (no prompt text)</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Shared Score Cards</h2>
            <p className="text-gray-300 leading-relaxed">
              When you share your score via the generated OG image link, only the scores, grade, and job role are embedded in the URL. The prompt text is never included in shared links or images.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">6. Data Retention & Deletion</h2>
            <p className="text-gray-300 leading-relaxed">
              You can delete your account and all associated data at any time by contacting us at{' '}
              <a href="mailto:hello@scoremyprompt.com" className="text-primary hover:underline">hello@scoremyprompt.com</a>.
              Upon deletion, all score metadata and account information are permanently removed from our database.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">7. Changes to This Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              We may update this policy from time to time. Material changes will be announced on our website. Continued use of ScoreMyPrompt after changes constitutes acceptance.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-semibold mb-3">8. Contact</h2>
            <p className="text-gray-300 leading-relaxed">
              Questions or concerns? Reach us at{' '}
              <a href="mailto:hello@scoremyprompt.com" className="text-primary hover:underline">hello@scoremyprompt.com</a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
