/* eslint-disable */
// One-off: append fallback English keys (new pricing keys + guide/templatesPage/resultPage/home/cta)
// to every non-en, non-ko locale so the DeepWiden<typeof en> type is satisfied.
const fs = require('fs');
const path = require('path');

const FILES = ['de', 'es', 'fr', 'hi', 'ja', 'pt', 'zh-CN', 'zh-TW'];
const LOCALES_DIR = path.join(__dirname, '..', 'app', 'i18n', 'locales');

const EXTRA_PRICING_KEYS = `    navHome: 'Home',
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
    faq4A: "We offer a 30-day money-back guarantee. If you're not satisfied, contact our support team for a full refund.",
`;

const NEW_SECTIONS = `  cta: {
    title: 'Ready to write better prompts?',
    subtitle: 'Join thousands of professionals who improve their AI skills with ScoreMyPrompt.',
    button: "Score My Prompt — It's Free",
  },
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
    faq4A: "Prompts are processed for analysis only. Unauthenticated users' prompts are not permanently stored.",
    faq5Q: 'Can I use it in Korean?',
    faq5A: 'Yes! ScoreMyPrompt supports multiple languages including Korean. You can switch language in the top navigation.',
    ctaReadyTitle: 'Ready to try?',
    ctaReadySubtitle: 'Free, no signup required. Done in 30 seconds.',
    ctaButton: 'Grade My Prompt',
  },
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
  resultPage: {
    percentileText: 'Your prompt ranks in the top {percentile}% compared to other {role} professionals.',
  },
  home: {
    examplesTitle: 'Example Prompts',
    promptLabel: 'Your Prompt',
    scoreAriaLabel: 'Score my prompt for free',
    pleaseWaitSeconds: 'Please wait {seconds}s...',
    leftToday: '{count} left today',
    tooManyRequests: 'Too many requests. Please wait {seconds} seconds and try again.',
  },
`;

for (const code of FILES) {
  const file = path.join(LOCALES_DIR, `${code}.ts`);
  let src = fs.readFileSync(file, 'utf8');

  // Normalize EOL
  const hadCRLF = src.includes('\r\n');
  src = src.replace(/\r\n/g, '\n');

  // 1) Inject extra pricing keys: find the pricing block and insert before its closing `  },`
  const pricingCloseRe = /(\n {2}pricing: \{[\s\S]*?faq: '[^']+',\n)( {2}\},)/;
  if (pricingCloseRe.test(src) && !/freePeriod:/.test(src)) {
    src = src.replace(pricingCloseRe, (_, head, tail) => head + EXTRA_PRICING_KEYS + tail);
  }

  // 2) Append new sections before `} as const;`
  if (!/ {2}guide: \{/.test(src)) {
    src = src.replace(/\n\} as const;\n/, `\n${NEW_SECTIONS}} as const;\n`);
  }

  if (hadCRLF) src = src.replace(/\n/g, '\r\n');
  fs.writeFileSync(file, src);
  console.log(`patched ${code}.ts`);
}
