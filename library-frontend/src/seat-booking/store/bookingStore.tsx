/**
 * Lightweight in-memory booking store using React Context + useReducer.
 *
 * Responsibilities:
 *  - Hold all confirmed bookings made during the current session.
 *  - Expose addBooking() to record a new reservation.
 *  - Expose selector helpers so screens can derive live occupancy without
 *    duplicating logic.
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

import { Booking, DateOption } from '../types/seatBooking';

// ─────────────────────────────────────────────────────────────────────────────
// State & Actions
// ─────────────────────────────────────────────────────────────────────────────

interface BookingState {
  bookings: Booking[];
}

type BookingAction = { type: 'ADD_BOOKING'; payload: Booking };

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'ADD_BOOKING':
      return { bookings: [...state.bookings, action.payload] };
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
  /** Count of unique seats booked in a room (any slot, any date). */
  getOccupiedCount: (roomCode: string) => number;
  /**
   * Returns true if the given seat+slot+date combination is already booked.
   * Used by the seat matrix to mark a cell as 'taken'.
   */
  isSeatTaken: (
    roomCode: string,
    seatNumber: string,
    slotId: string,
    dateOption: DateOption
  ) => boolean;
}

const BookingContext = createContext<BookingContextValue | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────────────────────

export function BookingStoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, { bookings: [] });

  const addBooking = useCallback((booking: Omit<Booking, 'id'>) => {
    dispatch({
      type: 'ADD_BOOKING',
      payload: { ...booking, id: `bk-${Date.now()}` },
    });
  }, []);

  /**
   * Count the number of distinct seat+slot combinations that have been booked
   * in a given room. Each unique (seatNumber + slotId + dateOption) triple
   * counts as one occupied seat-slot. This is what drives the room's
   * occupancy percentage.
   */
  const getOccupiedCount = useCallback(
    (roomCode: string) =>
      state.bookings.filter((b) => b.roomCode === roomCode).length,
    [state.bookings]
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
          b.roomCode === roomCode &&
          b.seatNumber === seatNumber &&
          b.slotId === slotId &&
          b.dateOption === dateOption
      ),
    [state.bookings]
  );

  const value = useMemo<BookingContextValue>(
    () => ({ bookings: state.bookings, addBooking, getOccupiedCount, isSeatTaken }),
    [state.bookings, addBooking, getOccupiedCount, isSeatTaken]
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
