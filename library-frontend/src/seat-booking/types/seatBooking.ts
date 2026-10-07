export type RoomCategory =
  | 'all'
  | 'silent-study'
  | 'discussion-pod'
  | 'group-hub'
  | 'special-needs';

export type RoomStatusType = 'open' | 'normal' | 'crowded';

export interface Room {
  _id: string;
  code: string;
  name: string;
  level: number;
  category: RoomCategory;
  totalSeats: number;
  openSeats: number;
  occupiedSeats: number;
  floorDensity: number;
  amenities: string[];
  footerNote?: string;
  iconName?: string;
  statusType: RoomStatusType;
  isActive?: boolean;
}

export interface CampusDensity {
  occupiedPercent: number;
  openSeats: number;
  statusLabel: string;
  buildingName: string;
}

export interface FilterTabOption {
  id: RoomCategory;
  label: string;
}

export type SeatStatus = 'available' | 'taken' | 'chosen' | 'reserved';
export type DateOption = 'today' | 'tomorrow';

export interface SeatItem {
  _id: string;
  seatNumber: string; // e.g. "A-01", "B-14"
  pod: string; // e.g. "POD A", "POD B"
  status: SeatStatus;
  powerSocket?: string;
  usbPort?: string;
  acoustics?: string;
}

export interface PodSection {
  podName: string;
  seatRangeLabel: string;
  subtitle: string;
  badge?: string;
  seats: SeatItem[];
}

export interface TimeSlotOption {
  id: string;
  timeRange: string; // e.g. "10:30 AM – 12:30 PM"
  tagline: string; // e.g. "Peak Focus Block • 2.0 hrs"
  status: 'active' | 'open' | 'full';
}

export interface BookItem {
  id: string;
  title: string;
  author: string;
  edition: string;
  stack: string;
  shelf: string;
}

export interface ReservationItem {
  _id: string;
  seatNumber: string;
  roomName: string;
  roomLevel: number;
  roomCode: string;
  dateLabel: string;
  timeRange: string;
  durationLabel: string;
  amenitiesLabel: string;
  status: 'upcoming' | 'checked-in' | 'completed' | 'cancelled';
  passCode: string;
  startsInLabel?: string;
  deskDeliveryBook?: string;
}
