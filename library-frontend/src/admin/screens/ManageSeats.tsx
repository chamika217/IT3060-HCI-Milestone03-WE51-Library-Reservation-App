import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox, SectionTitle } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const COLOR: Record<string, string> = {
  Available: colors.success,
  Occupied: colors.error,
  Reserved: colors.warning,
  Maintenance: colors.textSecondary,
};

const LIGHT_COLOR: Record<string, string> = {
  Available: colors.successLight,
  Occupied: colors.errorLight,
  Reserved: colors.warningLight,
  Maintenance: colors.secondaryLight,
};

export default function ManageSeats({ nav }: any) {
  const { data, loading, error, reload } = useLoad('/seats', {}, 3000);
  const [label, setLabel] = useState('');
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

  const setStatus = async (s: any, status: any) => {
    try {
      await api.put(`/seats/${s._id}`, { status });
      reload();
    } catch (e) {
      Alert.alert('Error', errMsg(e));
    }
  };

  const open = (s: any) => {
    setSelectedSeatId(s._id);
    Alert.alert(`Seat ${s.label}`, `Current Status: ${s.status}`, [
      { text: 'Set Available', onPress: () => { setSelectedSeatId(null); setStatus(s, 'Available'); } },
      { text: 'Set Maintenance', onPress: () => { setSelectedSeatId(null); setStatus(s, 'Maintenance'); } },
      {
        text: 'Delete seat',
        style: 'destructive',
        onPress: async () => {
          setSelectedSeatId(null);
          try {
            await api.delete(`/seats/${s._id}`);
            reload();
          } catch (e) {
            Alert.alert('Error', errMsg(e));
          }
        },
      },
      { text: 'Close', style: 'cancel', onPress: () => setSelectedSeatId(null) },
    ]);
  };

  const add = async () => {
    const trimmed = label.trim();
    if (!trimmed) return Alert.alert('Missing label', 'Enter a seat label e.g. D1');
    try {
      await api.post('/seats', { label: trimmed.toUpperCase() });
      setLabel('');
      reload();
    } catch (e) {
      Alert.alert('Seat error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Manage Seats" subtitle="Reading room capacity & status" />

      {loading ? (
        <Loading message="Loading seat layout..." />
      ) : error && !data ? (
        <ErrorBox message={error} onRetry={reload} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          <Card style={s.legendCard}>
            <Text style={s.legendTitle}>Seat Status Legend</Text>
            <View style={s.legendGrid}>
              {Object.entries(COLOR).map(([k, c]) => (
                <View key={k} style={s.legendItem}>
                  <View style={[s.legendDot, { backgroundColor: c }]} />
                  <Text style={s.legendText}>{k}</Text>
                </View>
              ))}
            </View>
          </Card>

          <SectionTitle title="Seat Layout Grid" subtitle="Tap any seat to change status or remove" />

          <View style={s.seatGrid}>
            {(data || []).map((s: any) => {
              const statusKey = String(s.status);
              const mainColor = COLOR[statusKey] || colors.textSecondary;
              const bgColor = LIGHT_COLOR[statusKey] || colors.secondaryLight;
              const isSelected = selectedSeatId === s._id;

              return (
                <TouchableOpacity
                  key={s._id}
                  onPress={() => open(s)}
                  activeOpacity={0.75}
                  accessibilityLabel={`Seat ${s.label}, status ${s.status}`}
                  accessibilityRole="button"
                  style={[
                    s.seatTile,
                    {
                      backgroundColor: bgColor,
                      borderColor: isSelected ? colors.primary : mainColor,
                      borderWidth: isSelected ? 2.5 : 1.5,
                    },
                  ]}
                >
                  <Ionicons
                    name="easel-outline"
                    size={18}
                    color={mainColor}
                    style={{ marginBottom: 2 }}
                  />
                  <Text style={[s.seatLabel, { color: mainColor }]}>{s.label}</Text>
                  <Text style={[s.seatStatusText, { color: mainColor }]} numberOfLines={1}>
                    {s.status}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Card style={s.addCard}>
            <SectionTitle title="Add New Reading Seat" style={{ marginTop: 0 }} />
            <Input
              label="Seat Label *"
              value={label}
              onChangeText={setLabel}
              placeholder="e.g. D1, E4"
              autoCapitalize="characters"
              leftIcon="easel-outline"
            />
            <Button title="Add Seat" icon="add-circle-outline" onPress={add} />
          </Card>
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  legendCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  legendTitle: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  legendText: {
    fontSize: font.small,
    color: colors.text,
    fontWeight: '600',
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
    marginBottom: spacing.md,
  },
  seatTile: {
    width: '23%',
    margin: '1%',
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  seatLabel: {
    fontSize: font.body,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  seatStatusText: {
    fontSize: font.xs - 1,
    fontWeight: '600',
    marginTop: 1,
  },
  addCard: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
});
