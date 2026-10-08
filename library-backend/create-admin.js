require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';

async function ensureAdmin() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to your backend .env file.');
  }

  await mongoose.connect(process.env.MONGODB_URI);

  const existing = await User.findOne({ email: adminEmail });

  if (existing) {
    const needsUpdate = existing.role !== 'Admin' || existing.status !== 'Active';

    if (needsUpdate) {
      existing.role = 'Admin';
      existing.status = 'Active';
      await existing.save();
      console.log(`Existing account for ${adminEmail} was updated to Admin role.`);
    } else {
      console.log(`Admin account already exists for ${adminEmail}; no duplicate was created.`);
    }

    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10);

  await User.create({
    name: 'Library Admin',
    email: adminEmail,
    password: hashedPassword,
    role: 'Admin',
    status: 'Active',
  });

  console.log(`Created admin account for ${adminEmail}.`);
  await mongoose.disconnect();
}

ensureAdmin()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Failed to create initial admin:', err.message);
    process.exit(1);
  });
