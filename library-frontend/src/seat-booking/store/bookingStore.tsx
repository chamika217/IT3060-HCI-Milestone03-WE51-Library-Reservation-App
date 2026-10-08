/**
 * Lightweight in-memory booking store using React Context + useReducer.
 *
 * Responsibilities:
 *  - Hold all confirmed bookings made during the current session.
 *  - Expose addBooking() to record a new reservation.
 *  - Expose markCompleted() to immediately move a booking to the past-history
 *    list (e.g. user releases the seat early or checks out).
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
 * Returns true when the booking's time slot has already ended.
 * For 'today' bookings we compare against the current wall-clock time.
 * For 'tomorrow' bookings the slot can never be in the past (from today's
 * perspective), unless explicitly completed.
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
  /** IDs of bookings explicitly marked completed (e.g. early release). */
  completedIds: Set<string>;
}

type BookingAction =
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'MARK_COMPLETED'; id: string };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'ADD_BOOKING':
      return { ...state, bookings: [...state.bookings, action.payload] };
    case 'MARK_COMPLETED': {
      const next = new Set(state.completedIds);
      next.add(action.id);
      return { ...state, completedIds: next };
    }
    default:
      return state;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

interface BookingContextValue {
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  /**
   * Mark a booking as completed so it moves to Past History immediately,
   * regardless of whether its time slot has ended.
   */
  markCompleted: (bookingId: string) => void;
  /** Count of bookings in a room that are NOT yet past/completed. */
  getOccupiedCount: (roomCode: string) => number;
  /**
   * Returns true if the given seat+slot+date combination is already booked
   * AND has not yet expired or been completed.
   */
  isSeatTaken: (
    roomCode: string,
    seatNumber: string,
    slotId: string,
    dateOption: DateOption
  ) => boolean;
  /**
   * Returns all bookings that belong in Past History:
   *   - explicitly marked completed, OR
   *   - 'today' booking whose slot end time has passed.
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
  });

  const addBooking = useCallback((booking: Omit<Booking, 'id'>) => {
    dispatch({
      type: 'ADD_BOOKING',
      payload: { ...booking, id: `bk-${Date.now()}` },
    });
  }, []);

  const markCompleted = useCallback((bookingId: string) => {
    dispatch({ type: 'MARK_COMPLETED', id: bookingId });
  }, []);

  /** A booking is "past" if it was explicitly completed OR its slot has ended. */
  const isPast = useCallback(
    (b: Booking) => state.completedIds.has(b.id) || isSlotExpired(b),
    [state.completedIds]
  );

  const getOccupiedCount = useCallback(
    (roomCode: string) =>
      state.bookings.filter((b) => b.roomCode === roomCode && !isPast(b)).length,
    [state.bookings, isPast]
  );

  const isSeatTaken = useCallback(
    (
      roomCode: string,
      seatNumber: string,
      slotId: string,
      dateOption: DateOption
    ) =>
      state.bookings.some(
        (b) =>
          !isPast(b) &&
          b.roomCode === roomCode &&
          b.seatNumber === seatNumber &&
          b.slotId === slotId &&
          b.dateOption === dateOption
      ),
    [state.bookings, isPast]
  );

  const getPastBookings = useCallback(
    () => state.bookings.filter(isPast),
    [state.bookings, isPast]
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      bookings: state.bookings,
      addBooking,
      markCompleted,
      getOccupiedCount,
      isSeatTaken,
      getPastBookings,
    }),
    [state.bookings, addBooking, markCompleted, getOccupiedCount, isSeatTaken, getPastBookings]
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
