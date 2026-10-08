const mongoose = require('mongoose');
mongoose.set('autoIndex', false);

const app = require('./app');
const connectDatabase = require('./config/database');

async function start() {
  await connectDatabase();
  console.log('MongoDB connection established.');

  const booksCollection = mongoose.connection.db.collection('books');
  const bookIndexes = await booksCollection.listIndexes().toArray();
  const isbnIndex = bookIndexes.find(index => index.name === 'isbn_1');
  if (isbnIndex && !isbnIndex.partialFilterExpression) await booksCollection.dropIndex('isbn_1');

  const usersCollection = mongoose.connection.db.collection('users');
  const userIndexes = await usersCollection.listIndexes().toArray();
  const studentIdIndex = userIndexes.find(index =>
    index.name === 'studentId_1'
    && index.unique === true
    && index.sparse !== true
    && index.key?.studentId === 1
    && Object.keys(index.key).length === 1
  );
  if (studentIdIndex) await usersCollection.dropIndex(studentIdIndex.name);

  const models = [
    './models/User',
    './models/Session',
    './models/Book',
    './models/Reservation',
    './models/Seat',
    './seat-booking/models/Room',
    './seat-booking/models/Seat',
    './seat-booking/models/Reservation',
  ].map(require);
  await Promise.all(models.map(model => model.init()));
  await Promise.all(models.map(model => model.createIndexes()));
  await require('./services/catalogue').seedBooks();

  const port = Number(process.env.PORT) || 5000;
  const server = app.listen(port, () => console.log(`Library API connected; listening on port ${port}`));
  server.on('error', async error => {
    console.error(`Cannot listen (${error.code || error.name || 'UnknownError'}): ${error.message || 'Check PORT.'}`);
    await mongoose.disconnect();
    process.exitCode = 1;
  });
  for (const signal of ['SIGINT', 'SIGTERM']) {
    process.once(signal, () => server.close(async () => {
      await mongoose.disconnect();
    }));
  }
}

start().catch(async error => {
  const code = error.cause?.code || error.code || error.name || 'UnknownError';
  const detail = String(error.message || 'Unknown startup error')
    .replace(/mongodb(?:\+srv)?:\/\/[^@\s]+@/gi, 'mongodb+srv://[credentials-hidden]@');
  console.error(`Cannot start API (${code}): ${detail}`);
  console.error('Check MONGODB_URI, Atlas Network Access and credentials, and any MongoDB index conflict reported above.');
  await mongoose.disconnect();
  process.exitCode = 1;
});
