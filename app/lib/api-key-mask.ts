/**
 * Detects and masks common API key patterns so builder input/output
 * never stores real credentials. Conservative: false negatives OK,
 * false positives cost nothing (we redact and warn).
 */
const PATTERNS: RegExp[] = [
  // Anthropic
  /sk-ant-[a-zA-Z0-9-]{20,}/g,
  // OpenAI
  /sk-(proj-|svcacct-)?[a-zA-Z0-9]{20,}/g,
  // Supabase/JWT: three Base64URL segments separated by dots, at least 30 chars total
  /eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]{10,}/g,
  // GitHub fine-grained PAT
  /github_pat_[A-Za-z0-9_]{20,}/g,
  // GitHub classic token
  /gh[pousr]_[A-Za-z0-9_]{30,}/g,
  // AWS access key
  /AKIA[0-9A-Z]{16}/g,
  // Slack bot/user tokens
  /xox[baprs]-[A-Za-z0-9-]{10,}/g,
];

const PLACEHOLDER_ALLOWLIST = [
  'sk-your-key-here',
  'sk-proj-your-key',
  'your-api-key',
  'sk-ant-your-key',
];

function isPlaceholder(match: string): boolean {
  return PLACEHOLDER_ALLOWLIST.some((p) => match.toLowerCase().includes(p));
}

export function detectApiKeys(input: string): boolean {
  for (const re of PATTERNS) {
    re.lastIndex = 0;
    const m = input.match(re);
    if (!m) continue;
    if (m.some((hit) => !isPlaceholder(hit))) return true;
  }
  return false;
}

export function maskApiKeys(input: string): string {
  let out = input;
  for (const re of PATTERNS) {
    out = out.replace(new RegExp(re.source, re.flags), (match) => {
      return isPlaceholder(match) ? match : '[REDACTED_KEY]';
    });
  }
  return out;
}
