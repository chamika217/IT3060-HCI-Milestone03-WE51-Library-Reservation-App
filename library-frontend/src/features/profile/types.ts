// ─── Profile domain types ─────────────────────────────────────────────────────
// Swap mock data for real GET /api/users/profile responses.

export interface ProfileStats {
  holdings: number;
  bookings: number;
  alerts: number;
}

export interface UpcomingSession {
  roomName: string;
  floor: string;
  seatNumber: string;
  timeRange: string;
  date: string;
}

/** Shape returned by GET /api/users/profile */
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  program: string;
  semester: string;
  avatarInitials: string;   // e.g. "AS" — shown until real photo upload works
  isEmailVerified: boolean;
  stats: ProfileStats;
  upcomingSession?: UpcomingSession;
  /** ISO-8601 — last password change */
  passwordLastChanged: string;
}

/** Shape sent to PUT /api/users/profile */
export interface ProfileUpdatePayload {
  fullName: string;
  phone: string;
}

/** Shape sent to POST /api/contact */
export interface ContactMessagePayload {
  fullName: string;
  studentId: string;
  subject: string;
  message: string;
  /** base64 data URI or file path */
  attachment?: string;
}

export type ContactSubject =
  | 'Book Reservation'
  | 'Seat Booking'
  | 'Account Issue'
  | 'General Inquiry';

export const CONTACT_SUBJECTS: ContactSubject[] = [
  'Book Reservation',
  'Seat Booking',
  'Account Issue',
  'General Inquiry',
];
