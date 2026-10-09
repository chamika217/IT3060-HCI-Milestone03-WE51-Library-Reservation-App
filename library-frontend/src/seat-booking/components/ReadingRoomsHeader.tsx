import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';

interface ReadingRoomsHeaderProps {
  onNotificationPress?: () => void;
  onProfilePress?: () => void;
}

export const ReadingRoomsHeader: React.FC<ReadingRoomsHeaderProps> = ({
  onNotificationPress,
  onProfilePress,
}) => {
  return (
    <View style={styles.container}>
      {/* Left logo / app title badge */}
      <View style={styles.leftGroup}>
        <View style={styles.iconContainer}>
          <Ionicons name="book-outline" size={20} color={Colors.primary} />
        </View>
        <Text style={styles.appTitle}>Reading Rooms</Text>
      </View>

      {/* Right actions */}
      <View style={styles.rightGroup}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={Colors.textDark} />
          <View style={styles.badgeDot} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={onProfilePress}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    ...Shadows.soft,
  },
  leftGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: Colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D0E1F9',
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F0F3F7',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.error,
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
