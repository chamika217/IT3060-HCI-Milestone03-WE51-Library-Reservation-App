import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '../constants/designSystem';

interface CampusBreadcrumbProps {
  onBackPress?: () => void;
  campusName?: string;
  spacesCount?: string;
  title?: string;
  subtitle?: string;
}

export const CampusBreadcrumb: React.FC<CampusBreadcrumbProps> = ({
  onBackPress,
  campusName = 'CAMPUS',
  spacesCount = 'SPACES 02',
  title = 'Malabe Campus Discussion Rooms',
  subtitle = 'Find available study spaces and discussion pods.',
}) => {
  return (
    <View style={styles.container}>
      {/* Top navigation row */}
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={onBackPress}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={18} color={Colors.textDark} />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.tagText}>
          {campusName} • {spacesCount}
        </Text>
      </View>

      {/* Main Title & Subtitle */}
      <Text style={styles.titleText}>{title}</Text>
      <Text style={styles.subtitleText}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  backText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textDark,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    letterSpacing: 0.8,
  },
  titleText: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.textDark,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
    lineHeight: 18,
  },
});
