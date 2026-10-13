import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius, shadows } from '../theme';
import { Header, Button, Input, Card, Loading, ErrorBox, Chip, SectionTitle, Avatar, StatusBadge } from '../components';
import { notify } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

const TYPE_OPTIONS = ['Book', 'Seat'];

const TIME_SLOTS = [
  { label: '09:00 AM', value: '09:00' },
  { label: '10:00 AM', value: '10:00' },
  { label: '11:00 AM', value: '11:00' },
  { label: '01:00 PM', value: '13:00' },
  { label: '02:00 PM', value: '14:00' },
  { label: '03:00 PM', value: '15:00' },
  { label: '04:00 PM', value: '16:00' },
];

const DURATIONS = [
  { label: '1 Hour', hours: 1 },
  { label: '2 Hours', hours: 2 },
  { label: '3 Hours', hours: 3 },
  { label: '4 Hours', hours: 4 },
  { label: 'Full Day', hours: 8 },
];

// Helper to format date as YYYY-MM-DD
function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper to format friendly display
function formatFriendlyDate(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
      return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }
  } catch {
    // fallback
  }
  return dateStr;
}

// Convert 24h HH:MM to 12h display
function formatTime12(timeStr: string): string {
  const match = timeStr.match(/^(\d{1,2}):(\d{2})/);
  if (!match) return timeStr;
  let h = parseInt(match[1], 10);
  const m = match[2];
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${String(h).padStart(2, '0')}:${m} ${ampm}`;
}

export default function ReservationForm({ nav, params }: any) {
  const users = useLoad('/users');
  const books = useLoad('/books');
  const seats = useLoad('/seats');

  const todayStr = useMemo(() => toDateString(new Date()), []);

  const [userId, setUserId] = useState<string>('');
  const [type, setType] = useState<'Book' | 'Seat'>('Book');
  const [bookId, setBookId] = useState<string>('');
  const [seatId, setSeatId] = useState<string>('');

  // Date and Time fields
  const [date, setDate] = useState<string>(todayStr);
  const [startTime, setStartTime] = useState<string>('09:00');
  const [endTime, setEndTime] = useState<string>('11:00');
  const [selectedDuration, setSelectedDuration] = useState<number>(2);

  const [saving, setSaving] = useState(false);

  // Modal selector state
  const [modalType, setModalType] = useState<'user' | 'book' | 'seat' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Auto-select first item when loaded
  useEffect(() => {
    if (users.data && users.data.length && !userId) setUserId(users.data[0]._id);
    if (books.data && books.data.length && !bookId) setBookId(books.data[0]._id);
    if (seats.data && seats.data.length && !seatId) setSeatId(seats.data[0]._id);
  }, [users.data, books.data, seats.data, userId, bookId, seatId]);

  // Handle duration chip click to auto-calculate end time
  const applyDuration = (hours: number) => {
    setSelectedDuration(hours);
    const match = startTime.match(/^(\d{1,2}):(\d{2})/);
    if (match) {
      const startH = parseInt(match[1], 10);
      const startM = match[2];
      const endH = Math.min(20, startH + hours);
      setEndTime(`${String(endH).padStart(2, '0')}:${startM}`);
    }
  };

  // Quick date setter
  const setQuickDate = (daysAhead: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysAhead);
    setDate(toDateString(d));
  };

  // Safe Date parsing
  const buildDateTime = (dateStr: string, timeStr: string, defaultHour: number): Date => {
    const cleanDate = dateStr.trim().split('T')[0] || todayStr;
    let cleanTime = timeStr.trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(cleanTime) || !cleanTime) {
      cleanTime = `${String(defaultHour).padStart(2, '0')}:00`;
    }
    const match = cleanTime.match(/(\d{1,2}):(\d{2})/);
    let h = defaultHour;
    let m = 0;
    if (match) {
      h = parseInt(match[1], 10);
      m = parseInt(match[2], 10);
    }
    const result = new Date(`${cleanDate}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
    return Number.isNaN(result.getTime()) ? new Date() : result;
  };

  const save = async () => {
    const trimmedUser = userId.trim();
    if (!trimmedUser) return notify('Missing User', 'Please select a member for this reservation.');
    if (type === 'Book' && !bookId) return notify('Missing Book', 'Please select a book to reserve.');
    if (type === 'Seat' && !seatId) return notify('Missing Seat', 'Please select a reading seat to reserve.');

    let start = buildDateTime(date, startTime, 9);
    let end = buildDateTime(date, endTime, 11);

    // If end is before or equal to start, auto-adjust to start + 2 hours
    if (end <= start) {
      end = new Date(start.getTime() + (selectedDuration || 2) * 3600 * 1000);
      setEndTime(`${String(end.getHours()).padStart(2, '0')}:${String(end.getMinutes()).padStart(2, '0')}`);
    }

    setSaving(true);
    try {
      const payload: any = {
        user: trimmedUser,
        type,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        status: 'Pending',
      };
      if (type === 'Book') payload.book = bookId;
      else payload.seat = seatId;

      await api.post('/reservations', payload);
      notify('Success', 'Reservation created successfully and saved to database.');
      params?.onCreated?.();
      nav.goBack();
    } catch (e) {
      notify('Reservation Failed', errMsg(e));
    } finally {
      setSaving(false);
    }
  };

  if (users.loading || books.loading || seats.loading) return <Loading message="Loading reservation resources..." />;
  if (users.error && !users.data) return <ErrorBox message={users.error} onRetry={users.reload} />;
  if (books.error && !books.data) return <ErrorBox message={books.error} onRetry={books.reload} />;
  if (seats.error && !seats.data) return <ErrorBox message={seats.error} onRetry={seats.reload} />;

  const userList = users.data || [];
  const bookList = books.data || [];
  const seatList = seats.data || [];

  const selectedUser = userList.find((u: any) => u._id === userId);
  const selectedBook = bookList.find((b: any) => b._id === bookId);
  const selectedSeat = seatList.find((s: any) => s._id === seatId);

  // Filtered modal items based on searchQuery
  const filteredUsers = userList.filter((u: any) =>
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredBooks = bookList.filter((b: any) =>
    (b.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.author || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (b.isbn || '').includes(searchQuery)
  );

  const filteredSeats = seatList.filter((s: any) =>
    (s.label || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (s.status || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="New Reservation" subtitle="Create booking for user" onBack={nav.goBack} />

      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* TARGET USER & TYPE */}
        <Card style={s.card}>
          <SectionTitle title="Target User & Type" style={{ marginTop: 0 }} />

          <Text style={s.label}>Selected Member</Text>
          <TouchableOpacity
            style={s.selectionTrigger}
            onPress={() => { setSearchQuery(''); setModalType('user'); }}
            activeOpacity={0.75}
          >
            <Avatar name={selectedUser?.name || 'User'} size={38} />
            <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
              <Text style={s.triggerTitle}>{selectedUser?.name || 'Choose a Member'}</Text>
              <Text style={s.triggerSubtitle}>{selectedUser?.email || 'Tap to select member'}</Text>
            </View>
            <View style={s.changeBadge}>
              <Text style={s.changeBadgeText}>Change</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primary} />
            </View>
          </TouchableOpacity>

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
              <Text style={s.label}>Selected Book</Text>
              <TouchableOpacity
                style={s.selectionTrigger}
                onPress={() => { setSearchQuery(''); setModalType('book'); }}
                activeOpacity={0.75}
              >
                <View style={s.itemIconBox}>
                  <Ionicons name="book" size={20} color={colors.primary} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                  <Text style={s.triggerTitle} numberOfLines={1}>
                    {selectedBook?.title || 'Choose a Book'}
                  </Text>
                  <Text style={s.triggerSubtitle} numberOfLines={1}>
                    {selectedBook?.author ? `By ${selectedBook.author}` : 'Tap to select from catalog'}
                  </Text>
                </View>
                <View style={s.changeBadge}>
                  <Text style={s.changeBadgeText}>Change</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.label}>Selected Reading Seat</Text>
              <TouchableOpacity
                style={s.selectionTrigger}
                onPress={() => { setSearchQuery(''); setModalType('seat'); }}
                activeOpacity={0.75}
              >
                <View style={[s.itemIconBox, { backgroundColor: colors.warningLight }]}>
                  <Ionicons name="easel" size={20} color={colors.warning} />
                </View>
                <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                  <Text style={s.triggerTitle}>
                    {selectedSeat ? `Seat ${selectedSeat.label}` : 'Choose a Seat'}
                  </Text>
                  <Text style={s.triggerSubtitle}>
                    Status: {selectedSeat?.status || 'Available'}
                  </Text>
                </View>
                <View style={s.changeBadge}>
                  <Text style={s.changeBadgeText}>Change</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </TouchableOpacity>
            </>
          )}
        </Card>

        {/* SCHEDULE & TIMING */}
        <Card style={s.card}>
          <SectionTitle title="Schedule & Timing" style={{ marginTop: 0 }} />

          {/* Date Selector */}
          <Text style={s.label}>Reservation Date</Text>
          <View style={s.quickChipsRow}>
            <TouchableOpacity
              style={[s.quickChip, date === todayStr && s.quickChipActive]}
              onPress={() => setQuickDate(0)}
            >
              <Text style={[s.quickChipText, date === todayStr && s.quickChipTextActive]}>Today</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickChip, date === toDateString(new Date(Date.now() + 86400000)) && s.quickChipActive]}
              onPress={() => setQuickDate(1)}
            >
              <Text style={[s.quickChipText, date === toDateString(new Date(Date.now() + 86400000)) && s.quickChipTextActive]}>Tomorrow</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickChip, date === toDateString(new Date(Date.now() + 172800000)) && s.quickChipActive]}
              onPress={() => setQuickDate(2)}
            >
              <Text style={[s.quickChipText, date === toDateString(new Date(Date.now() + 172800000)) && s.quickChipTextActive]}>+2 Days</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.quickChip, date === toDateString(new Date(Date.now() + 604800000)) && s.quickChipActive]}
              onPress={() => setQuickDate(7)}
            >
              <Text style={[s.quickChipText, date === toDateString(new Date(Date.now() + 604800000)) && s.quickChipTextActive]}>+1 Week</Text>
            </TouchableOpacity>
          </View>

          <Input
            label="Date (YYYY-MM-DD)"
            value={date}
            onChangeText={setDate}
            placeholder="2026-10-15"
            leftIcon="calendar-outline"
          />

          {/* Start Time Selector */}
          <Text style={s.label}>Start Time</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.timeChipsScroll}>
            {TIME_SLOTS.map((slot) => {
              const active = startTime === slot.value;
              return (
                <TouchableOpacity
                  key={slot.value}
                  style={[s.timeChip, active && s.timeChipActive]}
                  onPress={() => {
                    setStartTime(slot.value);
                    // Automatically re-apply duration to update end time
                    const h = parseInt(slot.value.split(':')[0], 10);
                    const m = slot.value.split(':')[1];
                    const endH = Math.min(20, h + selectedDuration);
                    setEndTime(`${String(endH).padStart(2, '0')}:${m}`);
                  }}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={active ? '#FFFFFF' : colors.textSecondary}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[s.timeChipText, active && s.timeChipTextActive]}>{slot.label}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Duration Selector */}
          <Text style={s.label}>Booking Duration</Text>
          <View style={s.durationRow}>
            {DURATIONS.map((dur) => {
              const active = selectedDuration === dur.hours;
              return (
                <TouchableOpacity
                  key={dur.hours}
                  style={[s.durationChip, active && s.durationChipActive]}
                  onPress={() => applyDuration(dur.hours)}
                >
                  <Text style={[s.durationChipText, active && s.durationChipTextActive]}>
                    {dur.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* End Time Input (Customizable) */}
          <Input
            label="End Time (24h HH:MM)"
            value={endTime}
            onChangeText={setEndTime}
            placeholder="11:00"
            leftIcon="alarm-outline"
          />

          {/* Live Booking Summary Badge */}
          <View style={s.summaryBox}>
            <View style={s.summaryHeader}>
              <Ionicons name="information-circle" size={18} color={colors.primary} />
              <Text style={s.summaryTitle}>Booking Summary Preview</Text>
            </View>
            <Text style={s.summaryDetail}>
              📅 <Text style={{ fontWeight: '700' }}>{formatFriendlyDate(date)}</Text>
            </Text>
            <Text style={s.summaryDetail}>
              ⏰ <Text style={{ fontWeight: '700' }}>{formatTime12(startTime)} → {formatTime12(endTime)}</Text>
            </Text>
            <Text style={s.summaryDetail}>
              👤 Member: <Text style={{ fontWeight: '700' }}>{selectedUser?.name || 'None'}</Text>
            </Text>
            <Text style={s.summaryDetail}>
              {type === 'Book' ? '📖 Book:' : '🪑 Seat:'}{' '}
              <Text style={{ fontWeight: '700' }}>
                {type === 'Book' ? selectedBook?.title || 'None' : `Seat ${selectedSeat?.label || 'None'}`}
              </Text>
            </Text>
          </View>
        </Card>

        {/* Action Buttons */}
        <Button
          title={saving ? 'Creating Reservation...' : 'Create Reservation'}
          onPress={save}
          disabled={saving}
          loading={saving}
          icon="add-circle"
          style={{ marginBottom: spacing.sm }}
        />
        <Button title="Cancel" variant="outline" onPress={nav.goBack} />
      </ScrollView>

      {/* SELECTION MODAL */}
      <Modal
        visible={modalType !== null}
        animationType="slide"
        transparent
        onRequestClose={() => setModalType(null)}
      >
        <View style={s.modalOverlay}>
          <View style={s.modalContent}>
            {/* Modal Header */}
            <View style={s.modalHeader}>
              <View>
                <Text style={s.modalTitle}>
                  {modalType === 'user' ? 'Select Member' : modalType === 'book' ? 'Select Book' : 'Select Seat'}
                </Text>
                <Text style={s.modalSubtitle}>
                  {modalType === 'user'
                    ? 'Choose an active student or staff member'
                    : modalType === 'book'
                    ? 'Choose from available library catalog'
                    : 'Choose reading room seat'}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setModalType(null)}
                style={s.modalCloseBtn}
                accessibilityLabel="Close selection"
              >
                <Ionicons name="close" size={22} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Modal Search */}
            <View style={s.modalSearchBox}>
              <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
              <TextInput
                style={s.modalSearchInput}
                placeholder={
                  modalType === 'user'
                    ? 'Search member name or email...'
                    : modalType === 'book'
                    ? 'Search book title, author, or ISBN...'
                    : 'Search seat label...'
                }
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoFocus={Platform.OS === 'web'}
              />
              {!!searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Modal List */}
            <ScrollView style={s.modalList} showsVerticalScrollIndicator={false}>
              {modalType === 'user' && (
                filteredUsers.length === 0 ? (
                  <Text style={s.modalEmptyText}>No members match your search</Text>
                ) : (
                  filteredUsers.map((u: any) => {
                    const isSelected = u._id === userId;
                    return (
                      <TouchableOpacity
                        key={u._id}
                        style={[s.modalItemCard, isSelected && s.modalItemCardSelected]}
                        onPress={() => { setUserId(u._id); setModalType(null); }}
                        activeOpacity={0.7}
                      >
                        <Avatar name={u.name} size={40} />
                        <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                          <Text style={s.modalItemTitle}>{u.name}</Text>
                          <Text style={s.modalItemSubtitle}>{u.email}</Text>
                        </View>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={20} color={colors.border} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )
              )}

              {modalType === 'book' && (
                filteredBooks.length === 0 ? (
                  <Text style={s.modalEmptyText}>No books match your search</Text>
                ) : (
                  filteredBooks.map((b: any) => {
                    const isSelected = b._id === bookId;
                    return (
                      <TouchableOpacity
                        key={b._id}
                        style={[s.modalItemCard, isSelected && s.modalItemCardSelected]}
                        onPress={() => { setBookId(b._id); setModalType(null); }}
                        activeOpacity={0.7}
                      >
                        <View style={s.modalBookIcon}>
                          <Ionicons name="book" size={20} color={colors.primary} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                          <Text style={s.modalItemTitle} numberOfLines={1}>{b.title}</Text>
                          <Text style={s.modalItemSubtitle} numberOfLines={1}>
                            By {b.author} • ISBN: {b.isbn}
                          </Text>
                          <Text style={s.modalItemStock}>
                            Available: <Text style={{ fontWeight: '700', color: colors.text }}>{b.available ?? b.copies}</Text> copies
                          </Text>
                        </View>
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={20} color={colors.border} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )
              )}

              {modalType === 'seat' && (
                filteredSeats.length === 0 ? (
                  <Text style={s.modalEmptyText}>No seats match your search</Text>
                ) : (
                  filteredSeats.map((sItem: any) => {
                    const isSelected = sItem._id === seatId;
                    return (
                      <TouchableOpacity
                        key={sItem._id}
                        style={[s.modalItemCard, isSelected && s.modalItemCardSelected]}
                        onPress={() => { setSeatId(sItem._id); setModalType(null); }}
                        activeOpacity={0.7}
                      >
                        <View style={[s.modalBookIcon, { backgroundColor: colors.warningLight }]}>
                          <Ionicons name="easel" size={20} color={colors.warning} />
                        </View>
                        <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                          <Text style={s.modalItemTitle}>Seat {sItem.label}</Text>
                          <Text style={s.modalItemSubtitle}>Room: {sItem.room || 'Main Reading Hall'}</Text>
                        </View>
                        <StatusBadge status={sItem.status || 'Available'} />
                        {isSelected ? (
                          <Ionicons name="checkmark-circle" size={24} color={colors.primary} style={{ marginLeft: 8 }} />
                        ) : (
                          <Ionicons name="ellipse-outline" size={20} color={colors.border} style={{ marginLeft: 8 }} />
                        )}
                      </TouchableOpacity>
                    );
                  })
                )
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
    marginBottom: 8,
    marginTop: 4,
  },
  selectionTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  triggerTitle: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
  },
  triggerSubtitle: {
    fontSize: font.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  changeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  changeBadgeText: {
    fontSize: font.xs,
    color: colors.primary,
    fontWeight: '700',
    marginRight: 2,
  },
  itemIconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
    gap: 8,
  },
  quickChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  quickChipText: {
    fontSize: font.xs,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  quickChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  timeChipsScroll: {
    marginBottom: spacing.md,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  timeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  timeChipText: {
    fontSize: font.small,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  timeChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  durationRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: spacing.md,
  },
  durationChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  durationChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  durationChipText: {
    fontSize: font.small,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  durationChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  summaryBox: {
    backgroundColor: colors.primarySubtle,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(45, 124, 233, 0.25)',
    marginTop: spacing.sm,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs + 2,
  },
  summaryTitle: {
    fontSize: font.small,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 6,
  },
  summaryDetail: {
    fontSize: font.small,
    color: colors.text,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    maxHeight: '85%',
    padding: spacing.md,
    paddingBottom: Platform.OS === 'ios' ? 36 : 20,
    ...shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  modalTitle: {
    fontSize: font.h2,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.3,
  },
  modalSubtitle: {
    fontSize: font.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.secondaryLight,
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.sm + 4,
    paddingVertical: 10,
    marginBottom: spacing.md,
  },
  modalSearchInput: {
    flex: 1,
    fontSize: font.body,
    color: colors.text,
    padding: 0,
  },
  modalList: {
    maxHeight: 400,
  },
  modalItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 4,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    marginBottom: spacing.sm,
  },
  modalItemCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySubtle,
  },
  modalItemTitle: {
    fontSize: font.body,
    fontWeight: '700',
    color: colors.text,
  },
  modalItemSubtitle: {
    fontSize: font.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalItemStock: {
    fontSize: font.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  modalBookIcon: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalEmptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: font.small,
    marginVertical: spacing.lg,
  },
});