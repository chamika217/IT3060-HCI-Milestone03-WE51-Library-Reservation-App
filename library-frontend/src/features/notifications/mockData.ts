// ─── Mock notification data ───────────────────────────────────────────────────
// Swap the `MOCK_NOTIFICATIONS` array for a real
// `fetch('/api/notifications').then(r => r.json())` call to go live.

import { Notification } from './types';

// Design-system accent colours (kept here so imports stay local)
export const COLORS = {
  primaryBlue: '#2D7CE9',
  darkText: '#1C283B',
  background: '#F5F7F7',
  card: '#FAFBFB',
  border: '#DDE2E6',
  secondaryText: '#6C7886',
  successGreen: '#25B87A',
  warningOrange: '#F7A35C',
  errorRed: '#F04F55',
  infoBlue: '#2D7CE9',
} as const;

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n-001',
    type: 'hold_ready',
    status: 'unread',
    title: 'Book Hold Ready for Pickup',
    subtitle: 'Introduction to Algorithms • 4th Ed.',
    timestamp: '45m ago',
    accentColor: COLORS.primaryBlue,
    detail: {
      bookTitle: 'Introduction to Algorithms',
      bookAuthor: 'Cormen, Leiserson, Rivest, Stein',
      isbn: '978-0-262-04630-5',
      pickupLocation: 'Main Circulation Desk',
      holdShelf: 'Hold Shelf B-14',
      holdExpiry: 'Oct 07, 2026',
      daysRemaining: 3,
      barcodeValue: 'LIB-2026-BCR-00427',
    },
  },
  {
    id: 'n-002',
    type: 'seat_expiring',
    status: 'unread',
    title: 'Study Seat Expiring Soon',
    subtitle: 'East Wing Atrium • Seat E-07',
    timestamp: '12m ago',
    accentColor: COLORS.warningOrange,
    quickAction: 'Extend +1h',
    detail: {
      roomName: 'East Wing Atrium',
      seatNumber: 'E-07',
      expiresAt: '2:15 PM',
      minutesRemaining: 15,
    },
  },
  {
    id: 'n-003',
    type: 'seat_released',
    status: 'read',
    title: 'Seat Auto-Released',
    subtitle: 'Media Pod M-03 • Level 1',
    timestamp: '2h ago',
    accentColor: COLORS.errorRed,
    detail: {
      roomName: 'Media Pods',
      seatNumber: 'M-03',
      body: 'Your seat reservation expired and has been released back to the pool. Book a new seat to continue your session.',
    },
  },
  {
    id: 'n-004',
    type: 'system_info',
    status: 'unread',
    title: 'Library Hours Extended',
    subtitle: 'Main Floor open until Midnight tonight',
    timestamp: '3h ago',
    accentColor: COLORS.infoBlue,
    detail: {
      body: 'Due to upcoming mid-semester assessments, the Main Floor will remain open until midnight from Monday 5 Oct to Friday 9 Oct 2026. Normal closing time resumes on Saturday.',
    },
  },
  {
    id: 'n-005',
    type: 'hold_ready',
    status: 'read',
    title: 'Book Hold Ready for Pickup',
    subtitle: 'Clean Code • Robert C. Martin',
    timestamp: 'Yesterday',
    accentColor: COLORS.primaryBlue,
    detail: {
      bookTitle: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      bookAuthor: 'Robert C. Martin',
      isbn: '978-0-132-35088-4',
      pickupLocation: 'Main Circulation Desk',
      holdShelf: 'Hold Shelf A-02',
      holdExpiry: 'Oct 06, 2026',
      daysRemaining: 2,
      barcodeValue: 'LIB-2026-BCR-00391',
    },
  },
  {
    id: 'n-006',
    type: 'seat_expiring',
    status: 'read',
    title: 'Study Seat Expiring Soon',
    subtitle: 'Quiet Reading Corner • Seat Q-11',
    timestamp: 'Yesterday',
    accentColor: COLORS.warningOrange,
    quickAction: 'Extend +1h',
    detail: {
      roomName: 'Quiet Reading Corner',
      seatNumber: 'Q-11',
      expiresAt: '4:45 PM',
      minutesRemaining: 15,
    },
  },
];

/** Derive unread count from the mock array */
export function getUnreadCount(notifications: Notification[]): number {
  return notifications.filter((n) => n.status === 'unread').length;
}

/** Filter helpers matching the list-screen tabs */
export function filterByTab(
  notifications: Notification[],
  tab: 'all' | 'books' | 'seats' | 'system',
): Notification[] {
  if (tab === 'all') return notifications;
  if (tab === 'books') return notifications.filter((n) => n.type === 'hold_ready');
  if (tab === 'seats')
    return notifications.filter(
      (n) => n.type === 'seat_expiring' || n.type === 'seat_released',
    );
  return notifications.filter((n) => n.type === 'system_info');
}
