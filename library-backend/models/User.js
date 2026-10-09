const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const notificationPreferencesSchema = new mongoose.Schema({
  pushEnabled: { type: Boolean, default: true },
  bookHolds: { type: Boolean, default: true },
  seatAlerts: { type: Boolean, default: true },
  dueDateReminders: { type: Boolean, default: true },
  cancellationNotices: { type: Boolean, default: true },
  emailSummaries: { type: Boolean, default: false },
  quietHoursEnabled: { type: Boolean, default: true },
}, { _id: false });

const statsSchema = new mongoose.Schema({
  holdings: { type: Number, default: 0 },
  bookings: { type: Number, default: 0 },
  alerts: { type: Number, default: 0 },
}, { _id: false });

const normalizeRole = value => typeof value === 'string'
  ? value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
  : value;

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  fullName: { type: String, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String },
  passwordHash: { type: String, select: false },
  role: {
    type: String,
    enum: ['Student', 'Staff', 'Admin', 'student', 'staff', 'admin'],
    default: 'Student',
    set: normalizeRole,
  },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  googleSub: { type: String, sparse: true, unique: true },
  googleId: { type: String, sparse: true, unique: true },
  provider: { type: String, default: 'local' },
  studentId: { type: String, sparse: true, unique: true, trim: true },
  department: { type: String, default: '' },
  program: { type: String, default: '' },
  semester: { type: String, default: '' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  stats: { type: statsSchema, default: () => ({}) },
  notificationPreferences: { type: notificationPreferencesSchema, default: () => ({}) },
}, { timestamps: true });

userSchema.pre('validate', function () {
  if (!this.name && this.fullName) this.name = this.fullName;
  if (!this.fullName && this.name) this.fullName = this.name;
  if (!this.password && !this.passwordHash) this.invalidate('password', 'A password hash is required.');
});

userSchema.pre('save', async function () {
  if (this.isModified('password') && this.password && !/^\$2[aby]\$\d\d\$/.test(this.password)) {
    this.password = await bcrypt.hash(this.password, 10);
    this.passwordHash = this.password;
  }
  if (this.isModified('name') && !this.isModified('fullName')) this.fullName = this.name;
  if (this.isModified('fullName') && !this.isModified('name')) this.name = this.fullName;
});

userSchema.pre('findOneAndUpdate', function () {
  const update = this.getUpdate() || {};
  const fields = update.$set || update;
  if (fields.name !== undefined && fields.fullName === undefined) fields.fullName = fields.name;
  if (fields.fullName !== undefined && fields.name === undefined) fields.name = fields.fullName;
  this.setUpdate(update);
});

userSchema.methods.comparePassword = function (plain) {
  const stored = this.passwordHash || this.password;
  return stored ? bcrypt.compare(plain, stored) : Promise.resolve(false);
};

userSchema.set('toJSON', {
  transform(_doc, ret) {
    delete ret.password;
    delete ret.passwordHash;
    return ret;
  },
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);
