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
    navHome: 'Home',
    navCommunity: 'Community →',
    heroTitle: 'Simple',
    heroTitleHighlight: 'Pricing',
    heroSubtitle: 'Choose the perfect plan for your prompt engineering needs. No hidden fees, cancel anytime.',
    freePeriod: '/forever',
    freeCta: 'Score My First Prompt',
    proPeriod: '/month',
    proTrial: '7-day free trial',
    proCta: 'Start Free Trial',
    badgeMostPopular: 'Most Popular',
    freeFeature1: 'Score up to 10 prompts a day',
    freeFeature2: 'See all 6 PROMPT dimensions',
    freeFeature3: 'Compare with peers on the leaderboard',
    freeFeature4: 'Share your score on social media',
    freeFeature5: 'Ads shown between sections',
    freeFeature6: 'No saved history',
    freeFeature7: 'No AI rewrite suggestions',
    proFeature1: 'Unlimited scoring — never hit a daily cap',
    proFeature2: 'AI rewrites your prompt for a higher score',
    proFeature3: 'Track progress and revisit past analyses',
    proFeature4: 'Score 5 prompts at once with Bulk mode',
    proFeature5: 'Clean, distraction-free experience',
    proFeature6: 'Export polished HTML reports for clients',
    proFeature7: 'Priority support when you need help',
    proFeature8: 'API access (coming Q2 2026)',
    faq1Q: 'Can I cancel?',
    faq1A: 'Yes, you can cancel your subscription at any time. You will not be charged for the next billing cycle.',
    faq2Q: 'What payment methods do you accept?',
    faq2A: 'We accept all major credit cards (Visa, Mastercard, American Express) and PayPal through Stripe.',
    faq3Q: 'What happens after my free trial?',
    faq3A: 'After 7 days, your subscription will automatically begin. You can cancel anytime before the trial ends to avoid charges.',
    faq4Q: 'Is there a refund policy?',
    faq4A: 'We offer a 30-day money-back guarantee. If you\'re not satisfied, contact our support team for a full refund.',
  },

  // ─── Guide Page ───────────────────────────────────
  guide: {
    beginnerTag: 'Beginner Guide',
    howToUse: 'How to Use',
    heroSubtitle: 'Paste any AI prompt and get a score with improvement tips across 6 dimensions. Even first-time users can start in 30 seconds.',
    stepsHeading: '4 Steps to Grade Your Prompt',
    stepLabel: 'Step',
    step1Title: 'Write or paste your prompt',
    step1Desc: 'Enter any AI prompt you want to grade. It can be for ChatGPT, Claude, Gemini — any AI model.',
    step1Tip: 'Select your job role for more relevant scoring.',
    step2Title: 'Get your PROMPT Score',
    step2Desc: 'AI analyzes your prompt across 6 dimensions and gives you a score from 0-100 with a letter grade (S/A/B/C/D).',
    step2Tip: 'Each dimension shows exactly where your prompt is strong or weak.',
    step3Title: 'Read improvement tips',
    step3Desc: 'Get specific, actionable suggestions to strengthen each weak area of your prompt.',
    step3Tip: 'Tips are tailored to your job role and use case.',
    step4Title: 'Share or iterate',
    step4Desc: 'Share your score card, compare with the leaderboard, or revise your prompt and try again for a higher score.',
    step4Tip: 'Pro users can analyze prompts in bulk.',
    frameworkHeading: 'The PROMPT Score Framework',
    frameworkDesc: 'Your prompt is analyzed across 6 dimensions. Each letter in "PROMPT" represents one.',
    dimPrecisionName: 'Precision',
    dimPrecisionDesc: 'How specific and clear is your request?',
    dimRoleName: 'Role',
    dimRoleDesc: 'Does the prompt define who the AI should be?',
    dimOutputName: 'Output Format',
    dimOutputDesc: 'Did you specify the desired format?',
    dimMissionName: 'Mission Context',
    dimMissionDesc: 'Is the background and purpose clear?',
    dimStructureName: 'Structure',
    dimStructureDesc: 'Is it well-organized and logical?',
    dimTailoringName: 'Tailoring',
    dimTailoringDesc: 'Is it customized for a specific audience?',
    featuresHeading: 'All Features',
    featuresSubtitle: 'Every feature available on ScoreMyPrompt at a glance',
    featFreeBadge: 'Free',
    featProBadge: 'Pro',
    featPromptAnalysisTitle: 'Prompt Analysis',
    featPromptAnalysisDesc: 'Grade any prompt in 30 seconds with AI-powered scoring.',
    featTemplatesTitle: 'Templates',
    featTemplatesDesc: 'Pre-built high-scoring prompt templates by profession.',
    featGuidesTitle: 'Guides',
    featGuidesDesc: 'In-depth articles on prompt engineering best practices.',
    featLeaderboardTitle: 'Leaderboard',
    featLeaderboardDesc: 'See how your prompts rank against others.',
    featShareCardTitle: 'Share Card',
    featShareCardDesc: 'Beautiful shareable result cards for social media.',
    featDashboardTitle: 'Dashboard',
    featDashboardDesc: 'Track your prompt scores over time.',
    featBulkTitle: 'Bulk Analysis',
    featBulkDesc: 'Analyze multiple prompts at once. (Pro)',
    featChallengeTitle: 'Challenge Mode',
    featChallengeDesc: 'Challenge others to beat your prompt score.',
    featCompareTitle: 'Compare Mode',
    featCompareDesc: 'Compare two prompts side by side.',
    gradeScaleHeading: 'Grade Scale',
    gradeSLabel: 'Exceptional',
    gradeALabel: 'Excellent',
    gradeBLabel: 'Good',
    gradeCLabel: 'Fair',
    gradeDLabel: 'Needs Work',
    gradePtsSuffix: 'pts',
    faqHeading: 'FAQ',
    faq1Q: 'Is it really free?',
    faq1A: 'Yes! Basic prompt scoring is free with no signup required. Pro features like bulk analysis and dashboard require a subscription.',
    faq2Q: 'What AI models does this work for?',
    faq2A: 'ScoreMyPrompt evaluates prompts universally — the PROMPT Score framework applies to ChatGPT, Claude, Gemini, Copilot, and any other AI.',
    faq3Q: 'How is the score calculated?',
    faq3A: 'Our AI evaluates your prompt across 6 dimensions (Precision, Role, Output Format, Mission Context, Structure, Tailoring). Each dimension is scored 0-100, then combined into an overall score with a letter grade.',
    faq4Q: 'Is my prompt stored?',
    faq4A: 'Prompts are processed for analysis only. Unauthenticated users\' prompts are not permanently stored.',
    faq5Q: 'Can I use it in Korean?',
    faq5A: 'Yes! ScoreMyPrompt supports multiple languages including Korean. You can switch language in the top navigation.',
    ctaReadyTitle: 'Ready to try?',
    ctaReadySubtitle: 'Free, no signup required. Done in 30 seconds.',
    ctaButton: 'Grade My Prompt',
  },

  // ─── Templates Page ───────────────────────────────
  templatesPage: {
    heroTitle: 'Prompt Templates That',
    heroTitleHighlight: 'Score 80+',
    heroSubtitle: '21 expert-crafted prompt templates across 7 job roles. Copy, customize, and score your own.',
    navGuides: 'Guides',
    navScorePrompt: 'Score a Prompt →',
    filterAll: 'All',
    templatesSuffix: 'templates',
    useTemplate: 'Use This Template',
    scoreIt: 'Score It',
    bottomCtaTitle: 'Have Your Own Prompt?',
    bottomCtaSubtitle: 'Paste any prompt and get your PROMPT Score across 6 dimensions in seconds.',
    bottomCtaButton: 'Score Your Prompt →',
  },

  // ─── Result Page (additional) ─────────────────────
  resultPage: {
    percentileText: 'Your prompt ranks in the top {percentile}% compared to other {role} professionals.',
  },

  // ─── Home Client (additional) ─────────────────────
  home: {
    examplesTitle: 'Example Prompts',
    promptLabel: 'Your Prompt',
    scoreAriaLabel: 'Score my prompt for free',
    pleaseWaitSeconds: 'Please wait {seconds}s...',
    leftToday: '{count} left today',
    tooManyRequests: 'Too many requests. Please wait {seconds} seconds and try again.',
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

export type Locale = Record<string, any>;
export default en;
