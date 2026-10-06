import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import { colors, spacing, font } from '../theme';
import { Header, Button, Input, Card, Loading, ErrorBox, Chip } from '../components';
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

  const userList = useMemo(() => (users.data || []).filter((u: any) => u.email && EMAIL_RE.test(u.email)), [users.data]);

  const pickOption = (label: string, options: any[], current: string, setter: (value: string) => void) => {
    if (!options.length) {
      Alert.alert('No options', `No ${label.toLowerCase()} available.`);
      return;
    }
    Alert.alert(label, 'Choose an item', options.map((option) => ({
      text: label === 'User' ? option.name : option.title || option.label,
      onPress: () => setter(option._id),
    })), { cancelable: true });
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
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return Alert.alert('Invalid dates', 'Use a valid date/time format');
    if (end <= start) return Alert.alert('Invalid times', 'End time must be after the start time');

    setSaving(true);
    try {
      const payload: any = {
        user: trimmedUser,
        type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
      };
      if (type === 'Book') payload.book = bookId; else payload.seat = seatId;
      await api.post('/reservations', payload);
      params?.onCreated?.();
      nav.goBack();
    } catch (e) { Alert.alert('Create failed', errMsg(e)); }
    finally { setSaving(false); }
  };

  if (users.loading || books.loading || seats.loading) return <Loading />;
  if (users.error && !users.data) return <ErrorBox message={users.error} onRetry={users.reload} />;
  if (books.error && !books.data) return <ErrorBox message={books.error} onRetry={books.reload} />;
  if (seats.error && !seats.data) return <ErrorBox message={seats.error} onRetry={seats.reload} />;

  return (
    <View style={{ flex: 1 }}>
      <Header title="New Reservation" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Card>
          <Text style={{ color: colors.textSecondary, marginBottom: spacing.sm }}>User</Text>
          <Button title={userList.find((u: any) => u._id === userId)?.name || 'Select user'} variant="outline" onPress={() => pickOption('User', userList, userId, setUserId)} />
          <Text style={{ color: colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm }}>Type</Text>
          <View style={{ flexDirection: 'row' }}>
            {TYPE_OPTIONS.map((item) => (
              <Chip key={item} label={item} active={type === item} onPress={() => setType(item as 'Book' | 'Seat')} />
            ))}
          </View>
          {type === 'Book' ? (
            <>
              <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm }}>Book</Text>
              <Button title={books.data.find((b: any) => b._id === bookId)?.title || 'Select book'} variant="outline" onPress={() => pickOption('Book', books.data || [], bookId, setBookId)} />
            </>
          ) : (
            <>
              <Text style={{ color: colors.textSecondary, marginTop: spacing.sm, marginBottom: spacing.sm }}>Seat</Text>
              <Button title={seats.data.find((s: any) => s._id === seatId)?.label || 'Select seat'} variant="outline" onPress={() => pickOption('Seat', seats.data || [], seatId, setSeatId)} />
            </>
          )}
        </Card>

        <Card>
          <Input label="Start time" value={startTime} onChangeText={setStartTime} placeholder="2026-10-06T09:00" />
          <Input label="End time" value={endTime} onChangeText={setEndTime} placeholder="2026-10-06T11:00" />
        </Card>

        <Button title={saving ? 'Creating...' : 'Create Reservation'} onPress={save} disabled={saving} />
        <Button title="Cancel" variant="outline" style={{ marginTop: spacing.md }} onPress={nav.goBack} />
      </ScrollView>
    </View>
  );
}