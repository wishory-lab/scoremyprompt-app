#!/usr/bin/env node

/**
 * ScoreMyPrompt Go/No-Go Automated Checklist
 * Aligned with Launch Sprint Plan D-1 Go/No-Go Decision
 *
 * Sprint Plan Go/No-Go (ALL must be YES):
 *   1. Vercel production working? (grading + share + Pro page)
 *   2. OG image preview OK on X/LinkedIn?
 *   3. PostHog events receiving?
 *   4. X/LinkedIn/YouTube all scheduled? (manual check)
 *   5. Emergency templates ready? (file check)
 *
 * Usage: node scripts/go-nogo-check.js [production_url]
 * Prod:  npm run go-nogo:prod
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.argv[2] || process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
let passCount = 0;
let failCount = 0;
let warnCount = 0;

function log(status, message) {
  const icons = { pass: '\u2705', fail: '\u274C', warn: '\u26A0\uFE0F ', info: '\u2139\uFE0F ' };
  const icon = icons[status] || '  ';
  if (status === 'pass') passCount++;
  else if (status === 'fail') failCount++;
  else if (status === 'warn') warnCount++;
  console.log(`  ${icon} ${message}`);
}

function fetch(url, timeout = 10000) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    const req = mod.get(url, { timeout }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

// ─── CHECK 1: Vercel production working? (grading + share + Pro page) ───
async function check1_ProductionWorking() {
  console.log('\n\u2460 Vercel Production Working? (grading + share + Pro page)');

  // 1a. Health endpoint
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    const data = JSON.parse(res.data);
    if (res.status === 200) log('pass', `Health: ${data.status}`);
    else if (res.status === 207) log('warn', `Health: degraded (${res.status})`);
    else log('fail', `Health: critical (${res.status})`);
  } catch (e) {
    log('fail', `Health endpoint unreachable: ${e.message}`);
  }

  // 1b. Core pages accessible
  const pages = [
    { path: '/', name: 'Homepage (grading)' },
    { path: '/result', name: 'Result page (share)' },
    { path: '/pricing', name: 'Pro/Pricing page' },
    { path: '/challenge', name: 'Challenge page' },
    { path: '/guides', name: 'Guides page' },
  ];

  for (const page of pages) {
    try {
      const res = await fetch(`${BASE_URL}${page.path}`);
      if (res.status === 200 || res.status === 302 || res.status === 307) {
        log('pass', `${page.name} (${page.path}) \u2192 ${res.status}`);
      } else {
        log('fail', `${page.name} (${page.path}) \u2192 ${res.status}`);
      }
    } catch (e) {
      log('fail', `${page.name} unreachable: ${e.message}`);
    }
  }

  // 1c. API endpoints
  const apis = [
    { path: '/api/health', name: 'Health API' },
    { path: '/api/leaderboard', name: 'Leaderboard API' },
  ];

  for (const api of apis) {
    try {
      const res = await fetch(`${BASE_URL}${api.path}`);
      if (res.status < 500) log('pass', `${api.name} \u2192 ${res.status}`);
      else log('fail', `${api.name} \u2192 ${res.status}`);
    } catch (e) {
      log('fail', `${api.name} unreachable: ${e.message}`);
    }
  }

  // 1d. Environment variables
  const envVars = [
    { name: 'ANTHROPIC_API_KEY', label: 'Claude API', required: true },
    { name: 'NEXT_PUBLIC_SUPABASE_URL', label: 'Supabase URL', required: true },
    { name: 'NEXT_PUBLIC_SUPABASE_ANON_KEY', label: 'Supabase Key', required: true },
    { name: 'STRIPE_SECRET_KEY', label: 'Stripe', required: false },
  ];

  for (const v of envVars) {
    if (process.env[v.name]) log('pass', `ENV: ${v.label}`);
    else if (v.required) log('fail', `ENV: ${v.label} \u2014 NOT SET (required)`);
    else log('warn', `ENV: ${v.label} \u2014 not set (optional)`);
  }
}

// ─── CHECK 2: OG image preview OK on X/LinkedIn? ───
async function check2_OGImage() {
  console.log('\n\u2461 OG Image Preview OK?');

  // 2a. Default OG image
  try {
    const url = `${BASE_URL}/api/og?score=92&grade=S&gradeLabel=Exceptional&jobRole=Marketing&percentile=98&p=95&r=90&o=88&m=93&s=91&t=94`;
    const res = await fetch(url);
    if (res.status === 200 && res.headers['content-type']?.includes('image')) {
      log('pass', `Default OG image generates (${res.headers['content-type']})`);
    } else {
      log('fail', `Default OG failed: status=${res.status}`);
    }
  } catch (e) {
    log('fail', `Default OG unreachable: ${e.message}`);
  }

  // 2b. Score card OG (low score)
  try {
    const res = await fetch(`${BASE_URL}/api/og?score=34&grade=D&jobRole=Developer&p=30&r=35&o=28&m=40&s=32&t=38`);
    if (res.status === 200) log('pass', 'Low-score card OG generates');
    else log('fail', `Low-score OG failed: ${res.status}`);
  } catch (e) {
    log('fail', `Low-score OG unreachable: ${e.message}`);
  }

  // 2c. Score card OG (high score)
  try {
    const res = await fetch(`${BASE_URL}/api/og?score=92&grade=S&jobRole=Marketing&p=95&r=90&o=88&m=93&s=91&t=94`);
    if (res.status === 200) log('pass', 'High-score card OG generates');
    else log('fail', `High-score OG failed: ${res.status}`);
  } catch (e) {
    log('fail', `High-score OG unreachable: ${e.message}`);
  }

  // 2d. Manual check reminder
  console.log('  \u2139\uFE0F  Manual: Test with X Card Validator (cards-dev.twitter.com/validator)');
  console.log('  \u2139\uFE0F  Manual: Test with LinkedIn Post Inspector (linkedin.com/post-inspector)');
}

// ─── CHECK 3: PostHog events receiving? ───
async function check3_PostHog() {
  console.log('\n\u2462 PostHog Events Receiving?');

  if (process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    log('pass', 'NEXT_PUBLIC_POSTHOG_KEY is configured');
  } else {
    log('fail', 'NEXT_PUBLIC_POSTHOG_KEY is NOT SET \u2014 no analytics');
  }

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    log('pass', 'NEXT_PUBLIC_SENTRY_DSN is configured');
  } else {
    log('warn', 'NEXT_PUBLIC_SENTRY_DSN is not set \u2014 no error alerts');
  }

  // Verify analytics file exports expected functions
  try {
    const analyticsPath = path.join(__dirname, '..', 'app', 'lib', 'analytics.ts');
    const content = fs.readFileSync(analyticsPath, 'utf8');
    const requiredEvents = ['grade_started', 'grade_completed', 'score_shared', 'waitlist_signup', 'pro_clicked', 'signup_completed', 'return_analysis', 'pro_subscribed', 'viral_referral', 'newsletter_signup'];
    for (const event of requiredEvents) {
      if (content.includes(event)) {
        log('pass', `Funnel event: ${event} tracked`);
      } else {
        log('fail', `Funnel event: ${event} MISSING from analytics.ts`);
      }
    }
  } catch (e) {
    log('warn', `Could not verify analytics file: ${e.message}`);
  }

  console.log('  \u2139\uFE0F  Manual: Check PostHog dashboard for real-time events after deploy');
}

// ─── CHECK 4: X/LinkedIn/YouTube all scheduled? ───
async function check4_ContentScheduled() {
  console.log('\n\u2463 Content Scheduled? (manual verification)');

  // Check if content calendar exists
  const calendarPath = path.join(__dirname, '..', 'launch', 'content-calendar.csv');
  if (fs.existsSync(calendarPath)) {
    const content = fs.readFileSync(calendarPath, 'utf8');
    const lines = content.trim().split('\n').slice(1); // skip header
    const readyCount = lines.filter(l => l.includes(',ready,')).length;
    const draftCount = lines.filter(l => l.includes(',draft,')).length;
    log('pass', `Content calendar: ${readyCount} ready, ${draftCount} drafts`);
  } else {
    log('fail', 'Content calendar (launch/content-calendar.csv) NOT FOUND');
  }

  // Check launch materials
  const launchFiles = [
    { file: 'launch/reddit-drafts.md', name: 'Reddit drafts' },
    { file: 'launch/sns-profiles.md', name: 'SNS profile guide' },
    { file: 'launch/d-day-checklist.md', name: 'D-Day checklist' },
  ];

  for (const f of launchFiles) {
    const filePath = path.join(__dirname, '..', f.file);
    if (fs.existsSync(filePath)) log('pass', `${f.name} ready`);
    else log('fail', `${f.name} NOT FOUND (${f.file})`);
  }

  console.log('  \u2139\uFE0F  Manual: Verify X tweets scheduled via native scheduler');
  console.log('  \u2139\uFE0F  Manual: Verify LinkedIn posts scheduled via clock icon');
  console.log('  \u2139\uFE0F  Manual: Verify YouTube video uploaded + scheduled');
}

// ─── CHECK 5: Emergency templates ready? ───
async function check5_Emergency() {
  console.log('\n\u2464 Emergency Templates Ready?');

  const emergencyPath = path.join(__dirname, '..', 'launch', 'emergency-templates.md');
  if (fs.existsSync(emergencyPath)) {
    const content = fs.readFileSync(emergencyPath, 'utf8');
    const checks = [
      { keyword: 'Server Down', name: 'Server down template' },
      { keyword: 'Slow Site', name: 'Slow site template' },
      { keyword: 'Bug Report', name: 'Bug report template' },
      { keyword: 'API Outage', name: 'API outage template' },
    ];
    for (const c of checks) {
      if (content.includes(c.keyword)) log('pass', c.name);
      else log('fail', `${c.name} MISSING`);
    }
  } else {
    log('fail', 'Emergency templates (launch/emergency-templates.md) NOT FOUND');
  }

  // Check maintenance mode capability
  try {
    const middlewarePath = path.join(__dirname, '..', 'middleware.ts');
    const middleware = fs.readFileSync(middlewarePath, 'utf8');
    if (middleware.includes('MAINTENANCE_MODE')) {
      log('pass', 'Maintenance mode toggle in middleware');
    } else {
      log('fail', 'Maintenance mode NOT configured in middleware');
    }
  } catch (e) {
    log('warn', `Could not verify middleware: ${e.message}`);
  }

  // Check maintenance page
  try {
    const res = await fetch(`${BASE_URL}/maintenance`);
    if (res.status === 200) log('pass', 'Maintenance page accessible');
    else log('warn', `Maintenance page: ${res.status}`);
  } catch (e) {
    log('warn', `Maintenance page unreachable: ${e.message}`);
  }
}

// ─── MAIN ───
async function main() {
  console.log('\u2554' + '\u2550'.repeat(54) + '\u2557');
  console.log('\u2551  ScoreMyPrompt \u2014 Go/No-Go Launch Checklist          \u2551');
  console.log('\u2551  Sprint Plan D-1: ALL must be YES                    \u2551');
  console.log('\u2560' + '\u2550'.repeat(54) + '\u2563');
  console.log(`\u2551  Target: ${BASE_URL.padEnd(44)}\u2551`);
  console.log(`\u2551  Time:   ${new Date().toISOString().padEnd(44)}\u2551`);
  console.log('\u255A' + '\u2550'.repeat(54) + '\u255D');

  await check1_ProductionWorking();
  await check2_OGImage();
  await check3_PostHog();
  await check4_ContentScheduled();
  await check5_Emergency();

  console.log('\n' + '\u2550'.repeat(56));
  console.log(`  RESULTS: \u2705 ${passCount} passed | \u274C ${failCount} failed | \u26A0\uFE0F  ${warnCount} warnings`);
  console.log('\u2550'.repeat(56));

  if (failCount === 0) {
    console.log('\n  \uD83D\uDE80 GO \u2014 All critical checks passed! Launch is a GO.\n');
    process.exit(0);
  } else {
    console.log(`\n  \uD83D\uDED1 NO-GO \u2014 ${failCount} critical issue(s) must be resolved.\n`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
