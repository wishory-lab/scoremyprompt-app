import { z } from 'zod';
import { Resend } from 'resend';
import { getSupabaseAdmin } from '@/app/lib/supabase';
import { AppError, errorResponse } from '@/app/lib/errors';
import { logger } from '@/app/lib/logger';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'ScoreMyPrompt <newsletter@scoremyprompt.com>';
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY;

const NewsletterSchema = z.object({
  subject: z.string().min(1, 'Subject is required').max(200),
  preview_text: z.string().max(200).optional(),
  html_content: z.string().min(1, 'HTML content is required'),
  send_now: z.boolean().optional().default(false),
});

function validateAuth(request: Request): void {
  const auth = request.headers.get('Authorization');
  if (!INTERNAL_API_KEY) {
    throw new AppError('INTERNAL_API_KEY not configured', 'CONFIG_ERROR', 500);
  }
  if (!auth || auth !== `Bearer ${INTERNAL_API_KEY}`) {
    throw new AppError('Unauthorized', 'AUTH_ERROR', 401);
  }
}

export async function POST(request: Request) {
  try {
    validateAuth(request);

    const body = await request.json();
    const parsed = NewsletterSchema.safeParse(body);

    if (!parsed.success) {
      throw new AppError(parsed.error.issues[0].message, 'VALIDATION_ERROR', 400);
    }

    const { subject, preview_text, html_content, send_now } = parsed.data;

    if (!resend) {
      logger.warn('Resend not configured — newsletter queued locally only');
      return Response.json({
        success: true,
        message: 'Newsletter queued (Resend not configured)',
        queued: true,
        subject,
      });
    }

    // Get subscribers from waitlist
    const supabase = getSupabaseAdmin();
    if (!supabase) {
      throw new AppError('Database not configured', 'CONFIG_ERROR', 500);
    }

    const { data: subscribers, error: dbError } = await supabase
      .from('waitlist')
      .select('email')
      .order('created_at', { ascending: true });

    if (dbError) {
      logger.error('Failed to fetch subscribers', { error: dbError.message });
      throw new AppError('Failed to fetch subscriber list', 'DB_ERROR', 500);
    }

    const emails = (subscribers || []).map((s) => s.email);

    if (emails.length === 0) {
      return Response.json({
        success: true,
        message: 'No subscribers found',
        sent_count: 0,
      });
    }

    if (!send_now) {
      logger.info('Newsletter queued for review', { subject, subscriber_count: emails.length });
      return Response.json({
        success: true,
        message: `Newsletter ready to send to ${emails.length} subscribers`,
        queued: true,
        subscriber_count: emails.length,
        subject,
      });
    }

    // Send via Resend batch API
    const batchSize = 50;
    let sentCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      try {
        await resend.batch.send(
          batch.map((email) => ({
            from: FROM_EMAIL,
            to: email,
            subject,
            html: html_content,
            headers: preview_text ? { 'X-Preview-Text': preview_text } : undefined,
          }))
        );
        sentCount += batch.length;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        logger.error('Batch send failed', { batch_start: i, error: msg });
        errors.push(`Batch ${i}-${i + batch.length}: ${msg}`);
      }
    }

    logger.info('Newsletter sent', { subject, sent_count: sentCount, total: emails.length });

    return Response.json({
      success: true,
      message: `Newsletter sent to ${sentCount}/${emails.length} subscribers`,
      sent_count: sentCount,
      total_subscribers: emails.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    if (error instanceof AppError) return errorResponse(error);
    logger.error('Newsletter send error', { error: String(error) });
    return errorResponse(error as Error);
  }
}
