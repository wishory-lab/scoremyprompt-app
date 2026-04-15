interface GuideSection {
  heading: string;
  content: string[];
}

export interface GuideContent {
  slug: string;
  title: string;
  description: string;
  readingTime: number;
  difficulty: string;
  relatedSlugs?: string[];
  relevantDimensions?: string[];
  sections: GuideSection[];
}

export const GUIDES_CONTENT: GuideContent[] = [
  {
    slug: 'how-to-write-better-ai-prompts',
    title: 'How to Write Better AI Prompts: Complete Guide',
    description: 'Master the fundamentals of prompt engineering with our comprehensive guide. Learn proven techniques to get better results from ChatGPT, Claude, and other AI models.',
    readingTime: 8,
    difficulty: 'Beginner',
    relatedSlugs: ['prompt-score-framework', 'chatgpt-prompt-tips', 'prompt-engineering-for-beginners'],
    relevantDimensions: ['precision', 'outputFormat', 'tailoring'],
    sections: [
      {
        heading: 'Why Prompts Matter More Than You Think',
        content: [
          'The quality of your AI responses directly depends on the quality of your prompts. A well-crafted prompt can be the difference between a mediocre output and something truly exceptional. In 2025, prompt engineering is one of the most valuable skills you can develop, whether you\'re a marketer, designer, developer, or entrepreneur.',
          'Think of prompts like instructions to a highly intelligent but literal-minded assistant. If you say "write a poem," you might get something generic. If you say "write a haiku about autumn leaves that captures the melancholy of impermanence," you\'ll get something specific and meaningful. The AI responds to precision, context, and clarity.',
          'This guide will show you exactly how to write prompts that get results. We\'ll cover the PROMPT framework—a systematic approach used by top performers to consistently generate high-quality outputs.',
        ],
      },
      {
        heading: 'The PROMPT Framework Explained',
        content: [
          'The PROMPT framework is a six-dimensional approach to evaluating and writing effective prompts. Each letter represents a critical component: Precision, Role, Output Format, Mission Context, Structure, and Tailoring.',
          'Precision (P): Be specific about what you want. Instead of "write content about AI," say "write a 500-word blog post introduction about how AI is transforming customer service, suitable for a B2B SaaS audience."',
          'Role (R): Tell the AI what perspective to adopt. "Act as a senior product manager at a fintech startup" gives the AI a specific lens through which to approach your request.',
          'Output Format (O): Specify exactly how you want the information delivered. Do you want a bullet list, a structured document, code, a table, or prose? Be explicit.',
          'Mission Context (M): Explain why you need this and what you\'ll use it for. "I need this to pitch investors" or "This is for a landing page targeting SMBs" gives crucial context.',
          'Structure (S): Define how the response should be organized. "Start with an executive summary, then three main sections with subheadings, and end with a call to action."',
          'Tailoring (T): Customize the tone, style, and technical level. "Use a conversational tone, avoid jargon, and assume the reader has no prior knowledge" ensures the output fits your needs.',
        ],
      },
      {
        heading: 'Deep Dive: The 6 Dimensions of Better Prompts',
        content: [
          'Dimension 1 - Precision: Vague prompts generate vague results. Include specific details, numbers, constraints, and requirements. Instead of "create a marketing plan," try "create a 90-day marketing plan for a new productivity app targeting remote teams, with focus on content marketing and partnerships, including specific channels and monthly targets."',
          'Dimension 2 - Role Assignment: The role you assign shapes the entire response. A "certified financial advisor" will respond differently than a "growth hacker" or "sustainability consultant." Choose roles that match your objective. For creative work, assign roles like "award-winning copywriter" or "creative director." For analytical work, use "data scientist" or "business strategist."',
          'Dimension 3 - Output Format: Structure matters. Specify "provide as a JSON object," "format as markdown with headings," "create an HTML table," or "write in outline format with bullet points." The AI will adapt its response structure accordingly.',
          'Dimension 4 - Mission Context: Always explain the "why." Are you using this for a presentation? A client proposal? Internal documentation? The context helps the AI calibrate tone, depth, and style. "This is for a pitch to VCs" gets different output than "This is for my team brainstorm."',
          'Dimension 5 - Structure/Scaffolding: Break down complex requests into steps. "First provide an analysis of current market trends, then suggest three differentiated positioning approaches, then recommend which is best for our segment" guides the AI through your logical flow.',
          'Dimension 6 - Tailoring: Specify constraints like "use simple language for a general audience," "make it technical and detailed for engineers," "keep it under 200 words," or "include 2-3 data points to support claims." These micro-specifications dramatically improve relevance.',
        ],
      },
      {
        heading: 'Common Mistakes That Kill Prompt Quality',
        content: [
          'Mistake 1 - Being Too Casual or Vague: "Tell me about marketing" is useless. The AI doesn\'t know what aspect of marketing, for what industry, what format, or what you\'ll do with it. Add constraints and specificity at every level.',
          'Mistake 2 - Forgetting to Assign a Role: Not providing a perspective makes the AI default to "helpful assistant." Specific roles produce specific angles. Always include "act as" or "assume you are."',
          'Mistake 3 - Not Specifying Output Format: Saying "I need ideas" is different from "I need 5 ideas in a numbered list format with 2-3 sentences each." Be explicit about structure.',
          'Mistake 4 - Skipping Context: The AI can\'t read your mind. If you don\'t explain why you need something or how you\'ll use it, the output won\'t fit your actual needs. Always include mission context.',
          'Mistake 5 - Making It Too Long and Unfocused: A prompt with seven different requests dilutes quality. Focus each prompt on one main objective. If you need seven things, send seven focused prompts.',
          'Mistake 6 - Ignoring Tone and Style: "Write something good" is vague about tone. Specify: "Write in a friendly, conversational tone like you\'re explaining to a smart friend," or "Use a formal, professional tone suitable for a board presentation."',
        ],
      },
      {
        heading: 'Before and After Examples',
        content: [
          'Example 1 - Marketing Email:',
          'BEFORE: "Write a sales email"',
          'AFTER: "Write a 100-word cold outreach email for a B2B SaaS product (project management tool). Target: small marketing agencies (5-20 people). Goal: get a demo call. Tone: friendly and professional. Include a specific benefit (time savings) and a soft CTA (short 15-min call)."',
          'Example 2 - Product Description:',
          'BEFORE: "Describe our product"',
          'AFTER: "Write a 150-word product description for our AI-powered expense management software. Audience: CFOs at mid-market companies (50-500 employees). Highlight three benefits: time saved, accuracy improved, compliance. Tone: professional but approachable. Format: three short paragraphs with clear subheadings. Avoid technical jargon."',
          'Example 3 - Creative Content:',
          'BEFORE: "Create content ideas"',
          'AFTER: "Generate 5 LinkedIn post ideas for a founder of a climate-tech startup. Posts should highlight company milestones, industry trends, and thought leadership. Each idea: headline (max 10 words), content summary (50 words), and engagement hook. Target audience: investors and sustainability professionals."',
        ],
      },
      {
        heading: 'Quick Tips Checklist for Instant Improvement',
        content: [
          '✓ Be Specific: Include numbers, names, constraints, and examples whenever possible.',
          '✓ Assign a Role: Tell the AI what expertise or perspective to adopt.',
          '✓ Define Output Format: Specify structure (bullet points, paragraphs, code, tables, etc.).',
          '✓ Provide Context: Explain why you need this and what you\'ll do with it.',
          '✓ Set Length Limits: "300-500 words" is better than "not too long."',
          '✓ Name Your Audience: "For a general audience" vs. "for experienced engineers" creates different outputs.',
          '✓ Use Examples: Providing a template or example often improves results dramatically.',
          '✓ Test and Iterate: Your first prompt rarely produces your best output. Refine based on results.',
          '✓ Use ScoreMyPrompt: Before sending your prompt to the AI, check your PROMPT Score at scoremyprompt.com to identify gaps.',
        ],
      },
    ],
  },
  {
    slug: 'chatgpt-prompt-tips',
    title: '15 ChatGPT Prompt Tips That Actually Work',
    description: 'Unlock ChatGPT\'s full potential with 15 practical, battle-tested prompt techniques. From beginner basics to advanced strategies that top professionals use.',
    readingTime: 10,
    difficulty: 'Intermediate',
    relatedSlugs: ['how-to-write-better-ai-prompts', 'prompt-score-framework', 'prompt-engineering-for-beginners'],
    relevantDimensions: ['precision', 'role', 'promptStructure'],
    sections: [
      {
        heading: 'Beginner Tips (1-5): Master the Basics',
        content: [
          'Tip 1 - Use Temperature Language to Set Tone: Add descriptive adjectives about how the AI should "feel." Example: "Write this in a warm, encouraging tone" vs. "Write this in a formal, authoritative tone." ChatGPT responds to mood descriptors and adjusts accordingly.',
          'Tip 2 - Ask for Revisions in the Same Conversation: Don\'t start over. Instead of a new prompt, say "Make it shorter" or "Make it more technical" or "Rewrite from a different angle." ChatGPT maintains context and refines iteratively.',
          'Tip 3 - Use the Word "Please" and Be Polite: This sounds silly, but politeness improves output quality. Compare "Generate ideas" vs. "Could you please generate 5 innovative ideas for..." The respectful framing tends to produce more thoughtful responses.',
          'Tip 4 - Break Complex Requests into Smaller Steps: Instead of asking for a complete strategic plan in one prompt, ask: (1) "Analyze our market position," (2) "Identify three growth opportunities," (3) "Create a 6-month roadmap for the top opportunity." Sequential prompts are more reliable.',
          'Tip 5 - Include Examples of What You Want: Show ChatGPT a model of good output. Say: "Here\'s an example of the style I want [insert example]. Now create something similar for [your topic]." Pattern-matching works well for ChatGPT.',
        ],
      },
      {
        heading: 'Intermediate Tips (6-10): Level Up Your Results',
        content: [
          'Tip 6 - Use System Messages at the Start of Conversations: Begin with a meta-prompt that defines the AI\'s role and constraints. Example: "You are an expert prompt engineer specializing in marketing. You will provide practical, actionable advice with real examples. You will challenge me if a request isn\'t clear enough." This frames the entire conversation.',
          'Tip 7 - Ask for Reasoning Before the Answer: Prompt: "Think step-by-step and explain your reasoning before providing the answer." Or: "Walk me through your thinking process." This causes ChatGPT to engage more deeply and produce higher-quality outputs.',
          'Tip 8 - Use Structured Formats like JSON or Markdown: Specify exactly how you want data returned. "Return as a JSON object with fields: title, description, difficulty, steps" produces machine-readable, structured output. This is especially useful for automation or further processing.',
          'Tip 9 - Include Constraints and Limitations: Tell ChatGPT what NOT to do. "Avoid using passive voice," "Don\'t mention price," "Don\'t recommend enterprise solutions," or "Exclude any references to this competing product." Constraints improve relevance.',
          'Tip 10 - Combine Roles with Constraints: "Act as a skeptical investor reviewing this pitch. Point out weaknesses and risks, not just strengths." or "Act as a copy editor. Tighten this text by 25% without losing meaning." Combining role + constraint is powerful.',
        ],
      },
      {
        heading: 'Advanced Tips (11-15): Pro-Level Techniques',
        content: [
          'Tip 11 - Use Chain-of-Thought Prompting for Complex Analysis: Ask ChatGPT to show all intermediate steps. "Analyze this business case. Show each assumption you\'re making, explain how you evaluate each factor, then reach your conclusion." This improves accuracy for complex reasoning.',
          'Tip 12 - Request Multiple Perspectives or Alternatives: "Provide three different approaches to this problem. For each, explain the pros, cons, and when you\'d recommend it." Getting multiple framings helps you make better decisions.',
          'Tip 13 - Use Prompt Chaining for Deep Work: Create a sequence of prompts that build on each other. (1) Research phase: "What are the current best practices in X?" (2) Synthesis: "Summarize these into 5 core principles." (3) Application: "How would you apply these to a small business?" Chaining creates depth.',
          'Tip 14 - Leverage the 80/20 Principle: Tell ChatGPT what you want most. "I need this to be 80% focused on ROI and 20% on implementation details" directs the emphasis. ChatGPT will weight sections accordingly.',
          'Tip 15 - Score Your Prompts with PROMPT Framework: After crafting a prompt, evaluate it against six dimensions: Precision, Role, Output Format, Mission Context, Structure, and Tailoring. Use scoremyprompt.com to identify which dimensions need strengthening, then refine.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-engineering-for-beginners',
    title: 'Prompt Engineering for Beginners: Start Here',
    description: 'Everything you need to know to start prompt engineering today. No experience required. Learn the fundamentals and start getting better results immediately.',
    readingTime: 9,
    difficulty: 'Beginner',
    relatedSlugs: ['how-to-write-better-ai-prompts', 'prompt-score-framework', 'chatgpt-prompt-tips'],
    relevantDimensions: ['precision', 'role', 'missionContext'],
    sections: [
      {
        heading: 'What is Prompt Engineering?',
        content: [
          'Prompt engineering is the art and science of writing effective instructions for AI models like ChatGPT, Claude, Gemini, and others. It\'s the practice of crafting inputs (prompts) that elicit high-quality outputs from large language models.',
          'You don\'t need to understand how neural networks work or have any technical background. Prompt engineering is fundamentally about clear communication. It\'s about learning to ask AI the right questions in the right way.',
          'Think of it like the difference between asking a research assistant "Tell me about marketing" versus "I need a 1,000-word analysis of why B2B SaaS companies are switching from cost-per-lead to value-based pricing models, including three case studies." The specificity matters enormously.',
          'Prompt engineering is a practical skill that anyone can learn. It requires observation, iteration, and refinement—not advanced technical knowledge. Every time you interact with an AI, you\'re doing prompt engineering.',
        ],
      },
      {
        heading: 'Why Prompt Engineering Matters in 2025',
        content: [
          'We\'re in the middle of an AI revolution. AI tools are becoming essential for productivity across every profession. But here\'s the secret: AI capabilities are roughly equal across different users. What separates high performers from average users is prompt skill.',
          'A mediocre prompt to a powerful AI produces mediocre results. A great prompt to the same AI produces exceptional results. Your ability to articulate what you want, provide context, and guide the AI toward your goal directly determines the value you get.',
          'In 2025, prompt engineering is a competitive advantage. Professionals who master this skill get better results faster, which means higher productivity, better output quality, and frankly, career advantages. Companies are starting to hire for "prompt engineer" roles.',
          'The barrier to entry is zero. You don\'t need to buy anything or invest in expensive training. You just need to learn principles and practice with free tools. This guide gives you both.',
        ],
      },
      {
        heading: 'Your First Good Prompt: A Step-by-Step Template',
        content: [
          'Here\'s a simple template to structure your first prompt:',
          'Step 1 - Assign a Role: "You are a [expertise/role]."',
          'Step 2 - Give Context: "I need to [goal] for [audience/purpose]."',
          'Step 3 - Be Specific: "Specifically, I want [clear description with details]."',
          'Step 4 - Define Format: "Please format as [structure: bullet points, paragraphs, code, etc.]."',
          'Step 5 - Set Constraints: "Keep it to [length], avoid [things to avoid], use [tone/style]."',
          'Example: "You are a social media marketing expert. I need to create a 30-day content calendar for Instagram for a sustainable fashion brand targeting eco-conscious millennials. Specifically, I want 30 posts (one per day) that balance product showcases with educational content about sustainable fashion. Please format as a simple table with: Date, Post Type, Caption (max 150 words), Hashtags (10 max), and Content Ideas. Keep captions engaging and conversational, avoid corporate jargon, and include 3-4 posts that explicitly mention our sustainability mission."',
          'That\'s it. Follow this structure and you\'ll see immediate improvement in your AI outputs.',
        ],
      },
      {
        heading: 'The 5 Biggest Beginner Mistakes (And How to Avoid Them)',
        content: [
          'Mistake 1 - Being Too Vague: The #1 beginner error. "Write an email" is infinitely less useful than "Write a cold outreach email to a potential customer who has viewed our pricing page but hasn\'t signed up. Goal: get them to schedule a 15-minute demo. Tone: friendly and non-pushy. Length: under 100 words." Vagueness kills quality.',
          'Mistake 2 - Not Providing Context: AI works better when it understands your situation. Don\'t just ask "How do I price my product?" Instead: "I\'m launching a B2B SaaS tool for small marketing agencies. My competitors price between $X-Y per month. My costs are Z. Our ideal customer is agencies doing $500K-2M in annual revenue. How should I price this?" Context unlocks better thinking.',
          'Mistake 3 - Asking for Too Much in One Prompt: Asking for a complete business plan, marketing strategy, and financial projection in one prompt dilutes quality. Break it up. Send focused prompts one at a time and build on the results.',
          'Mistake 4 - Not Iterating: Your first output is rarely your best. Get the initial response, then refine: "Make this more concise," "Add more specific examples," "Rewrite this section for a technical audience," "Focus more on ROI and less on features." Iteration improves quality.',
          'Mistake 5 - Treating AI as Infallible: AI hallucinates, makes mistakes, and sometimes confidently states incorrect information. Always fact-check important outputs, especially numbers and claims. Use AI to accelerate your thinking, not replace it.',
        ],
      },
      {
        heading: 'Practice Exercises to Build Your Skill',
        content: [
          'Exercise 1 - The Vagueness Challenge: Take one of your current prompts. Rewrite it to be 50% more specific. Add numbers, constraints, examples, and context. Run both versions through an AI and compare the results.',
          'Exercise 2 - The Role Assignment Exercise: Take a prompt you\'ve used. Assign three different roles (e.g., "marketing expert," "product manager," "creative director") and send the same prompt with each role. Notice how the perspective changes the output.',
          'Exercise 3 - The Format Variation: Write one prompt and ask for the same information in three different formats (bullet points, prose paragraphs, and a table). See how format changes clarity and usability.',
          'Exercise 4 - The Iteration Challenge: Get an initial response from an AI. Spend 10 minutes refining it with follow-up prompts: make it shorter, add examples, change tone, focus on different aspects. Notice how iteration compounds quality.',
          'Exercise 5 - Score Your Prompts: Go to scoremyprompt.com and analyze 3-5 of your actual prompts. Identify which dimensions (Precision, Role, Output Format, Mission Context, Structure, Tailoring) are weak. Rewrite to improve your score.',
        ],
      },
      {
        heading: 'Next Steps: From Beginner to Confident',
        content: [
          'You\'ve learned the fundamentals. Now it\'s time to practice. Here are your next steps:',
          'Step 1 - Start Using the Template: Every prompt you write for the next week, use the five-step template above. This builds muscle memory.',
          'Step 2 - Measure Your Results: For prompts that matter to you, save the output and note the quality. This helps you notice improvement.',
          'Step 3 - Read Examples: Study great prompts from others. Look at what makes them work.',
          'Step 4 - Join Communities: Follow prompt engineering communities on Twitter/X, Reddit (r/ChatGPT), or Discord where people share tips and examples.',
          'Step 5 - Score Regularly: Every few days, paste a prompt into scoremyprompt.com and see your PROMPT Score. Track how it improves as you learn.',
          'Remember: prompt engineering is a skill, not a talent. Anyone can get better with practice. The people getting extraordinary results from AI aren\'t smarter—they just ask better questions.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-engineering-for-marketers',
    title: 'AI Prompts for Marketers: Templates & Strategies',
    description: 'Real prompt templates for marketing tasks. Save hours with AI-generated campaigns, copy, and strategy. Includes examples for every marketing function.',
    readingTime: 11,
    difficulty: 'Intermediate',
    relatedSlugs: ['how-to-write-better-ai-prompts', 'chatgpt-prompt-tips', 'prompt-engineering-for-designers'],
    relevantDimensions: ['missionContext', 'tailoring', 'outputFormat'],
    sections: [
      {
        heading: 'Why Marketers Need Prompt Skills',
        content: [
          'Marketing is one of the best domains for AI leverage. AI excels at generating ideas, drafting copy, analyzing data patterns, and creating content variations—all core marketing tasks. But generic AI outputs won\'t cut it for professional marketing. You need prompts that force AI to think like a strategist, not just generate filler.',
          'The marketers winning in 2025 aren\'t those avoiding AI (impossible, honestly) or using generic prompts. They\'re the ones who have learned to brief AI effectively. They use AI to multiply their output while maintaining their brand voice and strategic vision.',
          'This section gives you real templates you can copy, paste, and customize for your specific campaigns. Each template is battle-tested by marketing professionals.',
        ],
      },
      {
        heading: 'Email Campaign Prompts',
        content: [
          'Template 1 - Cold Outreach Email:',
          '"You are an expert B2B copywriter specializing in cold outreach. Write a 50-70 word cold email to [PROSPECT COMPANY] (describe: industry, size, likely pain points). Goal: get them to respond to a discovery call. Our product: [BRIEF DESCRIPTION]. Key benefit: [PRIMARY VALUE]. Tone: friendly, professional, not salesy. Include a specific reason why you\'re reaching out (research insight, mutual connection, relevant recent news). Make the CTA small: \'Open for a quick 15-min call?\'"',
          'Template 2 - Re-engagement Email:',
          '"I\'m writing to a customer who bought from us 6 months ago but hasn\'t engaged since. They originally purchased [PRODUCT] for [USE CASE]. Write a 75-word re-engagement email that: (1) acknowledges the time since purchase, (2) shares one new feature or use case they might not know about, (3) offers a specific incentive to re-engage (discount, exclusive training, early access to beta). Tone: warm, helpful, not desperate. Goal: get them to reply or click through to a resource."',
          'Template 3 - Segment-Specific Campaign:',
          '"You are a marketing strategist. Our customer base segments into: [SEGMENT 1], [SEGMENT 2], [SEGMENT 3]. Each segment has different pain points and use cases. Write three versions of a promotional email (one for each segment), 60-80 words each. Each version should: (1) reference segment-specific pain points, (2) highlight relevant features/benefits, (3) use segment-appropriate tone and language. Make it clear how these are different even though they\'re about the same promotion."',
        ],
      },
      {
        heading: 'Social Media Prompts',
        content: [
          'Template 1 - Content Calendar:',
          '"Create a 2-week content calendar for [PLATFORM: LinkedIn/Twitter/Instagram]. Company: [NAME], Industry: [INDUSTRY], Target Audience: [DESCRIBE]. Goal: [AWARENESS/ENGAGEMENT/TRAFFIC]. Content mix: 40% educational, 30% promotional, 20% industry news, 10% behind-the-scenes. Format as a table with: Date, Content Type, Hook/Headline (max 15 words), Caption (100-150 words), CTA, and 5-7 hashtags. Make headlines attention-grabbing. Captions should be scannable with short paragraphs."',
          'Template 2 - Thread/Carousel Series:',
          '"Write a Twitter/LinkedIn thread about [TOPIC] for [AUDIENCE]. This should be 7-10 tweets/slides that: (1) start with a compelling hook that makes people want to read all of it, (2) provide genuine value/insight in each tweet, (3) build progressively toward a conclusion or insight, (4) use accessible language with some personality. Each tweet/slide: 280 characters or roughly 50-80 words. End with a clear CTA (follow, reply with thoughts, link to resource)."',
          'Template 3 - Viral Post Ideation:',
          '"Generate 5 post ideas for [PLATFORM] that have high viral potential for [AUDIENCE]. Each idea should: (1) tap into a current trend or timeless truth relevant to your industry, (2) evoke emotion or curiosity, (3) have a unique angle (not generic advice), (4) be shareable (useful, funny, or provocative). For each idea, provide: Hook, Why it works, Suggested format (text/image/video), and Estimated reach impact."',
        ],
      },
      {
        heading: 'SEO Content Prompts',
        content: [
          'Template 1 - Blog Post Outline:',
          '"Create an SEO-optimized blog post outline for the keyword: [KEYWORD]. Target audience: [DESCRIBE]. Estimated length: [WORD COUNT]. Include: H1 (blog title optimized for the keyword), compelling meta description (under 160 chars), and outline with H2s and H3s. The outline should: (1) answer the search intent (informational/navigational/transactional), (2) include secondary keywords naturally, (3) cover what competitors rank for + one unique angle, (4) build logical flow, (5) suggest where to include internal links to [YOUR SITE]. For each main section, provide a 1-2 sentence guidance on what to cover."',
          'Template 2 - Meta Tags Optimization:',
          '"Write 3 options each for title tag and meta description for this article: [ARTICLE SUMMARY]. Keywords we want to rank for: [PRIMARY KEYWORD, SECONDARY KEYWORD]. Target audience: [DESCRIBE]. Requirements: Title tag under 60 chars, meta description under 160 chars, both must include primary keyword, compelling enough to generate clicks from SERP. Make each option distinct in angle/appeal."',
          'Template 3 - Pillar Content Brief:',
          '"I\'m creating a pillar page for the topic: [MAIN TOPIC]. This pillar will link to cluster articles on: [SUBTOPIC 1], [SUBTOPIC 2], [SUBTOPIC 3]. Write a comprehensive outline for the pillar page that: (1) provides authoritative overview of the main topic, (2) explains how each subtopic relates to and supports the pillar topic, (3) includes strategic internal links to cluster pages, (4) targets high-volume keywords while supporting cluster rankings, (5) is 2,000-3,000 words. Format as H1, meta description, then H2s with supporting content notes."',
        ],
      },
      {
        heading: 'Ad Copy Prompts',
        content: [
          'Template 1 - Google Search Ad Copy:',
          '"Write 3 variations of Google Search ad copy for: [PRODUCT/SERVICE]. Target keyword: [KEYWORD]. Audience: [DESCRIBE]. Unique value prop: [WHAT MAKES YOU DIFFERENT]. CTA: [DESIRED ACTION]. Format: 2 headlines (30 chars each) + 2 descriptions (90 chars each) + display URL. Each variation should take a different angle: Variation 1 emphasizes [ANGLE 1], Variation 2 emphasizes [ANGLE 2], Variation 3 uses urgency/scarcity. All should be benefit-focused, include the keyword naturally, and be compelling."',
          'Template 2 - Facebook/LinkedIn Ad Copy:',
          '"Write ad copy for [PLATFORM] promoting [PRODUCT]. Target audience: [SPECIFIC DEMOGRAPHIC]. Campaign objective: [AWARENESS/CONVERSION/ENGAGEMENT]. Hook style: [QUESTION/STATEMENT/STORY]. Copy should: (1) grab attention in first 2 lines, (2) speak directly to audience pain point, (3) present clear solution/benefit, (4) include social proof or credibility if relevant, (5) strong CTA. Tone: [CONVERSATIONAL/PROFESSIONAL/HUMOROUS]. Estimated length: 125-150 words."',
          'Template 3 - Retargeting Ad Copy:',
          '"Write retargeting ad copy for someone who [PREVIOUS ACTION: visited pricing/abandoned cart/read blog post]. Goal: [CONVERT/MOVE THEM TO NEXT STEP]. Key message: [PRIMARY REASON TO CONVERT NOW]. Create 2 versions: Version 1 emphasizes what they\'ll gain (positive), Version 2 emphasizes what they\'ll miss (FOMO). Both under 100 words. Include a specific CTA and sense of urgency (limited time, exclusive offer, etc.)."',
        ],
      },
      {
        heading: 'Measuring Prompt ROI: Track What Works',
        content: [
          'It\'s not enough to use AI for marketing tasks. You need to measure whether these AI-generated outputs actually improve your results.',
          'Track These Metrics:',
          'Email: Open rate, click-through rate, reply rate, conversion rate. Compare AI-generated versions to your previous performance.',
          'Social: Engagement rate (likes, comments, shares), reach, follower growth. Track which content types get the best response.',
          'SEO: Keyword rankings, organic traffic, click-through rate from search results. Score improvements show up in rankings over time.',
          'Ads: Click-through rate, conversion rate, cost per acquisition. A/B test AI copy against your control copy.',
          'Pro Tip: When an AI-generated output performs exceptionally well, analyze why. Was it the hook? The specific benefit called out? The tone? Document what works and refine your prompts accordingly.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-engineering-for-designers',
    title: 'AI Prompt Guide for Designers',
    description: 'Master AI image generation and design prompts. Techniques for Midjourney, DALL-E, and design briefs. Create stunning visuals with precise prompts.',
    readingTime: 10,
    difficulty: 'Intermediate',
    relatedSlugs: ['prompt-engineering-for-marketers', 'how-to-write-better-ai-prompts', 'chatgpt-prompt-tips'],
    relevantDimensions: ['precision', 'outputFormat', 'tailoring'],
    sections: [
      {
        heading: 'Design-Specific Prompt Techniques',
        content: [
          'Designing with AI requires a different mindset than text-based prompts. Visual AI models (like Midjourney, DALL-E 3, Stable Diffusion) respond to different types of instructions. Where text prompts need role and context, design prompts need visual references, style descriptors, and technical specifications.',
          'The most successful design prompts combine three elements: (1) What you\'re creating (image subject), (2) How it should look (style, mood, artistic direction), and (3) Technical specifications (aspect ratio, lighting, medium). Missing any of these results in mediocre outputs.',
          'Designers who leverage AI effectively aren\'t replacing their skills. They\'re using AI to rapidly explore variations, speed up iteration, and handle time-consuming tasks (like backgrounds, color explorations) so they can focus on high-level creative direction.',
        ],
      },
      {
        heading: 'UI/UX Prompt Structures',
        content: [
          'For UI/UX design, your prompts need to be specific about function and form:',
          'Template 1 - Mobile App Screen:',
          '"Design a mobile app onboarding screen for [APP]. Objective: [GOAL]. Key elements: [DESCRIBE LAYOUT]. Style: [MODERN/MINIMAL/PLAYFUL]. Color palette: [DESCRIBE]. Typography: [CLEAN/BOLD/ELEGANT]. Include: [BUTTONS/TEXT/ICONS]. Avoid: [CLUTTER/REALISM/SPECIFIC ELEMENTS]. The design should feel [PROFESSIONAL/APPROACHABLE/TECHNICAL] and guide the user to [NEXT STEP]."',
          'Template 2 - Dashboard Layout:',
          '"Create a dashboard design for [SOFTWARE/TOOL]. Primary user: [ROLE]. Key metrics to display: [METRIC 1, 2, 3]. Layout style: [GRID/CARDS/CUSTOM]. Visual hierarchy: emphasize [PRIMARY ELEMENT]. Color scheme: [DESCRIBE OR REFERENCE]. The design should make it easy to [MAIN TASK] and should feel [PROFESSIONAL/MODERN/MINIMAL]. Include space for [SECONDARY FEATURES]."',
          'Key design prompt principles: Be specific about what information needs to be visible and in what priority. Describe the mood or feeling you want the design to evoke. Reference design systems or competitors for style direction (e.g., "inspired by Apple\'s design system" or "in the style of Figma\'s UI").',
        ],
      },
      {
        heading: 'Midjourney Prompt Structure',
        content: [
          'Midjourney responds best to descriptive, sensory language:',
          'Core Structure: "[SUBJECT] in [STYLE/MEDIUM], [MOOD], [LIGHTING], [COMPOSITION], [CAMERA] --ar [ASPECT RATIO]"',
          'Example: "A minimalist product photography shot of a luxury coffee mug, white ceramic with subtle texture, shot from 45 degrees, soft natural window lighting, isolated on a clean white surface, shallow depth of field, shot on Hasselblad, photorealistic, warm and inviting mood --ar 1:1"',
          'Critical Elements for Better Results:',
          'Medium/Style: Photography (and camera type), painting, illustration, 3D render, etc. Be specific: "oil painting" vs. "watercolor" produce very different results.',
          'Lighting: Natural light, studio lighting, backlit, shadows, golden hour, neon, etc. Lighting transforms the mood completely.',
          'Composition: Wide shot, close-up, overhead, 45-degree angle, looking up, symmetrical, asymmetrical, leading lines, etc.',
          'Mood Descriptors: Cinematic, ethereal, moody, bright and airy, dark and dramatic, cozy, minimalist, chaotic, serene, etc.',
          'Quality Modifiers: Photorealistic, highly detailed, clean, sharp focus, soft focus, high resolution, Unreal Engine, rendered, etc.',
          'Advanced Tip: Reference artists or photographers in your prompt: "in the style of Unsplash photography" or "inspired by Wes Anderson color grading." This anchors the style direction.',
        ],
      },
      {
        heading: 'DALL-E 3 and Image Generation Tips',
        content: [
          'DALL-E 3 is better at interpreting natural language than earlier image models. Your prompts can be more conversational:',
          'Good DALL-E Approach: "Create a warm, inviting illustration of a cozy reading nook with a person sitting in a chair by a window. Afternoon sunlight streams through the window. There\'s a stack of books on a small table, a coffee cup, and plants on the windowsill. Use a soft color palette of blues, greens, and warm yellows. The illustration style should be modern and slightly whimsical, like contemporary children\'s book illustration."',
          'Pro Tips for DALL-E:',
          'Use Descriptive Language: DALL-E 3 understands concepts better. Say "cozy" instead of just describing the room. Say "hopeful mood" instead of trying to fake that with visual elements.',
          'Specify What NOT to Include: DALL-E responds well to exclusions. "A modern home office without any books" or "a landscape without people" is clearer than trying to describe only what you want.',
          'Reference Quality/Style: Mention artistic influence or quality level. "In the style of Studio Ghibli," "rendered like a AAA video game," or "photographed by Annie Leibovitz" guides the output.',
          'Iterate with Variations: Get the first result, then ask for variations: "Same composition but with a sunset lighting" or "Same design but in a minimalist black-and-white version."',
        ],
      },
      {
        heading: 'Brand Consistency in AI-Generated Design',
        content: [
          'One challenge: ensuring AI-generated designs match your brand guidelines. Here\'s how to maintain consistency:',
          'Create a Brand Prompt Template: Write a standardized brand description you prepend to every design prompt. Example: "Our brand is modern, minimal, and professional. We use a color palette of navy blue (#001A4D), white (#FFFFFF), and accent gold (#D4AF37). Typography is sans-serif, clean and geometric. We emphasize negative space. All designs should feel premium and trustworthy, never trendy or casual."',
          'Reference Your Own Assets: "Design in the same style as [reference image from your brand]" or "match the aesthetic of our existing website." You can upload reference images to Midjourney and DALL-E for style guidance.',
          'Develop a Style Lexicon: Create a list of descriptors that consistently represent your brand (e.g., "minimalist," "geometric," "premium," "playful") and use them in every prompt.',
          'Test and Document: Save outputs that match your brand guidelines. Over time, you\'ll learn which prompt language produces results you can use. Document successful prompts as templates.',
        ],
      },
      {
        heading: 'Iterating on Visual Prompts',
        content: [
          'The first output is rarely perfect. Great designers use AI iteration strategically:',
          'Iteration Strategy:',
          'Round 1 - Direction Setting: Start broad to explore the concept space. Try 2-3 very different style approaches.',
          'Round 2 - Refinement: Pick the direction that\'s closest. Now refine specific elements. "Change the lighting to be more dramatic" or "Make it more minimal by removing the background clutter."',
          'Round 3 - Detailed Tuning: Refine color, composition, or specific elements. "Shift the color temperature to be cooler/warmer" or "Move the subject to the left side of the frame."',
          'Round 4 - Final Polish: Make small tweaks to get it publication-ready. "Increase contrast" or "Add more depth to make it pop."',
          'Pro Workflow: Use Midjourney upscales and variations strategically. When you get something good, use the "V" (variation) button to get similar versions, then use "U" (upscale) on your final choice. This is faster than constantly writing new prompts.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-score-framework',
    title: 'The PROMPT Score Framework Explained',
    description: 'Deep dive into the PROMPT Score framework that powers ScoreMyPrompt. Learn exactly how each dimension is scored and how to improve.',
    readingTime: 12,
    difficulty: 'Intermediate',
    relatedSlugs: ['how-to-write-better-ai-prompts', 'prompt-engineering-for-beginners', 'chatgpt-prompt-tips'],
    relevantDimensions: ['precision', 'role', 'outputFormat', 'missionContext', 'promptStructure', 'tailoring'],
    sections: [
      {
        heading: 'What is PROMPT Score?',
        content: [
          'PROMPT Score is a systematic framework for evaluating the quality of AI prompts across six critical dimensions. It\'s a 0-100 scoring system where higher scores indicate more effective, well-structured prompts that will generate better AI outputs.',
          'Each of the six dimensions—Precision, Role, Output Format, Mission Context, Structure, and Tailoring—addresses a specific aspect of prompt quality. No single dimension is more important than the others; they work together. A prompt weak in one dimension produces weaker outputs overall.',
          'The framework was developed by studying thousands of successful AI interactions and identifying the common patterns in high-performing prompts. It\'s not arbitrary or theoretical. It\'s based on what actually works when people interact with AI models.',
          'Your PROMPT Score tells you exactly where to improve. A score of 75 might mean you\'re strong in Role and Output Format but weak in Precision and Mission Context. This specific feedback lets you iteratively improve.',
        ],
      },
      {
        heading: 'Precision (P): Be Specific and Detailed',
        content: [
          'Precision measures how specific and detailed your prompt is. Vague prompts are the #1 killer of output quality.',
          'Precision Scoring Rubric:',
          'Score 0-25: Extremely vague. "Write content," "Give me ideas," "Analyze this." No specificity about what you want.',
          'Score 26-50: Some specificity. "Write a blog post about marketing" or "Create a sales email." Lacks concrete details or constraints.',
          'Score 51-75: Decent specificity. Topic is clear, length is specified, audience is mentioned. Missing some details like specific data points, exact constraints, or concrete examples.',
          'Score 76-100: Highly precise. Includes specific numbers, concrete examples, exact constraints, naming relevant details, and clear scope boundaries.',
          'How to Improve Precision:',
          '• Replace vague words with specifics: "Soon" → "within 90 days" | "Good" → "increases click-through rate by 15%"',
          '• Add numbers: Word counts, timeframes, quantities, percentages, target metrics.',
          '• Provide concrete examples: "Similar to [specific example]" or "In the style of [reference]."',
          '• Define constraints: Maximum length, specific format, what NOT to include, technical requirements.',
          '• Name the stakeholder: Not just "for an audience" but "for a CFO at a Series B SaaS company."',
          'Example: BEFORE (Precision: 35/100) "Write a marketing email." AFTER (Precision: 88/100) "Write a 75-word cold outreach email targeting IT managers at mid-market financial services companies (500-2000 employees). Goal: get them to reply to schedule a 20-minute discovery call. Highlight our single biggest differentiator: compliance automation that saves 40+ hours per month. Tone: professional but personable. Use a specific industry pain point (regulatory compliance complexity) as the hook. Include one specific social proof metric."',
        ],
      },
      {
        heading: 'Role (R): Define Perspective and Expertise',
        content: [
          'Role scoring measures whether you\'ve clearly assigned a perspective or expertise lens for the AI to adopt. This shapes how the AI approaches your request.',
          'Role Scoring Rubric:',
          'Score 0-25: No role assigned. The AI defaults to generic "helpful assistant" mode.',
          'Score 26-50: Weak or generic role. "Expert," "professional," or "experienced person" without specificity.',
          'Score 51-75: Clear role but could be more specific. "Marketing expert," "product manager," or "consultant" without industry or context specialization.',
          'Score 76-100: Highly specific role with relevant qualifications or context. "Senior growth marketing director at a Series B SaaS startup" or "UX researcher specializing in B2B SaaS onboarding."',
          'How to Improve Role:',
          '• Always start with "Act as," "You are," or "Assume you\'re a…"',
          '• Go beyond job title. Add seniority level: "Junior" vs. "Senior" vs. "Director-level"',
          '• Add specialization or context: "Growth marketer specializing in B2B," "Product designer focused on accessibility," "CFO at a venture-backed fintech"',
          '• For creative work, reference style icons: "in the manner of a copywriter who writes like David Ogilvy" or "with the creative sensibility of an award-winning creative director."',
          '• Consider perspective variation: A "skeptical investor," a "customer advocate," and a "product manager" all approach the same request differently.',
          'Example: BEFORE (Role: 40/100) "Write some copy." AFTER (Role: 92/100) "You are an award-winning B2B SaaS copywriter who specializes in high-converting landing pages for technical products. You\'ve helped 50+ startups raise capital. You write in a crisp, direct style that appeals to technical founders and CTOs. You understand the tension between technical accuracy and marketing appeal. Now write…"',
        ],
      },
      {
        heading: 'Output Format (O): Specify Structure and Delivery',
        content: [
          'Output Format measures how explicitly you\'ve specified how you want information delivered. This affects usability of the response.',
          'Output Format Scoring Rubric:',
          'Score 0-25: No format specified. Just "give me info" or "write something." AI guesses what format you want.',
          'Score 26-50: Generic format. "Bullet points," "short," or "detailed" without specificity about structure.',
          'Score 51-75: Clear format with some structure. "Bulleted list," "three sections," or "JSON object" specified. Missing granular details.',
          'Score 76-100: Highly specific format with detailed structure. Includes exact template, field names, subsection requirements, exact separators, or sample output.',
          'How to Improve Output Format:',
          '• Specify the container: Bullet list, numbered list, paragraph, table, code, JSON, markdown, outline, etc.',
          '• Define subsections: "Include three main sections: Overview, Benefits, and Implementation."',
          '• Set expectations for granularity: "Each item should be 2-3 sentences" or "Each bullet point max 15 words."',
          '• Provide a template: "Use this format: [Label]: [Value] (units)"',
          '• Specify exact structure: "First, an executive summary (2 paragraphs), then five main sections with subheadings, then a conclusion."',
          '• For technical output: "Return as valid JSON with these fields: title, description, difficulty, prerequisites."',
          'Example: BEFORE (Format: 35/100) "List some ideas." AFTER (Format: 91/100) "Provide exactly 5 content ideas as a numbered list. For each idea, include: (1) Headline (max 12 words), (2) Content type (blog post/video/infographic/tweet), (3) Why it works (1 sentence), (4) Engagement hooks (2 bullet points about what makes it shareable), and (5) Estimated reach impact (High/Medium/Low). Use this exact format for consistency."',
        ],
      },
      {
        heading: 'Mission Context (M): Explain Why and How You\'ll Use It',
        content: [
          'Mission Context measures whether you\'ve explained the "why" behind your request and how you\'ll use the output. This helps AI calibrate tone, depth, and relevance.',
          'Mission Context Scoring Rubric:',
          'Score 0-25: No context provided. AI doesn\'t know why you need this or what you\'ll do with it.',
          'Score 26-50: Vague context. "For my business" or "To improve my marketing." Missing specifics about use case.',
          'Score 51-75: Clear context but incomplete. "For a landing page targeting SMBs" or "For a pitch to investors." Missing constraints or priority.',
          'Score 76-100: Rich, specific context. Explains audience, decision-maker, timeline, success metrics, what you\'ll do with the output, and competitive context.',
          'How to Improve Mission Context:',
          '• Always include "I\'m…" or "I need this to…" statement',
          '• Be specific about the decision or action: "This is to pitch to Series A investors," not just "for my company."',
          '• Explain the audience who will see/use this: "Internal team," "external client," "general public."',
          '• Include timeline: "For launch in 30 days," "for this week\'s board meeting."',
          '• Mention success metrics: "Goal is a 5% conversion rate," "We want 20% engagement."',
          '• Reference competitive context: "Compared to [competitor]" or "Better than our previous [metric]."',
          '• Explain constraints: "Legal team needs to approve," "Must fit a 30-second video," "Budget is limited."',
          'Example: BEFORE (Context: 30/100) "I need a marketing strategy." AFTER (Context: 87/100) "I\'m launching a new B2B SaaS product in 90 days. Target customer: marketing agencies with 10-50 employees doing $500K-2M annual revenue. This strategy will guide our CEO\'s investor pitch, inform our first 90 days of execution, and set priorities for where we spend our marketing budget. Success metric: 50 qualified demos booked in the first quarter. I need this because investors want to see a clear GTM strategy. Competitive context: we\'re positioned between [cheaper tool] and [enterprise platform]."',
        ],
      },
      {
        heading: 'Structure (S): Organize Your Request Logically',
        content: [
          'Structure measures how well you\'ve organized your request into logical, sequential steps. This helps AI think systematically.',
          'Structure Scoring Rubric:',
          'Score 0-25: Disorganized. Multiple unrelated requests jumbled together. Hard to follow the logic.',
          'Score 26-50: Somewhat organized. Request has multiple parts but transitions aren\'t clear. Some redundancy.',
          'Score 51-75: Well-organized. Clear progression of ideas. Multiple related requests logically grouped. Minor redundancy.',
          'Score 76-100: Excellently structured. Request follows clear logic. Each step builds on the previous. No redundancy. Easy to follow.',
          'How to Improve Structure:',
          '• Put first things first: Context and role at the beginning, specific request after.',
          '• Use numbered steps for multi-part requests: "First, analyze… Then, recommend… Finally, create…"',
          '• Group related items: If you have 10 requests, organize them into 3 logical buckets.',
          '• Use clear transitions: "Now that you understand the context, please…"',
          '• Save constraints for last: Role and context first, then the main request, then the detailed constraints.',
          '• Avoid repetition: Don\'t repeat the same instruction in different words.',
          '• Use formatting: Line breaks, numbering, or bullet points make structure visible.',
          'Example: BEFORE (Structure: 45/100) "Write an email. Make it friendly. Include benefits. Keep it short. Make it professional. And don\'t make it too long. Actually include a CTA. And maybe make the tone warm." AFTER (Structure: 89/100) "Write a cold outreach email with this structure: (1) Personalized opening that shows research, (2) One specific benefit relevant to their industry, (3) Credibility statement (social proof or relevant client example), (4) Clear ask (single CTA), (5) Professional close. Requirements: 75-100 words total, warm but professional tone, no corporate jargon."',
        ],
      },
      {
        heading: 'Tailoring (T): Customize for Your Specific Needs',
        content: [
          'Tailoring measures how much you\'ve customized the request for your specific situation, audience, and constraints. It\'s the difference between a generic prompt and one precisely tailored to you.',
          'Tailoring Scoring Rubric:',
          'Score 0-25: Generic. Could apply to almost anyone. No customization for your specific situation.',
          'Score 26-50: Some customization. References your industry or audience but lacks depth.',
          'Score 51-75: Well-tailored. Specific to your industry, company stage, customer type, and audience. Missing some details.',
          'Score 76-100: Highly tailored. Specific to your exact situation, constraints, brand voice, audience sophistication level, technical requirements, and success definition.',
          'How to Improve Tailoring:',
          '• Name your industry: Not "for a business" but "for a venture-backed B2B SaaS startup."',
          '• Specify your customer: Not "for customers" but "for CTOs at mid-market manufacturing companies."',
          '• Include your brand voice: "In our brand voice, which is conversational and data-driven, not corporate."',
          '• Reference your constraints: Budget, technical limitations, legal requirements, brand guidelines.',
          '• Specify expertise level: "For a non-technical founder," "for an experienced engineer," "for a general audience."',
          '• Define your competitive position: "We\'re the premium option, so the tone should reflect premium positioning."',
          '• Include specific metrics or definitions: "By \'success,\' we mean…" or "We define \'high engagement\' as…"',
          'Example: BEFORE (Tailoring: 35/100) "Write about our product." AFTER (Tailoring: 90/100) "Write a 500-word blog post about our AI-powered expense management platform. Our audience: finance professionals at 50-500 person SaaS companies (not enterprise, not solopreneurs). They\'re already convinced they need expense automation; they\'re deciding between options. Our unique angle: we integrate with 150+ accounting systems and have 94% accuracy on receipt categorization (industry average is 87%). Brand voice: professional, precise, never hype-y, occasionally a bit dry. Goal: 15%+ conversion to scheduling a demo. Tone: appeal to their desire to reduce manual work while reassuring them about accuracy and integration. Avoid: technical jargon, over-promising, customer testimonials."',
        ],
      },
      {
        heading: 'How Grading Works: Scoring Each Dimension',
        content: [
          'Your PROMPT Score is calculated by evaluating each of the six dimensions and assigning a score from 0-100 for each. The overall score is a weighted average:',
          '• Precision (20% weight): Specificity, detail, constraints, and concreteness',
          '• Role (15% weight): How well you\'ve assigned a perspective and expertise',
          '• Output Format (20% weight): Clarity of how you want information delivered',
          '• Mission Context (15% weight): Why you need this and how you\'ll use it',
          '• Structure (15% weight): Logical organization and flow',
          '• Tailoring (15% weight): Customization to your specific situation',
          'Each dimension is scored independently. A prompt might score 90 in Output Format (you were very clear about what format you wanted) but 45 in Mission Context (you didn\'t explain why you need it). The overall PROMPT Score reflects the health of all six dimensions.',
          'Scoring Thresholds:',
          '• 0-30: Weak. Your prompt lacks clarity in multiple dimensions. Expected output quality: Poor.',
          '• 31-50: Below Average. Some dimensions are solid, but others need work. Expected output quality: Below average.',
          '• 51-70: Average. Most dimensions are adequate, but there\'s room to improve. Expected output quality: Acceptable but improvable.',
          '• 71-85: Good. Most dimensions score well. Your prompts should produce solid results. Expected output quality: Good.',
          '• 86-100: Excellent. Your prompt is well-crafted across all dimensions. Expected output quality: Excellent.',
        ],
      },
      {
        heading: 'Improving Your Score: Dimension by Dimension',
        content: [
          'If your overall score is below 75, here\'s a strategic approach to improvement:',
          'Step 1 - Identify Your Weakest Dimension: Which dimension scored lowest? Start there. A prompt weak in one dimension can drag down the entire score.',
          'Step 2 - Apply Targeted Improvements: Use the "How to Improve" sections above for your weakest dimensions. Make one improvement at a time, then rescore.',
          'Step 3 - Work Systematically: Don\'t try to improve everything at once. Fix the lowest-scoring dimension, rescore, then move to the next weakness.',
          'Step 4 - Recognize Tradeoffs: Sometimes being more specific (Precision) requires more length. That\'s fine. The goal is all dimensions at 70+, not all at 100.',
          'Step 5 - Create Templates: Once you nail a prompt structure, save it as a template. Reuse it for similar requests with slight modifications.',
          'Step 6 - Track Progress: Score your prompts regularly. Over time, you should see your overall score trending upward as you develop the skill.',
          'Real Results: Studies show that prompts scoring 75+ consistently produce noticeably better outputs than prompts scoring below 50. The difference is real and measurable. Invest in improving your score.',
        ],
      },
    ],
  },
  {
    slug: 'harness-101',
    title: 'Harness Engineering 101: Why AI Setup Matters More Than Your Prompt',
    description: 'Learn why 95% of AI output quality comes from the setup (harness), not the prompt. A non-developer guide to CLAUDE.md, sub-agents, and the HARNES framework.',
    readingTime: 6,
    difficulty: 'Beginner',
    relatedSlugs: ['claude-md-template', 'sub-agents-explained', 'prompt-vs-harness'],
    sections: [
      {
        heading: 'The 95/5 Rule of AI Output Quality',
        content: [
          'Most people believe a great AI result is about writing a clever prompt. The research shows the opposite: the same model produces results ranging from mediocre to expert-level based almost entirely on the context and rules it runs inside. That context is the harness.',
          'A harness is the set of files, folders, rules, and tools your AI assistant has access to. A bare prompt gives the AI nothing but your words. A harness gives it brand guidelines, sub-agent roles, external data connections, and a standard operating procedure.',
          'Teams that invest in a harness report 4–10x output quality on the same tasks, with the same AI model, versus teams that rely on raw prompting.',
        ],
      },
      {
        heading: 'The HARNES Framework (6 Dimensions)',
        content: [
          'HARNES is an evaluation framework we built at ScoreMyPrompt to measure the quality of an AI agent setup. Six dimensions, 100 points total.',
          'H — Hierarchy: folder structure separating context, agents, templates. 15 points.',
          'A — Agents: sub-agents with distinct roles instead of one monolithic prompt. 20 points.',
          'R — Routing: explicit "if X, then call Y" rules between agents or tools. 15 points.',
          'N — Norms: brand voice, tone, and style guidelines loaded from context files. 15 points.',
          'E — Extensions: external MCPs / APIs / tools connected to the agent. 15 points.',
          'S — SafeOps: standard operating procedures, permissions, failure loops. 20 points.',
        ],
      },
      {
        heading: "What Elite Setups Have That Bare Prompts Don't",
        content: [
          'A production-ready harness (85+ HARNES score) ships with: at least two sub-agent files, a CLAUDE.md with three conditional routing rules, a brand_guidelines.md with tone examples, at least one external tool connection (e.g., web search), and a documented SafeOps section covering permissions and failure retry.',
          "You don't have to build all of this by hand. ScoreMyPrompt's Harness Builder generates a production-ready setup in 2 minutes based on five wizard questions.",
        ],
      },
      {
        heading: 'Where to Go Next',
        content: [
          'Score your existing setup to see where you are today: paste your CLAUDE.md into our free Harness Score tool.',
          "If you're starting from scratch, run the Harness Builder wizard — it outputs a ZIP you can unzip into any project and open with Claude Code.",
        ],
      },
    ],
  },
  {
    slug: 'claude-md-template',
    title: 'The Anatomy of a Great CLAUDE.md File (With Template)',
    description: 'A clear, non-technical walkthrough of what belongs in your CLAUDE.md — the main file that directs your AI agent team. Includes a downloadable template.',
    readingTime: 7,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'sub-agents-explained', 'mcp-beginners'],
    sections: [
      {
        heading: 'What CLAUDE.md Does',
        content: [
          'CLAUDE.md is the operating system for a Claude Code project. When you open a folder containing CLAUDE.md in VS Code, Claude Code reads the file first and uses it as the master rulebook for every action it takes inside that folder.',
          "The file is plain Markdown. No code. No programming. It's closer to a well-organized employee handbook than to a config file.",
        ],
      },
      {
        heading: 'The 4 Required Sections',
        content: [
          '1. Project Overview — one paragraph explaining what this folder does, for whom, at what cadence.',
          '2. Folder Map — a bullet list of the sub-folders (/context, /agents, /templates, /data) and what each holds.',
          '3. Routing Rules — at least two "if X, then call Y" rules that describe how sub-agents hand off work.',
          '4. Work Rules — constants the AI should always obey: tone requirements, approval checkpoints, brand guardrails.',
        ],
      },
      {
        heading: 'A Working Template',
        content: [
          'Below is a minimal but production-grade CLAUDE.md you can copy as a starting point.',
          '# [Project Name]\n\n## Project Overview\n[One paragraph: what, for whom, cadence]\n\n## Folder Map\n- /context — brand & business context\n- /agents — sub-agents (research, content, review)\n- /templates — standard output formats\n- /data — CSV inputs\n\n## Routing Rules\n1. If user asks for [X], call research_agent first.\n2. If research returns < 3 sources, loop before content_agent.\n\n## Work Rules\n- All outputs must match /context/brand_guidelines.md tone.\n- Semi-auto mode: confirm before publishing.',
        ],
      },
      {
        heading: 'Generate Yours in 2 Minutes',
        content: [
          'If writing CLAUDE.md from scratch feels intimidating, use the Harness Builder. Answer five questions and you get a complete CLAUDE.md plus sub-agent files as a ZIP.',
        ],
      },
    ],
  },
  {
    slug: 'sub-agents-explained',
    title: 'Sub-Agents vs One Big Prompt: Why Division of Labor Beats a Genius Assistant',
    description: 'Why splitting your AI instructions into specialized sub-agents (researcher, writer, reviewer) beats asking one mega-prompt to do everything.',
    readingTime: 5,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'claude-md-template'],
    sections: [
      {
        heading: 'The Mega-Prompt Failure Mode',
        content: [
          'New users write one giant prompt: "You are a marketing expert that does research, writes content, checks facts, optimizes for SEO, and formats for Instagram." The result is mediocre at everything.',
          'The reason is simple: large-language models, like humans, lose focus when juggling too many roles in a single context window. Quality drops on the last 3 tasks while the AI satisfies the first 2.',
        ],
      },
      {
        heading: 'The Sub-Agent Pattern',
        content: [
          'Split the work. Each sub-agent is a separate Markdown file describing one role: research_agent.md, content_agent.md, review_agent.md. Each has its own tools, its own output format, its own success criteria.',
          'The main CLAUDE.md orchestrates: "If the user asks for a weekly newsletter, first call research_agent, then hand its output to content_agent, then hand that to review_agent for fact-check and brand compliance."',
          'Each agent runs with a small, focused context — and produces better output than the mega-prompt.',
        ],
      },
      {
        heading: 'Minimum Viable Split for Non-Developers',
        content: [
          "You don't need five agents. Start with three: a researcher (gathers sources), a writer (drafts output), a reviewer (fact-checks and brand-checks).",
          'The Harness Builder wizard creates these three files automatically from your answers. Each file is about 30 lines.',
        ],
      },
      {
        heading: "Common Objection: Isn't This More Work?",
        content: [
          "Upfront, yes — about 10 extra minutes on the first setup. Ongoing, it's far less work: when output quality drops, you tune one agent file instead of rewriting a mega-prompt and losing everything that worked.",
        ],
      },
    ],
  },
  {
    slug: 'mcp-beginners',
    title: 'MCP for Non-Developers: What It Is and Why It Makes Your AI 10x More Useful',
    description: "MCP (Model Context Protocol) is how AI talks to external tools. Here's what it is without the jargon, and which ones are worth connecting first.",
    readingTime: 5,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'claude-md-template'],
    sections: [
      {
        heading: 'What Is MCP, Really',
        content: [
          'MCP (Model Context Protocol) is a standard way for AI assistants to talk to external tools. Think of it as the USB-C port for AI: plug in web search, Google Sheets, Notion, Slack, and the AI can read from and write to each of them.',
          "Without MCP, the AI knows only what's in its training data and the current conversation. With MCP, it can look up live information, update a spreadsheet, or post to a channel.",
        ],
      },
      {
        heading: 'Which MCPs to Connect First',
        content: [
          'Web search: the single highest-leverage connection. The AI can now cite current sources instead of hallucinating. Most teams start here.',
          'Google Sheets: turn the AI into a junior analyst that updates your pipeline or content calendar.',
          'Notion: let the AI save research drafts directly into your workspace.',
          'Slack: deliver weekly reports or morning briefings where your team already reads.',
        ],
      },
      {
        heading: 'How Connections Happen (Non-Technical)',
        content: [
          "You don't install MCPs like apps from an app store. You list them in CLAUDE.md's Extensions section, add the tool's API key to a .env file (a plain text file the AI reads but never shares), and Claude Code handles the rest.",
          "The Harness Builder wizard includes a checkbox for each MCP you want. It writes the Extensions section and the .env.example for you.",
        ],
      },
      {
        heading: 'Safety Considerations',
        content: [
          'Never commit .env files to a public folder. Use .env.example with placeholders for sharing. Keep production API keys in Vercel or your password manager, not in the project folder.',
        ],
      },
    ],
  },
  {
    slug: 'prompt-vs-harness',
    title: 'Prompt Score vs Harness Score: Which One Should You Focus On?',
    description: "Two complementary scores for AI practitioners. Here's when a better prompt is the answer, when a better harness is the answer, and how they multiply together.",
    readingTime: 4,
    difficulty: 'Beginner',
    relatedSlugs: ['harness-101', 'how-to-write-better-ai-prompts'],
    sections: [
      {
        heading: 'The Short Answer',
        content: [
          'Prompt Score measures how well you phrase a single request. Harness Score measures the environment your AI is running in. You need both.',
          'Improvement in prompt alone has a ceiling. Improvement in harness removes the ceiling entirely, because it turns a single-shot AI into an accountable agent team.',
        ],
      },
      {
        heading: 'When to Prioritize Prompt',
        content: [
          "You're using ChatGPT or Claude's consumer web app for ad-hoc tasks. The chat window is the entire experience. Here, a well-structured prompt (Precision, Role, Output Format, Mission Context, Structure, Tailoring — our PROMPT framework) is 80% of the outcome.",
          'There is no folder, no persistent files. Harness is not the leverage point.',
        ],
      },
      {
        heading: 'When to Prioritize Harness',
        content: [
          "You're using Claude Code or running recurring AI workflows — weekly reports, content pipelines, research automation. Here, harness is where you spend effort.",
          'A single Elite (85+) harness produces better output than 100 tuned one-shot prompts over a quarter — because the harness compounds. Each improvement to CLAUDE.md or a sub-agent file improves every future run.',
        ],
      },
      {
        heading: 'How They Multiply',
        content: [
          'Great harness + bare prompt = good output. Great prompt + no harness = good output. Great harness + great prompt = exceptional output and it scales across your team.',
          'Score both. Score your prompts with the PROMPT framework, score your setup with the HARNES framework, and ladder both up over time.',
        ],
      },
    ],
  },
];
