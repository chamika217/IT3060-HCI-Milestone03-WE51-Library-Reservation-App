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

// ─────────────────────────────────────────────────────────────────────────────
// State & Actions
// ─────────────────────────────────────────────────────────────────────────────

interface BookingState {
  bookings: Booking[];
  /** IDs explicitly marked completed (early release / check-out). */
  completedIds: Set<string>;
  /** IDs explicitly cancelled by the user. */
  cancelledIds: Set<string>;
  /** Extra minutes added to a booking beyond its original slot end. */
  extensionMins: Record<string, number>;
}

type BookingAction =
  | { type: 'ADD_BOOKING'; payload: Booking }
  | { type: 'MARK_COMPLETED'; id: string }
  | { type: 'CANCEL_BOOKING'; id: string }
  | { type: 'EXTEND_BOOKING'; id: string; addMinutes: number };

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
    case 'EXTEND_BOOKING': {
      const prev = state.extensionMins[action.id] ?? 0;
      return {
        ...state,
        extensionMins: { ...state.extensionMins, [action.id]: prev + action.addMinutes },
      };
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
   * Add extra minutes to an active booking's effective end time.
   * Cumulative — calling twice adds both deltas.
   */
  extendBooking: (bookingId: string, addMinutes: number) => void;
  /**
   * Returns the effective end time of a booking in wall-clock minutes
   * (hours * 60 + mins), accounting for any extensions.
   * Returns null if the slotId is not found.
   */
  getBookingEndMinutes: (booking: Booking) => number | null;
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
    extensionMins: {},
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

  const extendBooking = useCallback((bookingId: string, addMinutes: number) => {
    dispatch({ type: 'EXTEND_BOOKING', id: bookingId, addMinutes });
  }, []);

  /**
   * Effective end time = slot end + any accumulated extension minutes.
   * Used by the Extend screen to compute countdown and clash windows.
   */
  const getBookingEndMinutes = useCallback(
    (booking: Booking): number | null => {
      const slot = ALL_LIBRARY_SLOTS.find((s) => s.id === booking.slotId);
      if (!slot) return null;
      const base = slot.endHour * 60 + slot.endMin;
      const extra = state.extensionMins[booking.id] ?? 0;
      return base + extra;
    },
    [state.extensionMins]
  );

  /** A booking is "past" when completed or its EFFECTIVE end time has passed. */
  const isPast = useCallback(
    (b: Booking) => {
      if (state.completedIds.has(b.id)) return true;
      if (b.dateOption === 'tomorrow') return false;
      const endMins = getBookingEndMinutes(b);
      if (endMins === null) return false;
      const now = new Date();
      return now.getHours() * 60 + now.getMinutes() >= endMins;
    },
    [state.completedIds, getBookingEndMinutes]
  );

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
      extendBooking,
      getBookingEndMinutes,
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
      extendBooking,
      getBookingEndMinutes,
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
