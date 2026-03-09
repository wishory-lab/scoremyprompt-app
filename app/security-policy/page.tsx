import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Security Policy — ScoreMyPrompt',
  description: 'ScoreMyPrompt security policy and responsible disclosure guidelines.',
  robots: { index: true, follow: true },
};

export default function SecurityPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-dark via-surface to-dark">
      <div className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Security Policy
          </h1>
          <p className="text-gray-400">
            Last updated: March 9, 2026
          </p>
        </header>

        <div className="prose prose-invert prose-sm max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Responsible Disclosure
            </h2>
            <p className="text-gray-300 leading-relaxed">
              We take security seriously at ScoreMyPrompt. If you discover a security
              vulnerability, we appreciate your help in disclosing it to us responsibly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Reporting a Vulnerability
            </h2>
            <div className="bg-surface/50 border border-white/10 rounded-xl p-5 space-y-3">
              <p className="text-gray-300 text-sm leading-relaxed">
                Please report security issues to{' '}
                <a
                  href="mailto:security@scoremyprompt.com"
                  className="text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  security@scoremyprompt.com
                </a>
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                Include as much detail as possible: steps to reproduce, impact assessment,
                and any proof-of-concept code.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              What We Promise
            </h2>
            <ul className="space-y-2">
              {[
                'Acknowledge receipt within 48 hours',
                'Provide regular updates on our investigation',
                'Credit you in our security acknowledgments (if desired)',
                'Not pursue legal action for responsible disclosure',
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                  <span className="text-emerald-400 mt-0.5 shrink-0">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Scope
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed mb-3">
              The following are in scope for security reports:
            </p>
            <ul className="space-y-1.5">
              {[
                'scoremyprompt.com and all subdomains',
                'API endpoints at scoremyprompt.com/api/*',
                'Authentication and authorization flows',
                'Data storage and processing',
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-gray-600 mt-1 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Out of Scope
            </h2>
            <ul className="space-y-1.5">
              {[
                'Social engineering attacks',
                'Denial of service attacks',
                'Issues in third-party services',
                'Vulnerabilities in outdated browsers',
              ].map((item, i) => (
                <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                  <span className="text-gray-600 mt-1 shrink-0">•</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">
              Data Protection
            </h2>
            <p className="text-gray-300 text-sm leading-relaxed">
              ScoreMyPrompt processes prompts for analysis only. We do not permanently
              store prompt content for unauthenticated users. All API communications
              use TLS encryption. See our{' '}
              <a
                href="/privacy"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Privacy Policy
              </a>{' '}
              for full details.
            </p>
          </section>
        </div>

        <footer className="mt-16 text-center">
          <a
            href="/"
            className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
          >
            ← Back to ScoreMyPrompt
          </a>
        </footer>
      </div>
    </div>
  );
}
