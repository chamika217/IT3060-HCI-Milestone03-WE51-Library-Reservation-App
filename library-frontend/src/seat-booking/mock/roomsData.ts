import {
  BookItem,
  CampusDensity,
  FilterTabOption,
  PodSection,
  ReservationItem,
  Room,
  SeatItem,
  TimeSlotOption,
} from '../types/seatBooking';

// ─────────────────────────────────────────────────────────────────────────────
// Campus density — baseline (0 bookings). ReadingRoomsScreen derives a live
// version from the BookingStore; this constant is no longer the source of truth.
// ─────────────────────────────────────────────────────────────────────────────
export const INITIAL_CAMPUS_DENSITY: CampusDensity = {
  occupiedPercent: 0,
  openSeats: 154, // 60 + 40 + 24 + 30
  statusLabel: 'Active',
  buildingName: 'Live occupancy across Malabe Main Library Complex New Building.',
};

// ─────────────────────────────────────────────────────────────────────────────
// Filter tabs
// ─────────────────────────────────────────────────────────────────────────────
export const CATEGORY_TABS: FilterTabOption[] = [
  { id: 'all',            label: 'All Rooms' },
  { id: 'silent-study',   label: 'Silent Study' },
  { id: 'discussion-pod', label: 'Discussion Pods' },
  { id: 'group-hub',      label: 'Group Hub' },
  { id: 'special-needs',  label: 'Special Needs' },
];

// ─────────────────────────────────────────────────────────────────────────────
// Baseline rooms — all seats start at 0 occupied.
// floorDensity, openSeats, and occupiedSeats are re-computed dynamically in
// ReadingRoomsScreen using the BookingStore. These values are the clean start.
// ─────────────────────────────────────────────────────────────────────────────
export const MOCK_ROOMS: Room[] = [
  {
    _id: 'mock-1',
    code: 'L2-NORTH',
    name: 'Individual Study',
    level: 1,
    category: 'silent-study',
    totalSeats: 60,
    openSeats: 60,
    occupiedSeats: 0,
    floorDensity: 0,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 21°C', 'Strict Silence'],
    footerNote: 'Peak: 13:00 - 16:00',
    iconName: 'volume-mute-outline',
    statusType: 'open',
  },
  {
    _id: 'mock-2',
    code: 'L3-CENTRAL',
    name: 'Reading and Study Area',
    level: 3,
    category: 'discussion-pod',
    totalSeats: 40,
    openSeats: 40,
    occupiedSeats: 0,
    floorDensity: 0,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 22°C'],
    footerNote: 'Optimal Light: Now',
    iconName: 'bookmark-outline',
    statusType: 'open',
  },
  {
    _id: 'mock-3',
    code: 'L1-SOUTH',
    name: 'Group Collaborative Hub',
    level: 2,
    category: 'group-hub',
    totalSeats: 24,
    openSeats: 24,
    occupiedSeats: 0,
    floorDensity: 0,
    amenities: ['Whiteboards', 'Screen Share', 'Staff only'],
    footerNote: 'Staff ID Verification',
    iconName: 'chatbubbles-outline',
    statusType: 'open',
  },
  {
    _id: 'mock-4',
    code: 'L4-PENTHOUSE',
    name: 'Special Needs Study Area',
    level: 4,
    category: 'special-needs',
    totalSeats: 30,
    openSeats: 30,
    occupiedSeats: 0,
    floorDensity: 0,
    amenities: ['Reference', 'Ergonomic Chairs', 'Lockers'],
    footerNote: 'Moderate Audio Zone',
    iconName: 'archive-outline',
    statusType: 'open',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Dynamic seat grid generation
// ─────────────────────────────────────────────────────────────────────────────

const POD_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const SEATS_PER_POD = 6;

/**
 * Generates PodSection[] for a room based on its totalSeats capacity.
 * Every seat starts as 'available'. SeatMatrixScreen overlays live 'taken'
 * statuses by querying the BookingStore — nothing is hardcoded here.
 */
export function generatePodSections(
  totalSeats: number,
  roomCode: string
): PodSection[] {
  const sections: PodSection[] = [];
  let seatIndex = 0;

  while (seatIndex < totalSeats) {
    const podLetterIndex = Math.floor(seatIndex / SEATS_PER_POD);
    const podLetter = POD_LETTERS[podLetterIndex % POD_LETTERS.length] ?? 'A';
    const podName = `POD ${podLetter}`;
    const rangeStart = seatIndex + 1;
    const rangeEnd = Math.min(seatIndex + SEATS_PER_POD, totalSeats);

    const seats: SeatItem[] = [];
    for (let i = seatIndex; i < rangeEnd; i++) {
      const paddedNum = String(i + 1).padStart(2, '0');
      const seatNumber = `${podLetter}-${paddedNum}`;
      seats.push({
        _id: `${roomCode}-${seatNumber}`,
        seatNumber,
        pod: podName,
        status: 'available',
        powerSocket: '230V Socket',
        usbPort: '65W Type-C',
        acoustics: 'Silent Zone',
      });
    }

    sections.push({
      podName,
      seatRangeLabel: `SEATS ${rangeStart}-${rangeEnd}`,
      subtitle:
        rangeStart <= SEATS_PER_POD
          ? `Carrels ${String(rangeStart).padStart(2, '0')}-${String(rangeEnd).padStart(2, '0')}`
          : '',
      badge: seatIndex >= SEATS_PER_POD * 2 ? 'Silent 35 dB' : undefined,
      seats,
    });

    seatIndex += SEATS_PER_POD;
  }

  return sections;
}

// ─────────────────────────────────────────────────────────────────────────────
// Time slot definitions
// ─────────────────────────────────────────────────────────────────────────────

export interface LibrarySlotDef {
  id: string;
  startHour: number;
  startMin: number;
  endHour: number;
  endMin: number;
  timeRange: string;
  tagline: string;
}

export const ALL_LIBRARY_SLOTS: LibrarySlotDef[] = [
  { id: 't-0800', startHour: 8,  startMin: 0,  endHour: 10, endMin: 0,  timeRange: '08:00 AM – 10:00 AM', tagline: 'Early Morning Block • 2.0 hrs' },
  { id: 't-1000', startHour: 10, startMin: 0,  endHour: 12, endMin: 0,  timeRange: '10:00 AM – 12:00 PM', tagline: 'Mid-Morning Window • 2.0 hrs' },
  { id: 't-1030', startHour: 10, startMin: 30, endHour: 12, endMin: 30, timeRange: '10:30 AM – 12:30 PM', tagline: 'Peak Focus Block • 2.0 hrs' },
  { id: 't-1230', startHour: 12, startMin: 30, endHour: 14, endMin: 30, timeRange: '12:30 PM – 02:30 PM', tagline: 'Midday Window • 2.0 hrs' },
  { id: 't-1430', startHour: 14, startMin: 30, endHour: 16, endMin: 30, timeRange: '02:30 PM – 04:30 PM', tagline: 'Afternoon Block • 2.0 hrs' },
  { id: 't-1630', startHour: 16, startMin: 30, endHour: 18, endMin: 30, timeRange: '04:30 PM – 06:30 PM', tagline: 'Evening Session • 2.0 hrs' },
  { id: 't-1800', startHour: 18, startMin: 0,  endHour: 20, endMin: 0,  timeRange: '06:00 PM – 08:00 PM', tagline: 'Late Focus Window • 2.0 hrs' },
];

export function getCalculatedTimeSlots(dateOption: 'today' | 'tomorrow'): TimeSlotOption[] {
  const now = new Date();
  const currentTotalMinutes = now.getHours() * 60 + now.getMinutes();

  return ALL_LIBRARY_SLOTS.map((slot) => {
    const slotEndMinutes = slot.endHour * 60 + slot.endMin;
    const slotStartMinutes = slot.startHour * 60 + slot.startMin;

    let status: 'active' | 'open' | 'expired' = 'open';

    if (dateOption === 'today') {
      if (currentTotalMinutes >= slotEndMinutes) {
        status = 'expired';
      } else if (currentTotalMinutes >= slotStartMinutes && currentTotalMinutes < slotEndMinutes) {
        status = 'active';
      } else {
        status = 'open';
      }
    } else {
      status = 'open';
    }

    return { id: slot.id, timeRange: slot.timeRange, tagline: slot.tagline, status };
  });
}

export const MOCK_TIME_SLOTS: TimeSlotOption[] = getCalculatedTimeSlots('today');

// ─────────────────────────────────────────────────────────────────────────────
// Other mock data (unchanged)
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_DESK_BOOK: BookItem = {
  id: 'b1',
  title: 'Software Architecture: Foundations',
  author: 'Roger S. Pressman',
  edition: '8th Edition',
  stack: 'STACK 04',
  shelf: 'SHELF 4B',
};

export const MOCK_ACTIVE_RESERVATION: ReservationItem = {
  _id: 'res-8841',
  seatNumber: 'Seat B-14',
  roomName: 'Individual Study Area',
  roomLevel: 1,
  roomCode: 'L2-NORTH',
  dateLabel: 'Today',
  timeRange: '02:30 PM – 04:30 PM',
  durationLabel: '2 Hours Reserved',
  amenitiesLabel: 'AC Outlet + LAN',
  status: 'upcoming',
  passCode: '8841',
  startsInLabel: 'Starts in 22 mins',
  deskDeliveryBook: 'Software Architecture: Foundations',
};
