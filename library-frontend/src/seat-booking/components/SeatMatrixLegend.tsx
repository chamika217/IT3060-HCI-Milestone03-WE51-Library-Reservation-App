import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '../constants/designSystem';

export const SeatMatrixLegend: React.FC = () => {
  return (
    <View style={styles.container}>
      {/* Available */}
      <View style={styles.pillAvailable}>
        <View style={styles.dotAvailable} />
        <Text style={styles.textAvailable}>Available</Text>
      </View>

      {/* Taken */}
      <View style={styles.pillTaken}>
        <Ionicons name="close" size={12} color={Colors.textSecondary} />
        <Text style={styles.textTaken}>Taken</Text>
      </View>

      {/* Chosen */}
      <View style={styles.pillChosen}>
        <Ionicons name="checkmark" size={12} color="#FFFFFF" />
        <Text style={styles.textChosen}>Chosen</Text>
      </View>

      {/* Reserved */}
      <View style={styles.pillReserved}>
        <Ionicons name="lock-closed" size={11} color={Colors.warning} />
        <Text style={styles.textReserved}>Reserved</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  pillAvailable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dotAvailable: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.textSecondary,
  },
  textAvailable: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textDark,
  },
  pillTaken: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#EEF2F6',
  },
  textTaken: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillChosen: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: Colors.primary,
  },
  textChosen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  pillReserved: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: Colors.warningSoft,
    borderWidth: 1,
    borderColor: '#FDE4CE',
  },
  textReserved: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
});
