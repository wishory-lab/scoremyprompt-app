/* eslint-disable no-console */
/**
 * Validate AQ question bank invariants.
 * Run: `npx tsx app/aq/__validate-questions.ts`
 *
 * Invariants:
 *   1. ID uniqueness across all questions
 *   2. Each question has exactly 4 options
 *   3. correctIndex is in range [0, options.length)
 *   4. options[correctIndex].score === points (top score = full points)
 *   5. all option scores in [0, points]
 *   6. domain ∈ {'tool','ethics','concept'}  (prompt domain handled separately by SMP engine)
 *   7. difficulty distribution per domain is reasonable (not all same level)
 */

import { ALL_AQ_QUESTIONS, TOOL_QUESTIONS, ETHICS_QUESTIONS, CONCEPT_QUESTIONS } from './questions';

const ALL_QUESTIONS = ALL_AQ_QUESTIONS;

let pass = 0;
let fail = 0;
const failures: string[] = [];

function check(name: string, ok: boolean, detail = '') {
  if (ok) {
    pass++;
  } else {
    fail++;
    failures.push(`${name} — ${detail}`);
    console.log(`  ✗ ${name} — ${detail}`);
  }
}

console.log(`Total questions: ${ALL_QUESTIONS.length}`);
console.log(`  Tool:    ${TOOL_QUESTIONS.length}`);
console.log(`  Ethics:  ${ETHICS_QUESTIONS.length}`);
console.log(`  Concept: ${CONCEPT_QUESTIONS.length}`);
console.log();

// 1. ID uniqueness
const ids = new Set<string>();
for (const q of ALL_QUESTIONS) {
  check(`unique id: ${q.id}`, !ids.has(q.id), `duplicate ${q.id}`);
  ids.add(q.id);
}

// 2-5. per-question invariants
for (const q of ALL_QUESTIONS) {
  const opts = q.options || [];
  check(`[${q.id}] 4 options`, opts.length === 4, `got ${opts.length}`);
  check(
    `[${q.id}] correctIndex in range`,
    typeof q.correctIndex === 'number' && q.correctIndex! >= 0 && q.correctIndex! < opts.length,
    `correctIndex=${q.correctIndex}`,
  );
  if (q.correctIndex !== undefined && opts[q.correctIndex]) {
    check(
      `[${q.id}] correct option scores full points`,
      opts[q.correctIndex].score === q.points,
      `correct=${opts[q.correctIndex].score} points=${q.points}`,
    );
  }
  for (let i = 0; i < opts.length; i++) {
    const s = opts[i].score;
    check(
      `[${q.id}] option ${i} score in [0, ${q.points}]`,
      s >= 0 && s <= q.points,
      `score=${s}`,
    );
  }
  check(
    `[${q.id}] domain valid`,
    ['tool', 'ethics', 'concept'].includes(q.domain),
    `domain=${q.domain}`,
  );
  check(
    `[${q.id}] difficulty 1..3`,
    [1, 2, 3].includes(q.difficulty),
    `difficulty=${q.difficulty}`,
  );
}

// 6. difficulty distribution per domain
function distribute(arr: typeof ALL_QUESTIONS) {
  const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0 };
  for (const q of arr) dist[q.difficulty]++;
  return dist;
}
console.log('\nDifficulty distribution:');
console.log('  Tool:    ', distribute(TOOL_QUESTIONS));
console.log('  Ethics:  ', distribute(ETHICS_QUESTIONS));
console.log('  Concept: ', distribute(CONCEPT_QUESTIONS));

// require at least 1 of each difficulty per domain
for (const [name, arr] of [
  ['Tool', TOOL_QUESTIONS],
  ['Ethics', ETHICS_QUESTIONS],
  ['Concept', CONCEPT_QUESTIONS],
] as const) {
  const dist = distribute(arr);
  check(`${name}: has difficulty 1`, dist[1] > 0, '0 found');
  check(`${name}: has difficulty 2`, dist[2] > 0, '0 found');
  check(`${name}: has difficulty 3`, dist[3] > 0, '0 found');
}

console.log(`\n=== Result ===\nPASS: ${pass}\nFAIL: ${fail}`);
if (failures.length === 0) {
  console.log('All checks passed.');
} else {
  console.log('\nFailures:');
  for (const f of failures) console.log(`  - ${f}`);
  process.exit(1);
}
