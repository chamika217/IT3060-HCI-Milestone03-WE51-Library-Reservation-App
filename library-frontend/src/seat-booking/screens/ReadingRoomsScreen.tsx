import { router } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CampusBreadcrumb } from '../components/CampusBreadcrumb';
import { CategoryFilterPills } from '../components/CategoryFilterPills';
import { OverallDensityCard } from '../components/OverallDensityCard';
import { ReadingRoomsHeader } from '../components/ReadingRoomsHeader';
import { RoomCard } from '../components/RoomCard';
import { SeatBottomNav, TabName } from '../components/SeatBottomNav';
import { SeatSearchBar } from '../components/SeatSearchBar';
import { Colors } from '../constants/designSystem';
import { CATEGORY_TABS, MOCK_ROOMS } from '../mock/roomsData';
import { useBookingStore } from '../store/bookingStore';
import { CampusDensity, Room, RoomCategory } from '../types/seatBooking';
import { API_BASE_URL } from '@/services/books-api';

const BACKEND_URL = `${API_BASE_URL}/rooms`;

export default function ReadingRoomsScreen() {
  const { getOccupiedCount } = useBookingStore();

  const [baseRooms] = useState<Room[]>(MOCK_ROOMS);
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabName>('Search');
  const [apiRooms, setApiRooms] = useState<Room[] | null>(null);

  // Fetch rooms from backend API on mount (pull-to-refresh reuses the same logic).
  // setState is only called via the mounted-guard callback, which satisfies the
  // react-hooks/set-state-in-effect rule.
  const fetchRooms = useCallback(() => {
    let active = true;
    fetch(BACKEND_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: any) => {
        if (!active || !Array.isArray(data) || data.length === 0) return;
        const formattedRooms: Room[] = data.map((item: any, idx: number) => ({
          _id: item._id || `api-${idx}`,
          code: item.code || 'L1-STD',
          name: item.name || 'Study Room',
          level: item.level || 1,
          category: item.category || 'silent-study',
          totalSeats: item.totalSeats || 30,
          openSeats: item.totalSeats || 30,
          occupiedSeats: 0,
          floorDensity: 0,
          amenities: item.amenities || ['Wi-Fi', 'Power Outlets'],
          footerNote: item.footerNote || 'Peak: 12:00 - 15:00',
          iconName: item.iconName || 'bookmark-outline',
          statusType: 'open' as const,
        }));
        setApiRooms(formattedRooms);
      })
      .catch(() => {/* silently fall back to mock data */});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const cleanup = fetchRooms();
    return cleanup;
  }, [fetchRooms]);

  const onRefresh = async () => {
    setRefreshing(true);
    fetchRooms();
    setRefreshing(false);
  };

  /**
   * Merge API data (if available) with the booking store to produce live room
   * objects with accurate occupancy fields.
   */
  const rooms: Room[] = useMemo(() => {
    const source = apiRooms ?? baseRooms;
    return source.map((room) => {
      const occupied = getOccupiedCount(room.code);
      const total = room.totalSeats;
      const open = Math.max(0, total - occupied);
      const density = total > 0 ? Math.round((occupied / total) * 100) : 0;
      const statusType: Room['statusType'] =
        density >= 85 ? 'crowded' : density >= 50 ? 'normal' : 'open';
      return { ...room, occupiedSeats: occupied, openSeats: open, floorDensity: density, statusType };
    });
  }, [apiRooms, baseRooms, getOccupiedCount]);

  /** Campus-wide density aggregated from all rooms dynamically. */
  const density: CampusDensity = useMemo(() => {
    const totalCapacity = rooms.reduce((sum, r) => sum + r.totalSeats, 0);
    const totalOccupied = rooms.reduce((sum, r) => sum + r.occupiedSeats, 0);
    const occupiedPercent = totalCapacity > 0 ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    const openSeats = totalCapacity - totalOccupied;
    const statusLabel =
      occupiedPercent >= 85 ? 'Crowded' : occupiedPercent >= 50 ? 'Moderate' : 'Active';
    return {
      occupiedPercent,
      openSeats,
      statusLabel,
      buildingName: 'Live occupancy across Malabe Main Library Complex New Building.',
    };
  }, [rooms]);

  // Filter rooms based on selected category tab & search query
  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesCategory =
        selectedCategory === 'all' || room.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        room.name.toLowerCase().includes(q) ||
        room.code.toLowerCase().includes(q) ||
        `level ${room.level}`.includes(q) ||
        room.amenities.some((a) => a.toLowerCase().includes(q));

      return matchesCategory && matchesQuery;
    });
  }, [rooms, selectedCategory, searchQuery]);

  const handleViewSeatMap = (room: Room) => {
    router.push({
      pathname: '/seats/matrix',
      params: {
        roomCode: room.code,
        roomName: room.name,
      },
    });
  };

  const handleActionPress = (room: Room) => {
    router.push({
      pathname: '/seats/matrix',
      params: {
        roomCode: room.code,
        roomName: room.name,
      },
    });
  };

  const handleTabPress = (tab: TabName) => {
    setActiveTab(tab);
    if (tab === 'Bookings') {
      router.push('/seats/my-bookings');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      {/* Top Header */}
      <ReadingRoomsHeader
        onNotificationPress={() => Alert.alert('Notifications', 'No new alerts.')}
        onProfilePress={() => Alert.alert('Profile', 'Student Account #2026-IT')}
      />

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Breadcrumb & Title */}
        <CampusBreadcrumb
          onBackPress={() => Alert.alert('Back', 'Returning to main campus menu.')}
        />

        {/* Overall Campus Density Card */}
        <OverallDensityCard data={density} />

        {/* Search Bar */}
        <SeatSearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={() => setSearchQuery('')}
        />

        {/* Filter Pills */}
        <CategoryFilterPills
          tabs={CATEGORY_TABS}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />

        {/* Available Rooms Section Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>AVAILABLE ROOMS</Text>
          <Text style={styles.sectionHint}>Tap card to view map</Text>
        </View>

        {/* Rooms Cards List */}
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <RoomCard
              key={room._id}
              room={room}
              onViewSeatMap={handleViewSeatMap}
              onActionPress={handleActionPress}
            />
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No matching study spaces found</Text>
            <Text style={styles.emptySubtitle}>
              Try tweaking your search keywords or switching category filters.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom Nav Bar */}
      <SeatBottomNav activeTab={activeTab} onTabPress={handleTabPress} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  sectionHint: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});
