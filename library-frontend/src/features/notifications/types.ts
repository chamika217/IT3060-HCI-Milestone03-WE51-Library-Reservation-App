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
