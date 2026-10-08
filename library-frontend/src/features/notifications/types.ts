// ─── Notification domain types ───────────────────────────────────────────────
// Structured so the mock array is trivially replaceable with
// a real GET /api/notifications response.

export type NotificationType =
  | 'hold_ready'      // Book hold ready for pickup
  | 'seat_expiring'   // Study seat / reading room expiring soon
  | 'seat_released'   // Seat auto-released
  | 'system_info';    // Library system / hours info

export type NotificationStatus =
  | 'unread'
  | 'read'
  | 'action_required';

/** A single notification item returned by the API */
export interface Notification {
  id: string;
  type: NotificationType;
  status: NotificationStatus;
  title: string;
  /** Short context line shown beneath the title in the list */
  subtitle: string;
  /** ISO-8601 timestamp string */
  timestamp: string;
  /** Accent / icon tint for this card — one of the design-system colours */
  accentColor: string;
  /** Optional quick-action label (e.g. "Extend +1h") */
  quickAction?: string;
  /** Additional structured payload used by the detail screen */
  detail?: NotificationDetail;
}

/** Rich detail payload rendered on the [id] screen */
export interface NotificationDetail {
  // Hold-ready specifics
  bookTitle?: string;
  bookAuthor?: string;
  isbn?: string;
  pickupLocation?: string;
  holdShelf?: string;
  holdExpiry?: string;        // human-readable, e.g. "Oct 07, 2026"
  daysRemaining?: number;
  barcodeValue?: string;

  // Seat specifics
  roomName?: string;
  seatNumber?: string;
  expiresAt?: string;         // human-readable time, e.g. "2:15 PM"
  minutesRemaining?: number;

  // System / info specifics
  body?: string;
}

/** Shape of the preferences object posted to PUT /api/notifications/preferences */
export interface NotificationPreferences {
  pushEnabled: boolean;
  bookHolds: boolean;
  seatBookings: boolean;
  dueDateReminders: boolean;
  cancellationNotices: boolean;
  emailSummaries: boolean;
  quietHoursEnabled: boolean;
}

// ─── API request / response types ────────────────────────────────────────────
// These extend the existing domain types with shapes that match the
// actual JSON returned by the Express backend.

/** Returned by POST /api/auth/register and POST /api/auth/login */
export interface AuthResponse {
  token: string;
  user: {
    id: string;
    fullName: string;
    email: string;
    studentId: string;
    role?: string;
  };
}

/** Credentials for POST /api/auth/login */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Credentials for POST /api/auth/register */
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  studentId: string;
  program?: string;
  semester?: string;
}

/** Returned by GET /api/users/:id */
export interface ApiUserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  studentId: string;
  program: string;
  semester: string;
  avatarInitials: string;
  isEmailVerified: boolean;
  role: string;
  stats: {
    holdings: number;
    bookings: number;
    alerts: number;
  };
  notificationPreferences: ApiNotificationPreferences;
  createdAt: string;
}

/** Notification preferences shape stored in the DB / returned by GET /api/users/:id */
export interface ApiNotificationPreferences {
  pushEnabled: boolean;
  bookHolds: boolean;
  seatAlerts: boolean;
  dueDateReminders: boolean;
  cancellationNotices: boolean;
  emailSummaries: boolean;
  quietHoursEnabled: boolean;
}

/** Fields accepted by PUT /api/users/:id */
export interface ProfileUpdatePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  program?: string;
  semester?: string;
}

/** Fields accepted by PUT /api/users/:id/password */
export interface PasswordChangePayload {
  oldPassword: string;
  newPassword: string;
}

/** Body accepted by POST /api/contact */
export interface ContactMessagePayload {
  userId: string;
  subject: 'Book Reservation' | 'Seat Booking' | 'Account Issue' | 'General Inquiry';
  message: string;
  attachmentUrl?: string;
}

/** Shape returned by GET /api/contact/:userId */
export interface ApiContactMessage {
  _id: string;
  userId: string;
  subject: string;
  message: string;
  attachmentUrl: string | null;
  status: 'open' | 'resolved';
  createdAt: string;
}

/** Generic API error shape */
export interface ApiError {
  message: string;
}

// ─── FAQ Feedback types ───────────────────────────────────────────────────────

/** A single FAQ feedback entry returned by GET /api/faq/:userId */
export interface ApiFaqFeedback {
  _id: string;
  userId: string;
  faqId: string;
  helpful: boolean;
  createdAt: string;
}

/** Body accepted by POST /api/faq */
export interface FaqFeedbackPayload {
  faqId: string;
  helpful: boolean;
}
