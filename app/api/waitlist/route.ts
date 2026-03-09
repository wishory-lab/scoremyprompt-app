import { z } from 'zod';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ScoreMyPrompt <hello@scoremyprompt.com>';

const WaitlistSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  source: z.string().optional().default('unknown'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = WaitlistSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { email, source } = parsed.data;

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      logger.warn('Supabase not configured — waitlist signup skipped');
      return Response.json({ success: true, message: "You're on the list!", email: email.toLowerCase() }, { status: 200 });
    }

    const { error } = await supabase
      .from('waitlist')
      .upsert(
        { email: email.toLowerCase(), source },
        { onConflict: 'email' }
      )
      .select();

    if (error) {
      logger.error('Waitlist DB error', { error: error.message });
      throw new AppError('Failed to join waitlist. Please try again.', 'DB_ERROR', 500);
    }

    // Send welcome email (non-blocking)
    if (resend) {
      resend.emails.send({
        from: FROM_EMAIL,
        to: email.toLowerCase(),
        subject: 'Welcome to ScoreMyPrompt! 🎯',
        html: getWelcomeEmailHtml(),
      }).catch((err) => {
        logger.warn('Welcome email failed', { error: String(err), email: email.toLowerCase() });
      });
    }

    return Response.json({ success: true, message: "You're on the list!", email: email.toLowerCase() }, { status: 200 });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Waitlist request error', { error: String(error) });
    return errorResponse(error as Error);
  }
}

function getWelcomeEmailHtml(): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0f1a;font-family:system-ui,-apple-system,sans-serif">
<div style="max-width:600px;margin:0 auto;padding:40px 20px">
  <div style="text-align:center;margin-bottom:32px">
    <div style="display:inline-block;width:48px;height:48px;background:linear-gradient(135deg,#3b82f6,#8b5cf6);border-radius:12px;line-height:48px;font-size:24px;font-weight:800;color:#fff">S</div>
    <h1 style="color:#fff;font-size:24px;margin:16px 0 0">Welcome to ScoreMyPrompt!</h1>
  </div>
  <div style="background:#1a1f2e;border:1px solid #2a2f3e;border-radius:12px;padding:32px;margin-bottom:24px">
    <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 20px">
      Thanks for joining! You're now part of a growing community of professionals leveling up their AI prompting skills.
    </p>
    <p style="color:#94a3b8;font-size:16px;line-height:1.6;margin:0 0 24px">
      Here's what you'll get: weekly AI prompt tips, new feature announcements, and exclusive early access to Pro features.
    </p>
    <div style="text-align:center">
      <a href="https://scoremyprompt.com" style="display:inline-block;background:linear-gradient(135deg,#3b82f6,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:600;font-size:16px">
        Score Your First Prompt →
      </a>
    </div>
  </div>
  <p style="color:#475569;font-size:12px;text-align:center;margin:0">
    You're receiving this because you signed up at ScoreMyPrompt.com
  </p>
</div>
</body>
</html>`;
}
