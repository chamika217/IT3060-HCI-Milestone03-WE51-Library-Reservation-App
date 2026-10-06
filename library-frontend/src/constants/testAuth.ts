/**
 * testAuth.ts — TEMPORARY hardcoded credentials for development testing.
 *
 * These values are the seeded test user from `node seed.js`.
 * They let the notification and profile screens hit the real API
 * without a login screen existing yet.
 *
 * TODO: Remove this file once a real login/auth flow is implemented.
 *       Replace all usages with values from a secure auth context or
 *       AsyncStorage after the user logs in.
 *
 * WARNING: Never commit real production credentials here.
 *          This file is dev-only scaffolding.
 */

export const TEST_USER_ID = '6ac4bd23da535e84bd817491';

export const TEST_TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2YWM0YmQyM2RhNTM1ZTg0YmQ4MTc0OTEiLCJpYXQiOjE3OTEyNzk1MjksImV4cCI6MTc5MTg4NDMyOX0.tuGePefLo2PO8eem-5FZaUlykB3SPNjIhToU-p2p9Vc';
