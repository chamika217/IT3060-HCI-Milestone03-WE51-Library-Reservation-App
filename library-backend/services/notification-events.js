const Notification = require('../models/Notification');
const User = require('../models/User');

module.exports = async function createNotificationEvent(notification) {
  try {
    await Notification.create(notification);
    await User.findByIdAndUpdate(notification.userId, { $inc: { 'stats.alerts': 1 } });
  } catch (error) {
    console.error('Failed to persist a user notification:', error.message);
  }
};
