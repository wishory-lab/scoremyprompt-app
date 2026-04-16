/**
 * One-shot script: read the new `harness` + `homeEntry` blocks from en.ts
 * and inject translated versions into each locale file.
 *
 * Usage: ANTHROPIC_API_KEY=sk-... npx tsx scripts/translate-harness-keys.ts
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.cwd(), 'app/i18n/locales');
const TARGETS: Array<{ code: string; name: string; tonePrompt: string }> = [
  { code: 'ko', name: 'Korean', tonePrompt: 'Professional but friendly Korean (존댓말).' },
  { code: 'ja', name: 'Japanese', tonePrompt: 'Polite business Japanese (です・ます).' },
  { code: 'zh-CN', name: 'Simplified Chinese', tonePrompt: 'Professional mainland Chinese.' },
  { code: 'zh-TW', name: 'Traditional Chinese', tonePrompt: 'Professional Taiwanese Chinese.' },
  { code: 'es', name: 'Spanish', tonePrompt: 'Neutral Latin American Spanish.' },
  { code: 'fr', name: 'French', tonePrompt: 'Professional French (vouvoiement).' },
  { code: 'de', name: 'German', tonePrompt: 'Professional German (Sie-form).' },
  { code: 'pt', name: 'Portuguese', tonePrompt: 'Brazilian Portuguese, professional tone.' },
  { code: 'hi', name: 'Hindi', tonePrompt: 'Professional Hindi, neutral tone.' },
];

async function translate(blockJson: string, langName: string, tone: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is required.');
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 4000,
      system: `You translate a JSON object of UI strings from English to ${langName}. Preserve keys and structure exactly. Tone: ${tone}. Keep brand names (HARNES, ScoreMyPrompt, Pro, CLAUDE.md) in English. Return ONLY the translated JSON, no prose, no markdown.`,
      messages: [{ role: 'user', content: blockJson }],
    }),
  });
  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const j = (await res.json()) as { content?: { text?: string }[] };
  const txt = (j.content?.[0]?.text ?? '').replace(/^```json\s*|```\s*$/g, '').trim();
  JSON.parse(txt); // validate
  return txt;
}

function extractBlock(enSource: string, namespace: string): string {
  const marker = new RegExp(`^\\s{2}${namespace}:\\s*\\{`, 'm');
  const m = marker.exec(enSource);
  if (!m) throw new Error(`Namespace ${namespace} not found`);
  let i = m.index + m[0].length;
  let depth = 1;
  while (i < enSource.length && depth > 0) {
    const c = enSource[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    i++;
  }
  return enSource.slice(m.index, i + 1).replace(/,\s*$/, '');
}

function jsToJson(block: string): string {
  return block
    .replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*):/g, '$1"$2":')
    .replace(/'([^']*)'/g, '"$1"')
    .replace(/,\s*([}\]])/g, '$1')
    .replace(/^\s*"[A-Za-z_][A-Za-z0-9_]*"\s*:\s*/, '');
}

async function main() {
  const enPath = path.join(ROOT, 'en.ts');
  const enSource = fs.readFileSync(enPath, 'utf8');
  // Extract all three namespaces (Sprint 1: harness + homeEntry, Sprint 2: builder)
  const namespaces = ['harness', 'homeEntry', 'builder'] as const;
  const blocks: Record<string, string> = {};
  for (const ns of namespaces) {
    try {
      blocks[ns] = jsToJson(extractBlock(enSource, ns));
    } catch {
      console.warn(`Namespace "${ns}" not found in en.ts — skipping.`);
    }
  }

  for (const t of TARGETS) {
    console.log(`Translating → ${t.code} (${t.name})`);
    const translated: Record<string, string> = {};
    for (const ns of namespaces) {
      if (!blocks[ns]) continue;
      translated[ns] = await translate(blocks[ns], t.name, t.tonePrompt);
    }
    const targetPath = path.join(ROOT, `${t.code}.ts`);
    let target = fs.readFileSync(targetPath, 'utf8');

    // Remove any prior blocks (idempotency)
    for (const ns of namespaces) {
      target = target.replace(new RegExp(`^\\s{2}${ns}:\\s*\\{[\\s\\S]*?\\},\\n`, 'm'), '');
    }

    // Insert before final closing `}` of the locale object
    const objEnd = target.search(/\n\};?\s*\n\s*export default/);
    if (objEnd === -1) {
      throw new Error(`Could not locate object end in ${t.code}.ts`);
    }
    const before = target.slice(0, objEnd);
    const after = target.slice(objEnd);
    const lines = namespaces
      .filter((ns) => translated[ns])
      .map((ns) => `  ${ns}: ${translated[ns]},`)
      .join('\n');
    target = before + '\n' + lines + after;
    fs.writeFileSync(targetPath, target, 'utf8');
    console.log(`  wrote ${targetPath}`);
  }
  console.log('All locales updated.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
