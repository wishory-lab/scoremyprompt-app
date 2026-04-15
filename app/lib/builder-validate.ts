/**
 * Structural validation of the file map returned by the Builder LLM.
 * Returns { ok: true } or { ok: false, reason } — no thrown errors.
 */
import type { BuilderFileMap } from '@/app/types/builder';

const MIN_FILE_LEN = 50;

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export function validateBuilderFiles(files: BuilderFileMap): ValidationResult {
  // 1. CLAUDE.md exists
  const claudeMd = files['CLAUDE.md'];
  if (!claudeMd) return { ok: false, reason: 'CLAUDE.md is missing' };

  // 2. CLAUDE.md has Routing Rules section
  if (!/##\s*Routing Rules/i.test(claudeMd)) {
    return { ok: false, reason: "CLAUDE.md missing 'Routing Rules' section" };
  }

  // 3. At least 2 sub-agent files
  const agentFiles = Object.keys(files).filter((k) => k.startsWith('/agents/'));
  if (agentFiles.length < 2) {
    return { ok: false, reason: `Need at least 2 sub-agent files, found ${agentFiles.length}` };
  }

  // 4. No empty/placeholder files
  for (const [path, content] of Object.entries(files)) {
    if (typeof content !== 'string' || content.length < MIN_FILE_LEN) {
      return { ok: false, reason: `${path} is too short (under ${MIN_FILE_LEN} chars)` };
    }
  }

  return { ok: true };
}
