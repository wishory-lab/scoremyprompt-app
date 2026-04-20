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
    title: 'Write better prompts. Get',
    titleHighlight: 'better AI results',
    titleEnd: '.',
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
    promptPlaceholder: 'Paste your AI prompt here to get a free score with improvement tips...',
    minChars: 'Min 10 characters',
    scoreFree: 'Score My Prompt — Free',
    analyzing: 'Analyzing with AI...',
    frameworkHint: 'Scored on 6 dimensions: Precision · Role · Output Format · Mission Context · Structure · Tailoring',
    waitMessage: 'Please wait {seconds}s...',
    leftToday: '{count} left today',
  },

  // ─── Job Roles ──────────────────────────────────
  jobRoles: {
    Marketing: 'Marketing',
    Design: 'Design',
    Product: 'Product',
    Finance: 'Finance',
    Freelance: 'Freelance',
    Engineering: 'Engineering',
    Other: 'Other',
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
    percentileText: 'Your prompt ranks in the top {percentile}% compared to other {role} professionals.',
    signUpDimensions: 'Sign up free to see all 6 dimensions',
    wantToImprove: 'Want to Improve?',
    wantToImproveDesc: 'Based on your scores, these guides can help you strengthen your weakest dimensions.',
    improveDimension: 'Improve {dimension}',
    readGuide: 'Read guide',
    aiRewriteSuggestion: 'AI Rewrite Suggestion',
    hideRewrite: 'Hide',
    showRewrite: 'Show Rewrite',
    copyToClipboard: 'Copy to clipboard',
    rewriteHint: 'See how your prompt could be improved with AI-powered suggestions.',
    unlockWithPro: 'Unlock with Pro',
    bulkAnalysis: 'Bulk Analysis',
    exporting: 'Exporting...',
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

  // ─── Demo ────────────────────────────────────────
  demo: {
    title: 'See It In Action',
    subtitle: 'Click any example to see how PROMPT Score works',
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
    analysisResult: 'Analysis Result',
    promptDimensions: 'PROMPT Dimensions',
    tryYourOwn: 'Try Your Own Prompt',
    wantToAnalyze: 'Want to analyze your own prompt?',
    clickExample: 'Click an example above, or scroll up to analyze your own prompt',
    grade: 'Grade {grade}',
  },

  // ─── Waitlist / Newsletter ──────────────────────
  waitlist: {
    title: 'Get smarter with AI every week',
    subtitle: 'Join 5,000+ professionals. We send the week\'s top prompts, new AI tools, and practical tips.',
    subscribing: 'Subscribing...',
    subscribe: 'Subscribe',
    noSpam: 'No spam. Unsubscribe anytime.',
    successTitle: 'You\'re in!',
    successDesc: 'Check your inbox for this week\'s top prompts and start improving your AI skills.',
    watchEmail: 'Watch for emails from',
    weeklyTips: 'New prompt recipes and tips every Monday',
    joinCommunity: 'Join our community',
    subscribers: 'subscribers',
    weeklyPrompts: 'weekly prompts',
    spamFree: 'spam-free',
    emailEmpty: 'Please enter your email address',
    emailInvalid: 'Please enter a valid email address',
    subscribeFailed: 'Failed to subscribe. Please try again.',
    genericError: 'Something went wrong. Please try again.',
  },

  // ─── Leaderboard ──────────────────────────────────
  leaderboard: {
    title: 'Weekly Leaderboard',
    subtitle: 'Top prompt scores this week',
    yourBestScore: 'Your best score',
    signInRanking: 'Sign in to see your ranking',
    loading: 'Loading leaderboard...',
    loadFailed: 'Failed to load leaderboard',
    loadFailedDesc: 'Could not load leaderboard. Please try again later.',
    retry: 'Retry',
    noEntries: 'No entries found.',
    noEntriesDesc: 'Be the first to submit a prompt and claim the top spot!',
    viewRecipe: 'View Recipe',
    comingSoon: 'Coming soon',
    communityTitle: 'Join the community of prompt engineers sharing their best work',
    communitySubtitle: 'Want to see your prompts on the leaderboard?',
    startAnalyzing: 'Start analyzing your prompts',
    pageTitle: 'Prompt Leaderboard',
    pageSubtitle: 'See how your prompt skills compare with the community. Top scorers earn badges and recognition.',
    ctaTitle: 'Want to see your name here?',
    ctaSubtitle: 'Score your prompt and join the leaderboard. It\'s free — no signup required.',
    ctaButton: 'Score My Prompt',
    all: 'All',
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

// Full locale: all sections required (used by components via t.hero.title etc.)
type FullLocale = {
  [K in keyof typeof en]: (typeof en)[K] extends string ? string : { [P in keyof (typeof en)[K]]: string };
};

// Partial locale: sections optional (used by translation files that may not translate everything)
export type PartialLocale = {
  [K in keyof typeof en]?: (typeof en)[K] extends string ? string : { [P in keyof (typeof en)[K]]?: string };
};

export type Locale = FullLocale;
export default en as Locale;
