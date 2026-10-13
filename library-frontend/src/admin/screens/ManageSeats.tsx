import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox, SectionTitle } from '../components';
import { notify, confirmAction, chooseAction } from '../dialog';
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
      notify('Error', errMsg(e));
    }
  };

  const open = async (s: any) => {
    setSelectedSeatId(s._id);
    const action = await chooseAction(`Seat ${s.label}`, `Current Status: ${s.status}`, [
      { label: 'Mark Available', value: 'Available' },
      { label: 'Mark Maintenance', value: 'Maintenance' },
      { label: 'Mark Occupied', value: 'Occupied' },
      { label: 'Delete Seat', value: 'delete' },
    ]);
    setSelectedSeatId(null);
    if (!action) return;

    if (action === 'delete') {
      const ok = await confirmAction('Delete Seat', `Are you sure you want to delete seat ${s.label}?`, 'Delete', true);
      if (ok) {
        try {
          await api.delete(`/seats/${s._id}`);
          reload();
          notify('Deleted', `Seat ${s.label} removed successfully.`);
        } catch (e) {
          notify('Error', errMsg(e));
        }
      }
    } else {
      setStatus(s, action);
    }
  };

  const add = async () => {
    const trimmed = label.trim();
    if (!trimmed) return notify('Missing label', 'Enter a seat label e.g. D1');
    try {
      await api.post('/seats', { label: trimmed.toUpperCase() });
      setLabel('');
      reload();
      notify('Seat Added', `Seat ${trimmed.toUpperCase()} created successfully.`);
    } catch (e) {
      notify('Seat error', errMsg(e));
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
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
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
            {(data || []).map((sItem: any) => {
              const statusKey = String(sItem.status);
              const mainColor = COLOR[statusKey] || colors.textSecondary;
              const bgColor = LIGHT_COLOR[statusKey] || colors.secondaryLight;
              const isSelected = selectedSeatId === sItem._id;

              return (
                <TouchableOpacity
                  key={sItem._id}
                  onPress={() => open(sItem)}
                  activeOpacity={0.75}
                  accessibilityLabel={`Seat ${sItem.label}, status ${sItem.status}`}
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
                  <Text style={[s.seatLabel, { color: mainColor }]}>{sItem.label}</Text>
                  <Text style={[s.seatStatusText, { color: mainColor }]} numberOfLines={1}>
                    {sItem.status}
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
