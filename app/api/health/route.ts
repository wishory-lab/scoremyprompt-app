import { getSupabaseAdmin } from '@/app/lib/supabase';
import { getEnvStatus } from '@/app/lib/env';

export const dynamic = 'force-dynamic';

export async function GET() {
  const env = getEnvStatus();

  const services: Record<string, Record<string, unknown>> = {
    supabase: { configured: env.supabase && env.supabaseAdmin },
    anthropic: { configured: env.anthropic },
    stripe: { configured: env.stripe },
  };

  // Test Supabase connection with a simple query
  if (env.supabaseAdmin) {
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const start = Date.now();
      try {
        const { error } = await supabase.from('waitlist').select('id').limit(1);
        const latencyMs = Date.now() - start;
        services.supabase = {
          connected: !error,
          latency_ms: latencyMs,
          ...(error && { error: error.message }),
        };
      } catch {
        services.supabase = {
          connected: false,
          error: 'Connection failed',
          latency_ms: Date.now() - start,
        };
      }
    }
  }

  // Determine overall status and HTTP status code
  const supabaseOk = services.supabase.connected !== false;
  const anthropicOk = env.anthropic;
  const stripeOk = env.stripe;

  const criticalDown = !anthropicOk && !supabaseOk;
  const partialDown = !supabaseOk || !anthropicOk || !stripeOk;

  const overallStatus = criticalDown ? 'critical' : partialDown ? 'degraded' : 'ok';
  const statusCode = criticalDown ? 503 : partialDown ? 207 : 200;

  return Response.json(
    {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services,
      version: '1.0.0',
      environment: process.env.NODE_ENV,
    },
    { status: statusCode }
  );
}
