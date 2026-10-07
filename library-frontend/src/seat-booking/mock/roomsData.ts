import {
  BookItem,
  CampusDensity,
  FilterTabOption,
  PodSection,
  ReservationItem,
  Room,
  TimeSlotOption,
} from '../types/seatBooking';

export const INITIAL_CAMPUS_DENSITY: CampusDensity = {
  occupiedPercent: 58,
  openSeats: 94,
  statusLabel: 'Active',
  buildingName: 'Live occupancy across Malabe Main Library Complex New Building.',
};

export const CATEGORY_TABS: FilterTabOption[] = [
  { id: 'all', label: 'All Rooms' },
  { id: 'silent-study', label: 'Silent Study' },
  { id: 'discussion-pod', label: 'Discussion Pods' },
  { id: 'group-hub', label: 'Group Hub' },
  { id: 'special-needs', label: 'Special Needs' },
];

export const MOCK_ROOMS: Room[] = [
  {
    _id: 'mock-1',
    code: 'L2-NORTH',
    name: 'Individual Study',
    level: 1,
    category: 'silent-study',
    totalSeats: 60,
    openSeats: 42,
    occupiedSeats: 18,
    floorDensity: 70,
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
    openSeats: 18,
    occupiedSeats: 22,
    floorDensity: 55,
    amenities: ['Wi-Fi', 'Power Outlets', 'AC 22°C'],
    footerNote: 'Optimal Light: Now',
    iconName: 'bookmark-outline',
    statusType: 'normal',
  },
  {
    _id: 'mock-3',
    code: 'L1-SOUTH',
    name: 'Group Collaborative Hub',
    level: 2,
    category: 'group-hub',
    totalSeats: 24,
    openSeats: 6,
    occupiedSeats: 18,
    floorDensity: 25,
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
    openSeats: 2,
    occupiedSeats: 28,
    floorDensity: 93,
    amenities: ['Reference', 'Ergonomic Chairs', 'Lockers'],
    footerNote: 'Moderate Audio Zone',
    iconName: 'archive-outline',
    statusType: 'crowded',
  },
];

export const MOCK_POD_SECTIONS: PodSection[] = [
  {
    podName: 'POD A',
    seatRangeLabel: 'SEATS 1-6',
    subtitle: 'Carrels 01-06',
    seats: [
      { _id: 's1', seatNumber: 'A-01', pod: 'POD A', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's2', seatNumber: 'A-02', pod: 'POD A', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's3', seatNumber: 'A-03', pod: 'POD A', status: 'reserved', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's4', seatNumber: 'A-04', pod: 'POD A', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's5', seatNumber: 'A-05', pod: 'POD A', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's6', seatNumber: 'A-06', pod: 'POD A', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
    ],
  },
  {
    podName: 'POD B',
    seatRangeLabel: 'SEATS 7-12',
    subtitle: 'Desks 07-12',
    seats: [
      { _id: 's7', seatNumber: 'B-07', pod: 'POD B', status: 'taken', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's8', seatNumber: 'B-08', pod: 'POD B', status: 'taken', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's9', seatNumber: 'B-09', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's10', seatNumber: 'B-10', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's11', seatNumber: 'B-11', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's12', seatNumber: 'B-12', pod: 'POD B', status: 'reserved', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
    ],
  },
  {
    podName: 'POD B',
    seatRangeLabel: 'SEATS 13-18',
    subtitle: '',
    badge: 'Silent 35 dB',
    seats: [
      { _id: 's13', seatNumber: 'B-13', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's14', seatNumber: 'B-14', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's15', seatNumber: 'B-15', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's16', seatNumber: 'B-16', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's17', seatNumber: 'B-17', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
      { _id: 's18', seatNumber: 'B-18', pod: 'POD B', status: 'available', powerSocket: '230V Socket', usbPort: '65W Type-C', acoustics: 'Silent Zone' },
    ],
  },
];

// Library opening hours: 8:00 AM – 8:00 PM (08:00 – 20:00)
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
  { id: 't-0800', startHour: 8, startMin: 0, endHour: 10, endMin: 0, timeRange: '08:00 AM – 10:00 AM', tagline: 'Early Morning Block • 2.0 hrs' },
  { id: 't-1000', startHour: 10, startMin: 0, endHour: 12, endMin: 0, timeRange: '10:00 AM – 12:00 PM', tagline: 'Mid-Morning Window • 2.0 hrs' },
  { id: 't-1030', startHour: 10, startMin: 30, endHour: 12, endMin: 30, timeRange: '10:30 AM – 12:30 PM', tagline: 'Peak Focus Block • 2.0 hrs' },
  { id: 't-1230', startHour: 12, startMin: 30, endHour: 14, endMin: 30, timeRange: '12:30 PM – 02:30 PM', tagline: 'Midday Window • 2.0 hrs' },
  { id: 't-1430', startHour: 14, startMin: 30, endHour: 16, endMin: 30, timeRange: '02:30 PM – 04:30 PM', tagline: 'Afternoon Block • 2.0 hrs' },
  { id: 't-1630', startHour: 16, startMin: 30, endHour: 18, endMin: 30, timeRange: '04:30 PM – 06:30 PM', tagline: 'Evening Session • 2.0 hrs' },
  { id: 't-1800', startHour: 18, startMin: 0, endHour: 20, endMin: 0, timeRange: '06:00 PM – 08:00 PM', tagline: 'Late Focus Window • 2.0 hrs' },
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

    return {
      id: slot.id,
      timeRange: slot.timeRange,
      tagline: slot.tagline,
      status: status,
    };
  });
}

export const MOCK_TIME_SLOTS: TimeSlotOption[] = getCalculatedTimeSlots('today');

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

