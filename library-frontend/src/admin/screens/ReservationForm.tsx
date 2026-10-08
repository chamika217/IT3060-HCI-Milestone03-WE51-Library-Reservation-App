import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Button, Input, Card, Loading, ErrorBox, Chip, SectionTitle } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const TYPE_OPTIONS = ['Book', 'Seat'];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ReservationForm({ nav, params }: any) {
  const users = useLoad('/users');
  const books = useLoad('/books');
  const seats = useLoad('/seats');
  const [userId, setUserId] = useState<string>('');
  const [type, setType] = useState<'Book' | 'Seat'>('Book');
  const [bookId, setBookId] = useState<string>('');
  const [seatId, setSeatId] = useState<string>('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (users.data && users.data.length && !userId) setUserId(users.data[0]._id);
    if (books.data && books.data.length && !bookId) setBookId(books.data[0]._id);
    if (seats.data && seats.data.length && !seatId) setSeatId(seats.data[0]._id);
  }, [users.data, books.data, seats.data, userId, bookId, seatId]);

  const userList = useMemo(
    () => (users.data || []).filter((u: any) => u.email && EMAIL_RE.test(u.email)),
    [users.data]
  );

  const pickOption = (label: string, options: any[], current: string, setter: (value: string) => void) => {
    if (!options.length) {
      Alert.alert('No options', `No ${label.toLowerCase()} available.`);
      return;
    }
    Alert.alert(
      label,
      'Choose an item',
      options.map((option) => ({
        text: label === 'User' ? option.name : option.title || option.label,
        onPress: () => setter(option._id),
      })),
      { cancelable: true }
    );
  };

  const save = async () => {
    const trimmedUser = userId.trim();
    const trimmedStart = startTime.trim();
    const trimmedEnd = endTime.trim();
    if (!trimmedUser) return Alert.alert('Missing user', 'Select a user for the reservation');
    if (!trimmedStart || !trimmedEnd) return Alert.alert('Missing times', 'Both start and end times are required');
    if (type === 'Book' && !bookId) return Alert.alert('Missing book', 'Select a book to reserve');
    if (type === 'Seat' && !seatId) return Alert.alert('Missing seat', 'Select a seat to reserve');
    const start = new Date(trimmedStart);
    const end = new Date(trimmedEnd);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()))
      return Alert.alert('Invalid dates', 'Use a valid date/time format');
    if (end <= start) return Alert.alert('Invalid times', 'End time must be after the start time');

    setSaving(true);
    try {
      const payload: any = {
        user: trimmedUser,
        type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
      if (type === 'Book') payload.book = bookId;
      else payload.seat = seatId;
      await api.post('/reservations', payload);
      params?.onCreated?.();
      nav.goBack();
    } catch (e) {
      Alert.alert('Create failed', errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  if (users.loading || books.loading || seats.loading) return <Loading message="Loading reservation resources..." />;
  if (users.error && !users.data) return <ErrorBox message={users.error} onRetry={users.reload} />;
  if (books.error && !books.data) return <ErrorBox message={books.error} onRetry={books.reload} />;
  if (seats.error && !seats.data) return <ErrorBox message={seats.error} onRetry={seats.reload} />;

  const selectedUserName = userList.find((u: any) => u._id === userId)?.name || 'Select user';
  const selectedBookTitle = books.data?.find((b: any) => b._id === bookId)?.title || 'Select book';
  const selectedSeatLabel = seats.data?.find((s: any) => s._id === seatId)?.label || 'Select seat';

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="New Reservation" subtitle="Create booking for user" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card style={s.card}>
          <SectionTitle title="Target User & Type" style={{ marginTop: 0 }} />

          <Text style={s.label}>Selected User</Text>
          <Button
            title={selectedUserName}
            variant="outline"
            icon="person-outline"
            iconPosition="left"
            style={{ marginBottom: spacing.md }}
            onPress={() => pickOption('User', userList, userId, setUserId)}
          />

          <Text style={s.label}>Reservation Type</Text>
          <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
            {TYPE_OPTIONS.map((item) => (
              <Chip
                key={item}
                label={item}
                active={type === item}
                icon={item === 'Book' ? 'book-outline' : 'easel-outline'}
                onPress={() => setType(item as 'Book' | 'Seat')}
              />
            ))}
          </View>

          {type === 'Book' ? (
            <>
              <Text style={s.label}>Select Book</Text>
              <Button
                title={selectedBookTitle}
                variant="outline"
                icon="book-outline"
                onPress={() => pickOption('Book', books.data || [], bookId, setBookId)}
              />
            </>
          ) : (
            <>
              <Text style={s.label}>Select Reading Seat</Text>
              <Button
                title={selectedSeatLabel}
                variant="outline"
                icon="easel-outline"
                onPress={() => pickOption('Seat', seats.data || [], seatId, setSeatId)}
              />
            </>
          )}
        </Card>

        <Card style={s.card}>
          <SectionTitle title="Schedule & Timing" style={{ marginTop: 0 }} />

          <Input
            label="Start Time (YYYY-MM-DDTHH:MM)"
            value={startTime}
            onChangeText={setStartTime}
            placeholder="2026-10-06T09:00"
            leftIcon="time-outline"
          />

          <Input
            label="End Time (YYYY-MM-DDTHH:MM)"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="2026-10-06T11:00"
            leftIcon="alarm-outline"
          />
        </Card>

        <Button
          title={saving ? 'Creating...' : 'Create Reservation'}
          onPress={save}
          disabled={saving}
          loading={saving}
          icon="add-circle-outline"
          style={{ marginBottom: spacing.sm }}
        />
        <Button title="Cancel" variant="outline" onPress={nav.goBack} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  label: {
    color: colors.text,
    fontSize: font.small,
    fontWeight: '600',
    marginBottom: 6,
  },
});