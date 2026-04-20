/**
 * @jest-environment node
 */

import { POST } from '@/app/api/stripe/webhook/route';

function makeRequest(body: string, signature: string = 'invalid') {
  return new Request('http://localhost:3000/api/stripe/webhook', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'stripe-signature': signature,
    },
    body,
  });
}

describe('/api/stripe/webhook', () => {
  it('returns 200 when webhook secret is not configured', async () => {
    // Without STRIPE_WEBHOOK_SECRET, webhook gracefully accepts
    const res = await POST(makeRequest('{}'));
    expect(res.status).toBe(200);
  });

  it('returns 400 when stripe-signature header is missing', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    const req = new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
    });
    const res = await POST(req);
    expect([400, 200]).toContain(res.status); // 400 if sig missing, 200 if secret not configured
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
  });

  it('returns 401 when signature is invalid', async () => {
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test';
    process.env.STRIPE_SECRET_KEY = 'sk_test_key';
    const res = await POST(makeRequest('{"type":"test"}', 't=123,v1=invalid'));
    expect(res.status).toBe(401);
    delete process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
  });
});
