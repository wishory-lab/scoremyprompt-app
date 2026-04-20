/**
 * 스킬 5: Marketing Prompt Template Library
 * 카테고리별 검증된 프롬프트 템플릿 라이브러리
 */

export interface PromptTemplate {
  id: string;
  category: TemplateCategory;
  title: string;
  description: string;
  template: string;
  variables: TemplateVariable[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  expectedScore: number; // 예상 PROMPT 점수
  usageCount: number;
  tags: string[];
}

export interface TemplateVariable {
  name: string;
  placeholder: string;
  description: string;
  required: boolean;
  examples: string[];
}

export type TemplateCategory =
  | 'seo'
  | 'content_marketing'
  | 'social_media'
  | 'email_campaign'
  | 'product_copy'
  | 'ux_writing'
  | 'data_analysis'
  | 'strategy'
  | 'customer_research'
  | 'brand_voice';

export const TEMPLATE_CATEGORIES: Record<TemplateCategory, { label: string; icon: string; description: string }> = {
  seo: { label: 'SEO & Search', icon: '🔍', description: 'Search engine optimization and keyword strategy' },
  content_marketing: { label: 'Content Marketing', icon: '📝', description: 'Blog posts, articles, and thought leadership' },
  social_media: { label: 'Social Media', icon: '📱', description: 'Posts, captions, and social campaigns' },
  email_campaign: { label: 'Email Campaigns', icon: '📧', description: 'Newsletters, drip campaigns, and outreach' },
  product_copy: { label: 'Product Copy', icon: '🏷️', description: 'Product descriptions, landing pages, CTAs' },
  ux_writing: { label: 'UX Writing', icon: '✏️', description: 'Microcopy, error messages, onboarding flows' },
  data_analysis: { label: 'Data Analysis', icon: '📊', description: 'Reports, insights, and data interpretation' },
  strategy: { label: 'Strategy & Planning', icon: '🎯', description: 'Go-to-market, competitive analysis, roadmaps' },
  customer_research: { label: 'Customer Research', icon: '🔬', description: 'Surveys, personas, user interviews' },
  brand_voice: { label: 'Brand Voice', icon: '🎙️', description: 'Tone guides, brand messaging, style' },
};

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  // ─── SEO ───
  {
    id: 'seo-keyword-cluster',
    category: 'seo',
    title: 'SEO Keyword Cluster Strategy',
    description: 'Generate a comprehensive keyword cluster strategy with search intent mapping',
    template: `You are an SEO specialist with 10+ years of experience in {{industry}}.

TASK: Create a keyword cluster strategy for "{{target_keyword}}" targeting {{target_audience}}.

REQUIREMENTS:
1. Primary keyword cluster (5-7 keywords) with monthly search volume estimates
2. Long-tail variations (10-15 keywords) grouped by search intent:
   - Informational (how-to, what-is)
   - Commercial (best, review, comparison)
   - Transactional (buy, pricing, free trial)
3. Content gap analysis: topics competitors cover that we don't
4. Recommended content types for each cluster (blog, landing page, FAQ)

OUTPUT FORMAT: Structured table with columns: Keyword | Search Volume | Difficulty | Intent | Content Type | Priority

CONSTRAINTS:
- Focus on keywords with difficulty score under 60
- Prioritize keywords with clear commercial intent
- Include at least 3 question-based keywords for featured snippets`,
    variables: [
      { name: 'industry', placeholder: 'e.g., SaaS, e-commerce, fintech', description: 'Your industry vertical', required: true, examples: ['B2B SaaS', 'DTC e-commerce', 'Healthcare tech'] },
      { name: 'target_keyword', placeholder: 'e.g., project management software', description: 'Main keyword to build clusters around', required: true, examples: ['AI writing tool', 'prompt engineering course'] },
      { name: 'target_audience', placeholder: 'e.g., small business owners', description: 'Who you want to reach', required: true, examples: ['marketing managers', 'startup founders', 'freelance designers'] },
    ],
    difficulty: 'advanced',
    expectedScore: 92,
    usageCount: 3420,
    tags: ['seo', 'keywords', 'content-strategy', 'search-intent'],
  },

  // ─── Content Marketing ───
  {
    id: 'content-thought-leadership',
    category: 'content_marketing',
    title: 'Thought Leadership Article',
    description: 'Create a compelling thought leadership piece that positions your brand as an industry expert',
    template: `You are a senior content strategist writing for {{company_name}}, a {{company_description}}.

TASK: Write a thought leadership article about "{{topic}}" for {{target_publication}}.

AUDIENCE: {{audience_description}}

STRUCTURE:
1. Hook: Start with a provocative insight or contrarian take (2-3 sentences)
2. Problem Statement: Why this matters now (1 paragraph)
3. Core Argument: Your unique perspective with 3 supporting points
4. Evidence: Include references to industry data, trends, or case studies
5. Actionable Takeaway: What readers should do next (3-5 bullet points)
6. Closing: Forward-looking statement that reinforces your expertise

TONE: {{tone}} — authoritative but accessible, avoid jargon unless industry-standard
WORD COUNT: {{word_count}} words
FORMAT: Markdown with H2/H3 headers

CONSTRAINTS:
- No generic AI-sounding phrases ("In today's fast-paced world...")
- Include 2-3 specific data points or statistics
- Every claim must be substantiated
- End with a clear, memorable one-liner`,
    variables: [
      { name: 'company_name', placeholder: 'e.g., Acme Corp', description: 'Your company name', required: true, examples: ['ScoreMyPrompt', 'TechFlow'] },
      { name: 'company_description', placeholder: 'e.g., AI-powered productivity platform', description: 'Brief company description', required: true, examples: ['AI prompt evaluation SaaS'] },
      { name: 'topic', placeholder: 'e.g., The future of AI in marketing', description: 'Article topic', required: true, examples: ['Why prompt engineering is the new literacy'] },
      { name: 'target_publication', placeholder: 'e.g., TechCrunch, LinkedIn', description: 'Where it will be published', required: false, examples: ['Medium', 'company blog', 'HBR'] },
      { name: 'audience_description', placeholder: 'e.g., CMOs and marketing directors', description: 'Who will read this', required: true, examples: ['Tech-savvy marketers', 'C-suite executives'] },
      { name: 'tone', placeholder: 'e.g., Professional yet conversational', description: 'Writing tone', required: false, examples: ['Bold and opinionated', 'Data-driven and analytical'] },
      { name: 'word_count', placeholder: 'e.g., 1500', description: 'Target word count', required: false, examples: ['1200', '2000', '800'] },
    ],
    difficulty: 'advanced',
    expectedScore: 95,
    usageCount: 2890,
    tags: ['content', 'thought-leadership', 'blog', 'brand-authority'],
  },

  // ─── Social Media ───
  {
    id: 'social-campaign-series',
    category: 'social_media',
    title: 'Social Media Campaign Series',
    description: 'Generate a week-long social media campaign with platform-specific content',
    template: `You are a social media strategist managing {{brand_name}}'s presence across platforms.

TASK: Create a 7-day social media campaign for {{campaign_goal}}.

CAMPAIGN DETAILS:
- Product/Service: {{product}}
- Target Audience: {{audience}}
- Key Message: {{key_message}}
- Campaign Hashtag: {{hashtag}}

DELIVERABLES (for each day):
1. LinkedIn post (professional tone, 150-200 words, include a hook question)
2. Twitter/X thread (5-7 tweets, each under 280 chars, numbered)
3. Instagram caption (casual tone, 100-150 words, include 5-10 relevant hashtags)

REQUIREMENTS:
- Day 1: Awareness — introduce the problem
- Day 2-3: Education — share insights and data
- Day 4: Social proof — customer stories or testimonials
- Day 5: Behind the scenes — show your process
- Day 6: Engagement — poll, question, or challenge
- Day 7: CTA — drive to conversion

FORMAT: Organize by day, then by platform. Include emoji suggestions and best posting times (EST).

CONSTRAINTS:
- No clickbait or misleading claims
- Each post should stand alone but connect to the campaign narrative
- Include at least one data point per day`,
    variables: [
      { name: 'brand_name', placeholder: 'e.g., ScoreMyPrompt', description: 'Your brand', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'campaign_goal', placeholder: 'e.g., product launch awareness', description: 'What you want to achieve', required: true, examples: ['new feature launch', 'brand awareness', 'lead generation'] },
      { name: 'product', placeholder: 'e.g., AI prompt grading tool', description: 'What you are promoting', required: true, examples: ['AI prompt evaluation platform'] },
      { name: 'audience', placeholder: 'e.g., marketing professionals', description: 'Target audience', required: true, examples: ['AI enthusiasts', 'prompt engineers', 'content creators'] },
      { name: 'key_message', placeholder: 'e.g., Write better prompts, get better results', description: 'Core campaign message', required: true, examples: ['Grade your prompts in 30 seconds'] },
      { name: 'hashtag', placeholder: 'e.g., #ScoreMyPrompt', description: 'Campaign hashtag', required: true, examples: ['#PromptScore', '#BetterPrompts'] },
    ],
    difficulty: 'intermediate',
    expectedScore: 90,
    usageCount: 4150,
    tags: ['social-media', 'campaign', 'multi-platform', 'content-calendar'],
  },

  // ─── Email Campaign ───
  {
    id: 'email-drip-sequence',
    category: 'email_campaign',
    title: 'Email Drip Campaign Sequence',
    description: 'Create a 5-email onboarding sequence that converts free users to paid',
    template: `You are an email marketing specialist for {{company_name}}, a {{product_description}}.

TASK: Design a 5-email drip campaign to convert free trial users to paying customers.

USER CONTEXT:
- Just signed up for free trial of {{product}}
- Key pain point: {{pain_point}}
- Competitor alternatives: {{competitors}}

EMAIL SEQUENCE:
Email 1 (Day 0 - Welcome):
  - Subject line (A/B: 2 options, under 50 chars)
  - Preview text (under 90 chars)
  - Body: Welcome, quick-start guide, 1 key action
  - CTA: "Start your first {{action}}"

Email 2 (Day 2 - Quick Win):
  - Help them achieve first success
  - Include specific how-to steps
  - CTA: Try advanced feature

Email 3 (Day 5 - Social Proof):
  - Case study or testimonial
  - Metrics-driven: "Users who do X see Y% improvement"
  - CTA: See results dashboard

Email 4 (Day 8 - Unlock Value):
  - Show premium features they're missing
  - Compare free vs. pro capabilities
  - CTA: Upgrade for {{offer}}

Email 5 (Day 12 - Urgency):
  - Trial ending reminder
  - Summary of their achievements so far
  - Limited-time offer
  - CTA: Upgrade now

FORMAT: For each email provide: Subject (2 A/B options) | Preview Text | Body (150-250 words) | CTA Button Text | Send Time Recommendation

CONSTRAINTS:
- Subject lines must create curiosity without clickbait
- Each email should be self-contained (not everyone opens every email)
- Mobile-friendly formatting (short paragraphs, clear CTA)
- Include unsubscribe compliance note`,
    variables: [
      { name: 'company_name', placeholder: 'e.g., ScoreMyPrompt', description: 'Company name', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'product_description', placeholder: 'e.g., AI prompt evaluation tool', description: 'Brief product description', required: true, examples: ['AI-powered prompt grading platform'] },
      { name: 'product', placeholder: 'e.g., prompt scoring', description: 'Product name', required: true, examples: ['ScoreMyPrompt Pro'] },
      { name: 'pain_point', placeholder: 'e.g., getting generic AI outputs', description: 'Main user pain point', required: true, examples: ['wasting time on ineffective prompts'] },
      { name: 'competitors', placeholder: 'e.g., PromptPerfect, ChatGPT tips blogs', description: 'Main alternatives', required: true, examples: ['manual prompt testing', 'prompt engineering courses'] },
      { name: 'action', placeholder: 'e.g., prompt analysis', description: 'Key product action', required: true, examples: ['prompt scoring', 'AI evaluation'] },
      { name: 'offer', placeholder: 'e.g., 30% off annual plan', description: 'Upgrade incentive', required: false, examples: ['20% off first month', 'extended trial'] },
    ],
    difficulty: 'advanced',
    expectedScore: 94,
    usageCount: 2340,
    tags: ['email', 'drip-campaign', 'conversion', 'onboarding', 'saas'],
  },

  // ─── UX Writing ───
  {
    id: 'ux-microcopy-system',
    category: 'ux_writing',
    title: 'UX Microcopy System',
    description: 'Generate consistent microcopy for your product including errors, empty states, and CTAs',
    template: `You are a UX writer at {{company_name}} creating microcopy for {{product_type}}.

BRAND VOICE: {{brand_voice}}
AUDIENCE: {{audience}}

TASK: Create a comprehensive microcopy guide for the following UI states:

1. EMPTY STATES (5 variations):
   - First-time user (no data)
   - Search with no results
   - Filtered view with no matches
   - Error loading content
   - Feature not available on current plan

2. ERROR MESSAGES (5 types):
   - Form validation error
   - Network/connection error
   - Server error (500)
   - Permission denied
   - Rate limit exceeded

3. SUCCESS MESSAGES (4 types):
   - Action completed
   - Item saved/created
   - Settings updated
   - Upgrade successful

4. CTA BUTTONS (6 variations):
   - Primary action
   - Secondary action
   - Destructive action
   - Upgrade prompt
   - Share/invite
   - Learn more

5. TOOLTIPS & ONBOARDING (4 steps):
   - Feature introduction
   - First-time action guide
   - Pro tip
   - Keyboard shortcut hint

FORMAT: For each item provide:
- Copy text (keep under 120 characters for UI elements)
- Alternative version
- Notes on tone/intent

CONSTRAINTS:
- Be helpful, not blaming ("We couldn't find that" not "You entered wrong data")
- Use active voice
- No technical jargon
- Include action-oriented recovery steps in error messages
- Consistent capitalization (sentence case for body, title case for buttons)`,
    variables: [
      { name: 'company_name', placeholder: 'e.g., ScoreMyPrompt', description: 'Product name', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'product_type', placeholder: 'e.g., AI analytics dashboard', description: 'Type of product', required: true, examples: ['AI prompt evaluation platform', 'SaaS dashboard'] },
      { name: 'brand_voice', placeholder: 'e.g., Friendly, expert, slightly playful', description: 'Brand voice characteristics', required: true, examples: ['Professional yet approachable', 'Technical but clear'] },
      { name: 'audience', placeholder: 'e.g., Marketing professionals', description: 'Primary users', required: true, examples: ['Developers and marketers', 'Non-technical professionals'] },
    ],
    difficulty: 'intermediate',
    expectedScore: 91,
    usageCount: 1890,
    tags: ['ux-writing', 'microcopy', 'product', 'ui-text'],
  },

  // ─── Strategy ───
  {
    id: 'gtm-strategy',
    category: 'strategy',
    title: 'Go-To-Market Strategy',
    description: 'Create a comprehensive GTM strategy for a new product or feature launch',
    template: `You are a VP of Growth with experience launching {{industry}} products.

TASK: Create a 90-day Go-To-Market strategy for {{product_name}}.

PRODUCT: {{product_description}}
TARGET MARKET: {{target_market}}
PRICING: {{pricing_model}}
COMPETITIVE ADVANTAGE: {{differentiator}}

DELIVERABLES:

1. EXECUTIVE SUMMARY (200 words max)

2. TARGET CUSTOMER PROFILE:
   - Primary persona (demographics, behaviors, pain points)
   - Secondary persona
   - Anti-persona (who is NOT our customer)

3. POSITIONING:
   - Positioning statement (classic format)
   - Tagline options (3 variations)
   - Key messaging pillars (3)

4. CHANNEL STRATEGY:
   - Acquisition channels ranked by expected ROI
   - For each channel: tactic, budget allocation %, timeline, KPI

5. 90-DAY MILESTONE PLAN:
   - Days 1-30: Foundation (what to build/prepare)
   - Days 31-60: Launch (how to create momentum)
   - Days 61-90: Scale (how to accelerate)

6. METRICS & KPIs:
   - North Star metric
   - Leading indicators (5)
   - Lagging indicators (3)
   - Weekly/monthly targets

FORMAT: Structured document with clear headers and tables where appropriate.

CONSTRAINTS:
- Assume startup budget (not enterprise marketing spend)
- Focus on organic and low-cost channels first
- Every recommendation must include expected timeline and measurable outcome
- Be specific: "Post 3x/week on LinkedIn" not "be active on social media"`,
    variables: [
      { name: 'industry', placeholder: 'e.g., AI/SaaS', description: 'Industry vertical', required: true, examples: ['AI SaaS', 'EdTech', 'FinTech'] },
      { name: 'product_name', placeholder: 'e.g., ScoreMyPrompt Pro', description: 'Product name', required: true, examples: ['ScoreMyPrompt'] },
      { name: 'product_description', placeholder: 'e.g., AI-powered prompt evaluation tool', description: 'Brief product description', required: true, examples: ['AI tool that grades prompts across 6 dimensions'] },
      { name: 'target_market', placeholder: 'e.g., Marketing teams at SMBs', description: 'Target market', required: true, examples: ['AI-savvy professionals', 'Marketing teams'] },
      { name: 'pricing_model', placeholder: 'e.g., Freemium with $19/mo Pro tier', description: 'Pricing structure', required: true, examples: ['Free tier + $19/mo Pro'] },
      { name: 'differentiator', placeholder: 'e.g., Only tool with 6-dimension scoring', description: 'Key competitive advantage', required: true, examples: ['Real-time multi-model prompt scoring'] },
    ],
    difficulty: 'advanced',
    expectedScore: 96,
    usageCount: 5200,
    tags: ['strategy', 'gtm', 'launch', 'marketing-plan'],
  },
];

/**
 * 템플릿 검색
 */
export function searchTemplates(query: string, category?: TemplateCategory): PromptTemplate[] {
  const q = query.toLowerCase();
  return PROMPT_TEMPLATES.filter(t => {
    const matchesCategory = !category || t.category === category;
    const matchesQuery = !query ||
      t.title.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.includes(q));
    return matchesCategory && matchesQuery;
  });
}

/**
 * 템플릿에 변수 적용
 */
export function applyTemplate(template: PromptTemplate, values: Record<string, string>): string {
  let result = template.template;
  template.variables.forEach(v => {
    const value = values[v.name] || v.placeholder;
    result = result.replace(new RegExp(`\\{\\{${v.name}\\}\\}`, 'g'), value);
  });
  return result;
}

/**
 * 카테고리별 인기 템플릿
 */
export function getPopularTemplates(limit = 5): PromptTemplate[] {
  return [...PROMPT_TEMPLATES]
    .sort((a, b) => b.usageCount - a.usageCount)
    .slice(0, limit);
}
