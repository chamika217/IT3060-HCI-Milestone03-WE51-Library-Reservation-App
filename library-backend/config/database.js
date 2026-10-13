const mongoose = require('mongoose');
const dns = require('node:dns');
const https = require('node:https');
const tls = require('node:tls');

function googleDnsQuery(name, type) {
  return new Promise((resolve, reject) => {
    // Atlas uses DNS SRV records. Some campus/ISP DNS servers reject those
    // lookups, so resolve them through Google's HTTPS DNS endpoint instead.
    const request = https.get({
      hostname: '8.8.8.8',
      port: 443,
      path: `/resolve?name=${encodeURIComponent(name)}&type=${type}`,
      servername: 'dns.google',
      headers: { host: 'dns.google', accept: 'application/dns-json' },
      checkServerIdentity: (_hostname, certificate) => tls.checkServerIdentity('dns.google', certificate),
      timeout: 8000,
    }, response => {
      let body = '';
      response.setEncoding('utf8');
      response.on('data', chunk => { body += chunk; });
      response.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (response.statusCode !== 200 || result.Status !== 0) throw new Error('DNS-over-HTTPS lookup failed.');
          resolve(result.Answer || []);
        } catch (error) { reject(error); }
      });
    });
    request.on('timeout', () => request.destroy(new Error('DNS-over-HTTPS lookup timed out.')));
    request.on('error', reject);
  });
}

async function resolveSrvUri(uri) {
  const original = new URL(uri);
  const srvRecords = await googleDnsQuery(`_mongodb._tcp.${original.hostname}`, 'SRV');
  const txtRecords = await googleDnsQuery(original.hostname, 'TXT');
  const hosts = srvRecords.map(record => {
    const match = /^\d+\s+\d+\s+(\d+)\s+([a-z0-9-]+(?:\.[a-z0-9-]+)*)\.?$/i.exec(record.data);
    if (!match) throw new Error('MongoDB Atlas returned an invalid SRV record.');
    return `${match[2]}:${match[1]}`;
  });
  if (!hosts.length) throw new Error('MongoDB Atlas returned no SRV hosts.');

  const options = new URLSearchParams(original.search);
  for (const record of txtRecords) {
    const text = record.data.replace(/^"|"$/g, '');
    for (const [key, value] of new URLSearchParams(text)) if (!options.has(key)) options.set(key, value);
  }
  if (!options.has('tls') && !options.has('ssl')) options.set('tls', 'true');
  const credentials = original.username
    ? `${original.username}${original.password ? `:${original.password}` : ''}@`
    : '';
  return `mongodb://${credentials}${hosts.join(',')}${original.pathname}?${options.toString()}`;
}

module.exports = async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in library-backend/.env');
  const uri = process.env.MONGODB_URI;
  const connectionUri = uri.startsWith('mongodb+srv://') ? await resolveSrvUri(uri) : uri;

  // Connect directly with tlsInsecure — bypasses the campus SSL proxy
  // that intercepts TLS connections. Atlas SRV records are resolved through
  // DNS-over-HTTPS above when the local DNS server rejects SRV lookups.
  await mongoose.connect(connectionUri, {
    serverSelectionTimeoutMS: 20000,
    tls: true,
    tlsInsecure: true, // dev only — disable cert verification (campus/university proxy)
    ...(process.env.MONGODB_DB ? { dbName: process.env.MONGODB_DB } : {}),
  });
};
