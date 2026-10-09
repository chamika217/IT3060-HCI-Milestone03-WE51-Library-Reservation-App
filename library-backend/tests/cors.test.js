const { test } = require('node:test');
const assert = require('node:assert/strict');

test('browser preflight permits reservation updates from a configured origin', async t => {
  const server = require('../app').listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = (process.env.CORS_ORIGIN || 'http://localhost:8081').split(',')[0].trim();
  const response = await fetch(`http://127.0.0.1:${server.address().port}/api/reservations/test-hold`, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': 'PATCH',
      'Access-Control-Request-Headers': 'authorization,content-type',
    },
  });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('access-control-allow-origin'), origin);
  assert.ok(response.headers.get('access-control-allow-methods').split(',').includes('PATCH'));
  const headers = response.headers.get('access-control-allow-headers').toLowerCase().split(',');
  assert.ok(headers.includes('authorization'));
  assert.ok(headers.includes('content-type'));

  const denied = await fetch(`http://127.0.0.1:${server.address().port}/api/reservations/test-hold`, {
    method: 'OPTIONS',
    headers: { Origin: 'https://untrusted.example', 'Access-Control-Request-Method': 'PATCH' },
  });
  assert.equal(denied.headers.get('access-control-allow-origin'), null);
});
