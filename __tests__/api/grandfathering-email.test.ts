/**
 * @jest-environment node
 */

import { POST } from '@/app/api/account/grandfathering-email/route';

function makeRequest(body: Record<string, unknown> = {}, headers: Record<string, string> = {}) {
  return new Request('http://localhost:3000/api/account/grandfathering-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.3.0.1', ...headers },
    body: JSON.stringify(body),
  });
}

describe('/api/account/grandfathering-email', () => {
  it('rejects unauth (no admin token)', async () => {
    const res = await POST(makeRequest());
    expect(res.status).toBe(401);
  });

  it('rejects missing recipients when admin', async () => {
    const res = await POST(makeRequest({}, { 'x-admin-token': 'test-admin' }));
    expect(res.status).toBe(400);
  });

  it('accepts valid recipients and returns scheduled count (mock mode)', async () => {
    const res = await POST(
      makeRequest(
        { recipients: ['a@example.com', 'b@example.com'] },
        { 'x-admin-token': 'test-admin' },
      ),
    );
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data).toEqual({ scheduled: 2, delivered: 0, errors: 0 });
  });
});
