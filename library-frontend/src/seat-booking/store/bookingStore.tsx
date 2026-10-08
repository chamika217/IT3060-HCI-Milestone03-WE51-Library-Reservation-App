/**
 * Lightweight in-memory booking store using React Context + useReducer.
 *
 * Responsibilities:
 *  - Hold all confirmed bookings made during the current session.
 *  - Expose addBooking() to record a new reservation.
 *  - Expose cancelBooking() to remove an active booking.
 *  - Expose markCompleted() to move a booking to Past History immediately
 *    (e.g. user releases the seat early or checks out).
 *  - Expose selector helpers so screens can derive live occupancy and history.
 *
 * No persistence (AsyncStorage etc.) is used — this is demo/prototype scope.
 */

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';

import { ALL_LIBRARY_SLOTS } from '../mock/roomsData';
import { Booking, DateOption } from '../types/seatBooking';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns true when a 'today' booking's slot end time has passed.
 * 'tomorrow' bookings are never considered expired by clock alone.
 */
function isSlotExpired(booking: Booking): boolean {
  if (booking.dateOption === 'tomorrow') return false;
  const slot = ALL_LIBRARY_SLOTS.find((s) => s.id === booking.slotId);
  if (!slot) return false;
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const slotEndMinutes = slot.endHour * 60 + slot.endMin;
  return nowMinutes >= slotEndMinutes;
}

// ─────────────────────────────────────────────────────────────────────────────
// State & Actions
// ─────────────────────────────────────────────────────────────────────────────

interface BookingState {
  bookings: Booking[];
  /** IDs explicitly marked completed (early release / check-out). */
  completedIds: Set<string>;
  /** IDs explicitly cancelled by the user. */
  cancelledIds: Set<string>;
}

type BookingAction =
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'MARK_COMPLETED'; id: string }
  | { type: 'CANCEL_BOOKING'; id: string };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'MARK_COMPLETED': {
      const next = new Set(state.completedIds);
      next.add(action.id);
      return { ...state, completedIds: next };
    }
    case 'CANCEL_BOOKING': {
      const next = new Set(state.cancelledIds);
      next.add(action.id);
      return { ...state, cancelledIds: next };
    }
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context value
// ─────────────────────────────────────────────────────────────────────────────

interface BookingContextValue {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  /** Cancel an active booking — removes it from the Active tab. */
  cancelBooking: (bookingId: string) => void;
  /**
   * Mark a booking as completed so it moves to Past History immediately,
   * regardless of whether its time slot has ended.
   */
  markCompleted: (bookingId: string) => void;
  /**
   * Active (non-past, non-cancelled) bookings.
   * These are the items shown in the Active tab.
   */
  getActiveBookings: () => Booking[];
  /** Count of active bookings in a room (drives occupancy %). */
  getOccupiedCount: (roomCode: string) => number;
  /**
   * Returns true if the given seat+slot+date combination is actively booked
   * (not cancelled, not expired, not completed).
   */
  isSeatTaken: (
    roomCode: string,
    seatNumber: string,
    slotId: string,
    dateOption: DateOption
  ) => boolean;
  /**
   * Past History items:
   *   - explicitly marked completed, OR
   *   - 'today' bookings whose slot end time has passed.
   * Cancelled bookings are excluded (they simply vanish).
   */
  getPastBookings: () => Booking[];
}

const BookingContext = createContext<BookingContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function BookingStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, {
    bookings: [],
    completedIds: new Set<string>(),
    cancelledIds: new Set<string>(),
  });

  const addBooking = useCallback((booking: Omit<Booking, 'id'>) => {
    dispatch({
      type: 'ADD_BOOKING',
      payload: { ...booking, id: `bk-${Date.now()}` },
    });
  }, []);

  const cancelBooking = useCallback((bookingId: string) => {
    dispatch({ type: 'CANCEL_BOOKING', id: bookingId });
  }, []);

  const markCompleted = useCallback((bookingId: string) => {
    dispatch({ type: 'MARK_COMPLETED', id: bookingId });
  }, []);

  /** A booking is "past" when completed or its slot has expired. */
  const isPast = useCallback(
    (b: Booking) => state.completedIds.has(b.id) || isSlotExpired(b),
    [state.completedIds]
  );

  /** A booking is visible in the Active tab when it is not cancelled and not past. */
  const isActive = useCallback(
    (b: Booking) => !state.cancelledIds.has(b.id) && !isPast(b),
    [state.cancelledIds, isPast]
  );

  const getActiveBookings = useCallback(
    () => state.bookings.filter(isActive),
    [state.bookings, isActive]
  );

  const getOccupiedCount = useCallback(
    (roomCode: string) =>
      state.bookings.filter((b) => b.roomCode === roomCode && isActive(b)).length,
    [state.bookings, isActive]
  );

  const isSeatTaken = useCallback(
    (roomCode: string, seatNumber: string, slotId: string, dateOption: DateOption) =>
      state.bookings.some(
        (b) =>
          isActive(b) &&
          b.roomCode === roomCode &&
          b.seatNumber === seatNumber &&
          b.slotId === slotId &&
          b.dateOption === dateOption
      ),
    [state.bookings, isActive]
  );

  // Cancelled bookings are silently dropped — they do NOT appear in history.
  const getPastBookings = useCallback(
    () => state.bookings.filter((b) => !state.cancelledIds.has(b.id) && isPast(b)),
    [state.bookings, state.cancelledIds, isPast]
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      bookings: state.bookings,
      addBooking,
      cancelBooking,
      markCompleted,
      getActiveBookings,
      getOccupiedCount,
      isSeatTaken,
      getPastBookings,
    }),
    [
      state.bookings,
      addBooking,
      cancelBooking,
      markCompleted,
      getActiveBookings,
      getOccupiedCount,
      isSeatTaken,
      getPastBookings,
    ]
  );

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useBookingStore(): BookingContextValue {
  const ctx = useContext(BookingContext);
  if (!ctx) {
    throw new Error('useBookingStore must be used inside <BookingStoreProvider>');
  }
  return ctx;
}
