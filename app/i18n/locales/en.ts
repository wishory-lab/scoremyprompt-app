/**
 * English locale — source of truth for all user-facing strings.
 * When adding i18n support, copy this file as a template for other locales.
 */
const en = {
  // ─── Common ──────────────────────────────────────
  common: {
    appName: 'ScoreMyPrompt',
    tagline: 'Grade Your AI Prompt in 30 Seconds',
  },

  // ─── Navigation ──────────────────────────────────
  nav: {
    templates: 'Templates',
    pricing: 'Pricing',
    dashboard: 'Dashboard',
    bulk: 'Bulk',
    signIn: 'Sign In',
    signOut: 'Sign Out',
  },

  // ─── Hero ────────────────────────────────────────
  hero: {
    title: 'Write better prompts.',
    titleHighlight: 'better AI results',
    subtitle: 'Paste your prompt. Get an instant score with actionable fixes.',
    subtitleLine2: 'Free, no signup required.',
  },

  // ─── Social Proof ────────────────────────────────
  socialProof: {
    promptsScored: 'Prompts Scored',
    findItHelpful: 'Find It Helpful',
    aiDimensions: 'AI Dimensions',
  },

  // ─── Form ────────────────────────────────────────
  form: {
    jobRoleLabel: 'Your Job Role',
    promptLabel: 'Your Prompt',
    minChars: 'Min 10 characters',
    scoreFree: 'Score My Prompt — Free',
    analyzing: 'Analyzing with AI...',
    frameworkHint: 'Scored on 6 dimensions: Precision · Role · Output Format · Mission Context · Structure · Tailoring',
  },

  // ─── Examples ────────────────────────────────────
  examples: {
    title: 'Example Prompts',
    marketingStrategy: 'Marketing Strategy',
    productDesign: 'Product Design',
    financeAnalysis: 'Finance Analysis',
  },

  // ─── Trust Signals ───────────────────────────────
  trust: {
    instantResults: 'Instant Results',
    instantResultsDesc: 'Get your score in under 5 seconds with detailed AI analysis',
    actionableFixes: 'Actionable Fixes',
    actionableFixesDesc: 'Not just a score — specific improvements to make your prompts work harder',
    benchmarkYourself: 'Benchmark Yourself',
    benchmarkYourselfDesc: 'See how your prompts compare with other professionals in your field',
  },

  // ─── Result Page ─────────────────────────────────
  result: {
    promptDimensions: 'PROMPT Dimensions',
    dimensionSubtitle: 'Each letter of PROMPT measures a key aspect of prompt quality.',
    yourScore: 'Your Score',
    average: '{role} Average',
    excellentThreshold: 'Excellent Threshold',
    strengths: 'Strengths',
    improvements: 'Areas for Improvement',
    quickFix: 'Quick Fix',
    quickFixSubtitle: 'The #1 thing you can do right now to improve your score:',
    fixAndRescore: 'Fix it & re-score',
    moreFixesPro: '+{count} more fixes with full analysis',
    shareYourScore: 'Share Your Score',
    shareSubtitle: 'Showcase your prompt engineering skills and compare with other professionals.',
    analyzeAnother: 'Analyze Another Prompt',
    exportReport: 'Export Report',
    downloadBadge: 'Download Badge',
    challengeFriend: 'Challenge a Friend',
    linkCopied: 'Link Copied!',
    copied: 'Copied!',
    downloadShareCard: 'Download Share Card',
    signUpDimensions: 'Sign up free to see all 6 dimensions',
    wantToImprove: 'Want to Improve?',
    wantToImproveDesc: 'Based on your scores, these guides can help you strengthen your weakest dimensions.',
    readGuide: 'Read guide',
  },

  // ─── Validation ──────────────────────────────────
  validation: {
    promptEmpty: 'Please enter a prompt to analyze.',
    promptTooShort: 'Your prompt needs to be at least 10 characters.',
    emailEmpty: 'Please enter your email address.',
    emailInvalid: 'Please enter a valid email address.',
  },

  // ─── Errors ──────────────────────────────────────
  errors: {
    generic: 'Something went wrong. Please try again.',
    rateLimit: 'Too many requests. Please wait a moment and try again.',
    analyzeFailed: 'Failed to analyze prompt. Please try again.',
    analyzeGeneric: 'An error occurred while analyzing your prompt. Please try again.',
  },

  // ─── Loading ─────────────────────────────────────
  loading: {
    analyzing: 'Analyzing with AI...',
    dashboard: 'Loading dashboard...',
    history: 'Loading history...',
  },

  // ─── Empty States ────────────────────────────────
  empty: {
    dashboardTitle: 'No analyses yet',
    dashboardDesc: 'Score your first prompt to start tracking your progress.',
    historyTitle: 'No analyses yet',
    historyDesc: 'Score your first prompt to start building your history.',
  },

  // ─── Auth ────────────────────────────────────────
  auth: {
    signInFeatures: 'Sign in to unlock all features and save your history.',
    signInDimensions: 'Sign up free to unlock all 6 dimension insights.',
    signInDashboard: 'Sign in to view your dashboard.',
    signInHistory: 'Sign in to view your analysis history.',
    magicLinkHint: "No password needed. We'll send you a login link.",
    checkEmailTitle: 'Check your email!',
    checkEmailDesc: "We've sent you a login link. Click it to sign in to ScoreMyPrompt.",
  },

  // ─── Exit Intent ─────────────────────────────────
  exitIntent: {
    title: "Wait — don't leave yet!",
    subtitle: "You haven't scored a prompt yet. It takes 30 seconds and it's completely free. See how your AI skills compare with other professionals.",
    promptsScored: 'Prompts scored',
    averageTime: 'Average time',
    noCardNeeded: 'No card needed',
    noThanks: "No thanks, I'll pass",
  },

  // ─── Community ───────────────────────────────────
  community: {
    joinTitle: 'Join the Community',
    joinSubtitle: 'Connect with thousands of prompt engineers. Share templates, learn best practices, and stay updated.',
    follow: 'Follow @ScoreMyPrompt',
  },

  // ─── Compare Page ─────────────────────────────────
  compare: {
    title: 'Compare Prompts',
    subtitle: 'Analyze two prompts side-by-side and see which one scores higher.',
    promptA: 'Prompt A',
    promptB: 'Prompt B',
    compareButton: 'Compare Now',
    winner: 'Winner',
    tie: "It's a tie!",
    jobRoleLabel: 'Job Role',
  },

  // ─── Bulk Analysis ────────────────────────────────
  bulk: {
    title: 'Bulk Prompt Analysis',
    subtitle: 'Analyze multiple prompts at once. Pro feature.',
    addPrompt: 'Add Prompt',
    analyzeAll: 'Analyze All',
    promptCount: '{count} prompts',
    proRequired: 'Pro subscription required for bulk analysis.',
  },

  // ─── Pricing Page ─────────────────────────────────
  pricing: {
    title: 'Simple, Transparent Pricing',
    subtitle: 'Start free. Upgrade when you need more.',
    free: 'Free',
    pro: 'Pro',
    enterprise: 'Enterprise',
    perMonth: '/month',
    startTrial: 'Start Free Trial',
    currentPlan: 'Current Plan',
    faq: 'Frequently Asked Questions',
  },

  // ─── Challenge Page ───────────────────────────────
  challenge: {
    title: 'Prompt Challenge',
    subtitle: 'Can you beat this score?',
    acceptChallenge: 'Accept Challenge',
    yourTurn: 'Your Turn',
    beatScore: 'Try to beat {score} points!',
  },

  // ─── Quality Indicator ────────────────────────────
  quality: {
    weak: 'Basic',
    moderate: 'Good',
    strong: 'Detailed',
    tipContext: 'Add context or role',
    tipOutput: 'Specify output format',
    tipDetail: 'Add more detail (100+ chars)',
    tipObjective: 'State a clear objective',
  },

  // ─── Rate Limit ───────────────────────────────────
  rateLimit: {
    remaining: '{count} left today',
    waitMessage: 'Please wait {seconds}s...',
    countdown: 'Try again in {time}',
  },

  // ─── CTA ─────────────────────────────────────────
  cta: {
    title: 'Ready to write better prompts?',
    subtitle: 'Join thousands of professionals who improve their AI skills with ScoreMyPrompt.',
    button: 'Score My Prompt — It\'s Free',
  },

  // ─── Footer ───────────────────────────────────────
  footer: {
    privacy: 'Privacy',
    terms: 'Terms',
    pricing: 'Pricing',
    guides: 'Guides',
    copyright: '© {year} ScoreMyPrompt. All rights reserved.',
  },
} as const;

// DeepString: keep structure required, but allow any string value for translations
type DeepString<T> = {
  [K in keyof T]: T[K] extends string ? string : T[K] extends object ? DeepString<T[K]> : T[K];
};

export type Locale = DeepString<typeof en>;
export default en as Locale;
