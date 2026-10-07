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
