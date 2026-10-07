import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';
import { Room } from '../types/seatBooking';

interface RoomCardProps {
  room: Room;
  onViewSeatMap?: (room: Room) => void;
  onActionPress?: (room: Room) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onViewSeatMap,
  onActionPress,
}) => {
  // Determine badge colors based on statusType or openSeats
  const getBadgeStyle = () => {
    if (room.statusType === 'crowded' || room.floorDensity >= 85) {
      return {
        bg: Colors.errorSoft,
        text: Colors.error,
        label: `${room.code} • ${room.occupiedSeats}/${room.totalSeats} Seats Crowded`,
      };
    }
    if (room.statusType === 'open' || room.floorDensity <= 30) {
      return {
        bg: Colors.successSoft,
        text: Colors.success,
        label: `${room.code} • ${room.openSeats}/${room.totalSeats} Seats Open`,
      };
    }
    return {
      bg: Colors.neutralSoft,
      text: Colors.textDark,
      label: `${room.code} • ${room.openSeats}/${room.totalSeats} Seats Open`,
    };
  };

  const getProgressColor = () => {
    if (room.floorDensity >= 85) return Colors.error;
    if (room.floorDensity <= 30) return Colors.success;
    return Colors.primary;
  };

  const badge = getBadgeStyle();
  const progressColor = getProgressColor();

  // Icon mapping for amenities
  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wi-fi')) return 'wifi-outline';
    if (lower.includes('power')) return 'flash-outline';
    if (lower.includes('ac')) return 'snow-outline';
    if (lower.includes('silence')) return 'volume-mute-outline';
    if (lower.includes('whiteboard')) return 'create-outline';
    if (lower.includes('screen')) return 'tv-outline';
    if (lower.includes('staff')) return 'people-outline';
    if (lower.includes('reference')) return 'book-outline';
    if (lower.includes('chair')) return 'fitness-outline';
    if (lower.includes('locker')) return 'key-outline';
    return 'checkmark-circle-outline';
  };

  // Top right icon mapping
  const getActionIconName = () => {
    if (room.iconName) return room.iconName as any;
    if (room.code.includes('NORTH')) return 'volume-mute-outline';
    if (room.code.includes('CENTRAL')) return 'bookmark-outline';
    if (room.code.includes('SOUTH')) return 'chatbubbles-outline';
    return 'archive-outline';
  };

  // Footer note icon mapping
  const getFooterIconName = () => {
    if (!room.footerNote) return 'information-circle-outline';
    const lower = room.footerNote.toLowerCase();
    if (lower.includes('peak')) return 'time-outline';
    if (lower.includes('light')) return 'sunny-outline';
    if (lower.includes('staff')) return 'shield-checkmark-outline';
    return 'volume-medium-outline';
  };

  return (
    <View style={styles.cardContainer}>
      {/* Top Badge & Action Icon */}
      <View style={styles.topRow}>
        <View style={[styles.badgePill, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>
            {badge.label}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.actionIconButton}
          onPress={() => onActionPress?.(room)}
          activeOpacity={0.7}
        >
          <Ionicons
            name={getActionIconName()}
            size={18}
            color={Colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Room Title & Location */}
      <Text style={styles.roomName}>{room.name}</Text>
      <Text style={styles.locationText}>
        Level {room.level} • Library Learning commons
      </Text>

      {/* Amenities Tags Row */}
      <View style={styles.amenitiesRow}>
        {room.amenities.map((item, index) => (
          <View key={index} style={styles.amenityTag}>
            <Ionicons
              name={getAmenityIcon(item)}
              size={13}
              color={Colors.primary}
            />
            <Text style={styles.amenityText}>{item}</Text>
          </View>
        ))}
      </View>

      {/* Floor Density Progress Bar */}
      <View style={styles.densitySection}>
        <View style={styles.densityRow}>
          <Text style={styles.densityLabel}>Floor Density</Text>
          <Text style={[styles.densityPercent, { color: progressColor }]}>
            {room.floorDensity}% Occupied
          </Text>
        </View>

        <View style={styles.densityTrack}>
          <View
            style={[
              styles.densityFill,
              { width: `${room.floorDensity}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
      </View>

      {/* Footer Info & View Seat Map Link */}
      <View style={styles.footerRow}>
        <View style={styles.footerNoteGroup}>
          <Ionicons
            name={getFooterIconName()}
            size={14}
            color={Colors.textSecondary}
          />
          <Text style={styles.footerNoteText}>{room.footerNote || 'Available Now'}</Text>
        </View>

        <TouchableOpacity
          style={styles.seatMapButton}
          onPress={() => onViewSeatMap?.(room)}
          activeOpacity={0.7}
        >
          <Text style={styles.seatMapText}>View Seat Map</Text>
          <Ionicons name="arrow-forward" size={14} color={Colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    padding: 16,
    marginBottom: 16,
    marginHorizontal: 20,
    ...Shadows.card,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  badgePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionIconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F3F5F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomName: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  locationText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  amenityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.searchBg,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  amenityText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  densitySection: {
    marginBottom: 14,
  },
  densityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  densityLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  densityPercent: {
    fontSize: 12,
    fontWeight: '700',
  },
  densityTrack: {
    height: 7,
    backgroundColor: Colors.trackBg,
    borderRadius: 4,
    overflow: 'hidden',
  },
  densityFill: {
    height: '100%',
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F6',
  },
  footerNoteGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  footerNoteText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  seatMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seatMapText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
});
