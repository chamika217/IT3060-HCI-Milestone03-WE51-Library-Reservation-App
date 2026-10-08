import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';

export type TabName = 'Home' | 'Search' | 'Bookings' | 'Alerts' | 'Profile';

interface SeatBottomNavProps {
  activeTab?: TabName;
  onTabPress?: (tab: TabName) => void;
}

export const SeatBottomNav: React.FC<SeatBottomNavProps> = ({
  activeTab = 'Search',
  onTabPress,
}) => {
  const router = useRouter();

  const tabs: { name: TabName; icon: keyof typeof Ionicons.glyphMap; activeIcon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Home',     icon: 'home-outline',          activeIcon: 'home' },
    { name: 'Search',   icon: 'search-outline',        activeIcon: 'search' },
    { name: 'Bookings', icon: 'calendar-outline',      activeIcon: 'calendar' },
    { name: 'Alerts',   icon: 'notifications-outline', activeIcon: 'notifications' },
    { name: 'Profile',  icon: 'person-outline',        activeIcon: 'person' },
  ];

  const handlePress = (tab: TabName) => {
    // Always navigate to Reading Rooms when Home is tapped
    if (tab === 'Home') {
      router.push('/seats');
      onTabPress?.(tab);
      return;
    }
    onTabPress?.(tab);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = tab.name === activeTab;
        const iconName = isActive ? tab.activeIcon : tab.icon;

        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tabItem}
            onPress={() => handlePress(tab.name)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={iconName}
              size={22}
              color={isActive ? Colors.primary : Colors.textSecondary}
            />
            <Text
              style={[
                styles.tabLabel,
                { color: isActive ? Colors.primary : Colors.textSecondary },
              ]}
            >
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    height: 64,
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 4,
    ...Shadows.card,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 3,
  },
});
