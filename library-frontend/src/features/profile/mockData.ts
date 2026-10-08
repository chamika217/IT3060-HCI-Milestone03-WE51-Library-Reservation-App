// ─── Mock profile data ────────────────────────────────────────────────────────
// Replace MOCK_PROFILE with:
//   const profile = await fetch('/api/users/profile').then(r => r.json())

import { UserProfile } from './types';

export const MOCK_PROFILE: UserProfile = {
  id: 'usr-204918',
  fullName: 'Ashan Senanayake',
  email: 'ashan.s@university.edu.lk',
  phone: '+94 77 123 4567',
  studentId: '204918',
  program: 'BSc Computer Science',
  semester: 'Semester II',
  avatarInitials: 'AS',
  isEmailVerified: true,
  passwordLastChanged: '2026-09-04T08:00:00.000Z',
  stats: {
    holdings: 3,
    bookings: 7,
    alerts: 2,
  },
  upcomingSession: {
    roomName: 'Quiet Pod Q-4',
    floor: 'Level 2',
    seatNumber: 'Seat 4',
    timeRange: '2:00 PM – 4:00 PM',
    date: 'Today',
  },
};

/** FAQ items used on the Help screen */
export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export const MOCK_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'How do I reserve a book?',
    answer:
      'Browse the Library Catalog from the Search tab. Tap a title, then tap "Reserve" on the book detail page. You will receive a push notification when your hold is ready for collection at the Main Circulation Desk.',
  },
  {
    id: 'faq-2',
    question: 'How do I book a study room?',
    answer:
      'Go to the Bookings tab and select "Book a Study Room". Choose a date, time slot, and room type. Bookings can be made up to 7 days in advance and are limited to 2 hours per session per day.',
  },
  {
    id: 'faq-3',
    question: 'Can I cancel my reservation?',
    answer:
      'Yes. Open My Reservations from your Profile, tap the active booking, and select "Cancel Reservation". Cancellations made at least 30 minutes before the session start time will not count against your booking limit.',
  },
  {
    id: 'faq-4',
    question: 'How do I get or renew a library card?',
    answer:
      'New students receive a digital library card automatically upon enrolment. To renew a lapsed card, visit the Main Circulation Desk on Floor 1 with your student ID, or raise a request through Help & Support → Contact Library Staff.',
  },
];
