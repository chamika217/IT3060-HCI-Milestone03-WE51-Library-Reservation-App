require('dotenv').config({ path: require('node:path').join(__dirname, '.env') });
const connectDatabase = require('./config/database');
const { seedBooks } = require('./services/catalogue');
async function start() {
  await connectDatabase();
  await seedBooks();
  const server = require('./app').listen(Number(process.env.PORT) || 5000, () => console.log('Library API connected; listening on port ' + (process.env.PORT || 5000)));
  server.on('error', async () => { console.error('Cannot listen. Check PORT.'); await require('mongoose').disconnect(); process.exitCode = 1; });
  for (const signal of ['SIGINT', 'SIGTERM']) process.once(signal, () => server.close(async () => { await require('mongoose').disconnect(); }));
}
start().catch(async () => { console.error('Cannot start API. Check library-backend/.env and MongoDB access.'); await require('mongoose').disconnect(); process.exitCode = 1; });
