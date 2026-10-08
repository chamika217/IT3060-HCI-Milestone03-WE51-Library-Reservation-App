const jwt = require('jsonwebtoken');

const certUrl = 'https://www.googleapis.com/oauth2/v1/certs';
let cachedCerts = null;
let certsExpireAt = 0;

async function getSigningCert(keyId) {
  if (!cachedCerts || Date.now() >= certsExpireAt) {
    const response = await fetch(certUrl);
    if (!response.ok) throw new Error('Google signing keys are temporarily unavailable.');
    const nextCerts = await response.json();
    if (!nextCerts || typeof nextCerts !== 'object') throw new Error('Google signing keys response is invalid.');
    const maxAge = Number(response.headers.get('cache-control')?.match(/max-age=(\d+)/i)?.[1] || 300);
    cachedCerts = nextCerts;
    certsExpireAt = Date.now() + Math.min(maxAge, 3600) * 1000;
  }
  const cert = cachedCerts[keyId];
  if (!cert) {
    cachedCerts = null;
    certsExpireAt = 0;
    throw new Error('Google signing key was not found.');
  }
  return cert;
}

function verifyGoogleIdToken(idToken, audience) {
  return new Promise((resolve, reject) => {
    jwt.verify(idToken, (header, done) => {
      if (header.alg !== 'RS256' || typeof header.kid !== 'string') return done(new Error('Unsupported Google token signature.'));
      getSigningCert(header.kid).then(cert => done(null, cert), done);
    }, {
      algorithms: ['RS256'],
      audience,
      issuer: ['accounts.google.com', 'https://accounts.google.com'],
      clockTolerance: 60,
    }, (error, payload) => {
      if (error) return reject(error);
      if (!payload || typeof payload !== 'object') return reject(new Error('Google token payload is invalid.'));
      resolve(payload);
    });
  });
}

module.exports = { verifyGoogleIdToken };
