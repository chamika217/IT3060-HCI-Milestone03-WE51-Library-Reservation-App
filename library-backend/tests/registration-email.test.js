const { test } = require('node:test');
const assert = require('node:assert/strict');
const { validRegistrationEmail, emailMessage } = require('../services/registrationEmail');

test('registration permits only exact Gmail and SLIIT domains', () => {
  for (const email of ['student@my.sliit.lk', 'reader@gmail.com', ' Reader@GMAIL.COM ', 'reader+library@gmail.com']) {
    assert.equal(validRegistrationEmail(email), true, email);
  }
  for (const email of ['', '@gmail.com', 'a@@gmail.com', 'a b@gmail.com', 'a@yahoo.com', 'a@gmail.com.evil.com', 'a@sub.gmail.com', 'a@myXsliitXlk', null, 'a'.repeat(255) + '@gmail.com']) {
    assert.equal(validRegistrationEmail(email), false, String(email));
  }
});

test('direct registration requests reject unsupported domains before database access', async () => {
  const controller = require('../controllers/auth');
  const res = { status(code) { this.code = code; return this; }, json(body) { this.body = body; } };
  await controller.register({ body: { email: 'reader@example.edu' } }, res);
  assert.equal(res.code, 400);
  assert.equal(res.body.message, emailMessage);
});
