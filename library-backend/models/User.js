const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Student', 'Staff', 'Admin'], default: 'Student' },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });
module.exports = mongoose.models.User || mongoose.model('User', schema);
const bcrypt = require('bcryptjs');

const notificationPreferencesSchema = new mongoose.Schema(
  {
    pushEnabled:           { type: Boolean, default: true  },
    bookHolds:             { type: Boolean, default: true  },
    seatAlerts:            { type: Boolean, default: true  },
    dueDateReminders:      { type: Boolean, default: true  },
    cancellationNotices:   { type: Boolean, default: true  },
    emailSummaries:        { type: Boolean, default: false },
    quietHoursEnabled:     { type: Boolean, default: true  },
  },
  { _id: false },
);

const statsSchema = new mongoose.Schema(
  {
    holdings: { type: Number, default: 0 },
    bookings: { type: Number, default: 0 },
    alerts:   { type: Number, default: 0 },
  },
  { _id: false },
);

const userSchema = new mongoose.Schema({
  fullName:  { type: String, required: true, trim: true },
  email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:  { type: String, required: true },
  phone:     { type: String, default: '' },
  studentId: { type: String, required: true, unique: true, trim: true },
  program:   { type: String, default: '' },
  semester:  { type: String, default: '' },
  role: {
    type: String,
    enum: ['student', 'staff', 'admin'],
    default: 'student',
  },
  stats:                   { type: statsSchema,                   default: () => ({}) },
  notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving if it was modified.
// Mongoose 7+ async hooks: return a Promise — do NOT use the `next` callback.
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Helper: compare plain password against stored hash
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

// Never expose the password field in JSON responses
userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    return ret;
  },
});

module.exports = mongoose.model('User', userSchema);
