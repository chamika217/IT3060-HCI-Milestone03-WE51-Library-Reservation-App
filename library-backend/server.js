require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const connectDatabase = require('./config/database');
async function start() {
  await connectDatabase();
  await Promise.all([require('./models/User').init(), require('./models/Session').init(), require('./models/Book').init()]);
  const server = require('./app').listen(Number(process.env.PORT) || 5000, () => console.log('Library API connected; listening on port ' + (process.env.PORT || 5000)));
  server.on('error', async error => { console.error(`Cannot listen (${error?.code || error?.name || 'UnknownError'}): ${error?.message || 'Check PORT.'}`); await require('mongoose').disconnect(); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(async () => { await require('mongoose').disconnect(); }));
}
start().catch(async error => {
  const code = error?.cause?.code || error?.code || error?.name || 'UnknownError';
  const detail = String(error?.message || 'Unknown startup error')
    .replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/gi, 'mongodb+srv://[credentials-hidden]@');
  console.error(`Cannot start API (${code}): ${detail}`);
  console.error('Check Atlas Network Access, database credentials, and MongoDB connectivity.');
  await require('mongoose').disconnect();
  process.exitCode = 1;
});
