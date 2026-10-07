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
import { CATEGORY_TABS, INITIAL_CAMPUS_DENSITY, MOCK_ROOMS } from '../mock/roomsData';
import { CampusDensity, Room, RoomCategory } from '../types/seatBooking';

const BACKEND_URL = 'http://localhost:5000/api/rooms';

export default function ReadingRoomsScreen() {
  const [rooms, setRooms] = useState<Room[]>(MOCK_ROOMS);
  const [density] = useState<CampusDensity>(INITIAL_CAMPUS_DENSITY);
  const [selectedCategory, setSelectedCategory] = useState<RoomCategory>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabName>('Search');

  // Fetch rooms from backend API if available, else retain mock data
  const fetchRooms = useCallback(async () => {
    try {
      const response = await fetch(BACKEND_URL);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const formattedRooms: Room[] = data.map((item: any, idx: number) => ({
            _id: item._id || `api-${idx}`,
            code: item.code || 'L1-STD',
            name: item.name || 'Study Room',
            level: item.level || 1,
            category: item.category || 'silent-study',
            totalSeats: item.totalSeats || 30,
            openSeats: item.openSeats ?? Math.floor((item.totalSeats || 30) * 0.7),
            occupiedSeats: item.occupiedSeats ?? Math.floor((item.totalSeats || 30) * 0.3),
            floorDensity: item.floorDensity ?? 65,
            amenities: item.amenities || ['Wi-Fi', 'Power Outlets'],
            footerNote: item.footerNote || 'Peak: 12:00 - 15:00',
            iconName: item.iconName || 'bookmark-outline',
            statusType: item.statusType || 'open',
          }));
          setRooms(formattedRooms);
        }
      }
    } catch {
      // Fallback silently to initial mock data if API is offline
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    fetch(BACKEND_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          const formattedRooms: Room[] = data.map((item: any, idx: number) => ({
            _id: item._id || `api-${idx}`,
            code: item.code || 'L1-STD',
            name: item.name || 'Study Room',
            level: item.level || 1,
            category: item.category || 'silent-study',
            totalSeats: item.totalSeats || 30,
            openSeats: item.openSeats ?? Math.floor((item.totalSeats || 30) * 0.7),
            occupiedSeats: item.occupiedSeats ?? Math.floor((item.totalSeats || 30) * 0.3),
            floorDensity: item.floorDensity ?? 65,
            amenities: item.amenities || ['Wi-Fi', 'Power Outlets'],
            footerNote: item.footerNote || 'Peak: 12:00 - 15:00',
            iconName: item.iconName || 'bookmark-outline',
            statusType: item.statusType || 'open',
          }));
          setRooms(formattedRooms);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRooms();
    setRefreshing(false);
  };

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
    Alert.alert(
      `Seat Map - ${room.code}`,
      `Navigating to interactive floor plan for ${room.name} (${room.openSeats} seats available).`,
      [{ text: 'OK' }]
    );
  };

  const handleActionPress = (room: Room) => {
    Alert.alert(
      `Room Info`,
      `${room.name} on Level ${room.level}. Total capacity: ${room.totalSeats} seats.`,
      [{ text: 'Close' }]
    );
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
      <SeatBottomNav activeTab={activeTab} onTabPress={setActiveTab} />
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
