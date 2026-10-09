const emailMessage = 'Use a valid email ending in @my.sliit.lk or @gmail.com.';
function validRegistrationEmail(value) {
  if (typeof value !== 'string') return false;
  const email = value.trim();
  return email.length <= 254 && /^[^\s@]+@(my\.sliit\.lk|gmail\.com)$/i.test(email);
}
module.exports = { validRegistrationEmail, emailMessage };
