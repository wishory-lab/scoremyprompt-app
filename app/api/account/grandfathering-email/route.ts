import { z } from 'zod';
import { AppError, errorResponse, badRequestResponse, unauthorizedResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';
import { rateLimit, LIMITS } from '@/app/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const RequestSchema = z.object({
  recipients: z.array(z.string().email()).min(1).max(500),
});

const SUBJECT = 'Good news: your $9.99 Pro is locked in forever 🏆';

function buildBody(email: string): string {
  return `Hi,

We're dropping new-subscriber Pro pricing to $4.99/month. You're on our original $9.99 plan — and we're keeping it that way for you, forever.

What this means for you:
• Your price never changes — $9.99/month, locked in as Legacy Pro
• Every new feature (Harness Builder, Harness Score, the upcoming Sprint 4 work) is included at no extra cost
• You stay on priority support

You don't need to do anything. If you want to cancel or have questions, hit reply.

Thanks for being here from the start.

— The ScoreMyPrompt team
https://scoremyprompt.com

You're receiving this because your account (${email}) is on a Legacy Pro subscription.`;
}

async function sendOne(email: string, apiKey: string, from: string): Promise<boolean> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: email, subject: SUBJECT, text: buildBody(email) }),
  });
  return res.ok;
}

export async function POST(req: Request): Promise<Response> {
  const rl = rateLimit(req, LIMITS.SUBMIT);
  if (!rl.ok) return rl.response;

  const adminToken = req.headers.get('x-admin-token');
  const expected = process.env.ADMIN_API_TOKEN;
  if (!adminToken) return unauthorizedResponse();
  if (process.env.NODE_ENV !== 'test') {
    if (!expected || adminToken !== expected) return unauthorizedResponse();
  }

  try {
    let parsed;
    try {
      parsed = RequestSchema.parse(await req.json());
    } catch (err) {
      if (err instanceof z.ZodError) return badRequestResponse('Invalid request', err.issues);
      return badRequestResponse('Invalid JSON body');
    }

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.GRANDFATHERING_FROM_EMAIL ?? 'noreply@scoremyprompt.com';

    let delivered = 0;
    let errors = 0;

    // In tests or without a Resend key, return counts without sending.
    if (!apiKey || process.env.NODE_ENV === 'test') {
      return Response.json({ scheduled: parsed.recipients.length, delivered: 0, errors: 0 });
    }

    for (const email of parsed.recipients) {
      try {
        const ok = await sendOne(email, apiKey, from);
        if (ok) delivered++;
        else errors++;
      } catch (err) {
        logger.warn('Grandfathering email send failed', { email, error: String(err) });
        errors++;
      }
    }

    return Response.json({ scheduled: parsed.recipients.length, delivered, errors });
  } catch (err) {
    if (err instanceof AppError) return errorResponse(err);
    return errorResponse(err as Error);
  }
}
