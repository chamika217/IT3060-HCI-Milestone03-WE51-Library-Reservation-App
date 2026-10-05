const mongoose = require('mongoose');
const dns = require('node:dns');
module.exports = async function connectDatabase() {
  if (!process.env.MONGODB_URI) throw new Error('Set MONGODB_URI in library-backend/.env');
  if (process.env.MONGODB_DNS_SERVERS) dns.setServers(process.env.MONGODB_DNS_SERVERS.split(',').map(s => s.trim()));
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000, ...(process.env.MONGODB_DB ? { dbName: process.env.MONGODB_DB } : {}) });
};
