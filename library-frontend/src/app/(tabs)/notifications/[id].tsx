/**
 * Screen 2 — Notification Detail
 * Route: /(tabs)/notifications/[id]
 *
 * Reads `id` from route params, looks it up in the mock array.
 * Swap MOCK_NOTIFICATIONS lookup for GET /api/notifications/:id.
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';

import { ScreenHeader, BottomNavBar, IonIcon, StatusBadge } from '@/components/notifications';
import { MOCK_NOTIFICATIONS, getUnreadCount } from '@/features/notifications/mockData';
import { Notification } from '@/features/notifications/types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Map notification type to a header chip label */
function statusChipLabel(n: Notification): string {
  switch (n.type) {
    case 'hold_ready':    return 'Active Reservation • Ready for Pickup';
    case 'seat_expiring': return 'Active Booking • Expiring Soon';
    case 'seat_released': return 'Booking Ended • Auto-Released';
    case 'system_info':   return 'System Notice • Library Services';
  }
}

function statusChipVariant(n: Notification): 'success' | 'warning' | 'error' | 'info' {
  switch (n.type) {
    case 'hold_ready':    return 'success';
    case 'seat_expiring': return 'warning';
    case 'seat_released': return 'error';
    case 'system_info':   return 'info';
  }
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function NotificationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();

  // In production: fetch(`/api/notifications/${id}`)
  const notification = MOCK_NOTIFICATIONS.find((n) => n.id === id);
  const unreadCount = getUnreadCount(MOCK_NOTIFICATIONS);

  if (!notification) {
    return (
      <View style={styles.screen}>
        <ScreenHeader
          title="Notification Detail"
          onBack={() => router.back()}
        />
        <View style={styles.notFound}>
          <IonIcon name="alert-circle-outline" size={40} color="#6C7886" />
          <Text style={styles.notFoundText}>Notification not found.</Text>
        </View>
        <BottomNavBar activeTab="alerts" unreadCount={unreadCount} />
      </View>
    );
  }

  const { detail } = notification;

  return (
    <View style={styles.screen}>
      <ScreenHeader
        title="Notification Detail"
        onBack={() => router.back()}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Status chip + timestamp ──────────────────────────────── */}
        <View style={styles.chipRow}>
          <StatusBadge
            label={statusChipLabel(notification)}
            variant={statusChipVariant(notification)}
          />
          <Text style={styles.detailTimestamp}>{notification.timestamp}</Text>
        </View>

        {/* ── Main card ───────────────────────────────────────────── */}
        <View style={styles.card}>
          {/* Icon + type label */}
          <View style={styles.cardIconRow}>
            <View
              style={[
                styles.cardIconCircle,
                { backgroundColor: `${notification.accentColor}18` },
              ]}
            >
              <IonIcon
                name={notification.type === 'hold_ready' ? 'book' : notification.type === 'seat_expiring' ? 'time' : notification.type === 'seat_released' ? 'alert-circle' : 'information-circle'}
                size={28}
                color={notification.accentColor}
              />
            </View>
            <View style={styles.cardTitleBlock}>
              <Text style={styles.cardTitle}>{notification.title}</Text>
              <Text style={styles.cardAutomatedLabel}>Automated Circulation Alert</Text>
            </View>
          </View>

          {/* Book detail (hold_ready) */}
          {notification.type === 'hold_ready' && detail?.bookTitle && (
            <View style={styles.bookDetail}>
              <View style={styles.physicalCopyTag}>
                <Text style={styles.physicalCopyTagText}>PHYSICAL COPY</Text>
              </View>
              <Text style={styles.bookTitle}>{detail.bookTitle}</Text>
              {detail.bookAuthor && (
                <Text style={styles.bookAuthor}>{detail.bookAuthor}</Text>
              )}
              {detail.isbn && (
                <Text style={styles.bookIsbn}>ISBN: {detail.isbn}</Text>
              )}
            </View>
          )}

          {/* Seat detail (seat_expiring / seat_released) */}
          {(notification.type === 'seat_expiring' || notification.type === 'seat_released') &&
            detail?.roomName && (
              <View style={styles.bookDetail}>
                <Text style={styles.bookTitle}>{detail.roomName}</Text>
                {detail.seatNumber && (
                  <Text style={styles.bookAuthor}>Seat {detail.seatNumber}</Text>
                )}
                {notification.type === 'seat_expiring' && detail.expiresAt && (
                  <View style={styles.expiryRow}>
                    <IonIcon name="time-outline" size={14} color="#F7A35C" />
                    <Text style={styles.expiryText}>
                      Expires at {detail.expiresAt} •{' '}
                      {detail.minutesRemaining} min remaining
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* System info body */}
          {notification.type === 'system_info' && detail?.body && (
            <View style={styles.bookDetail}>
              <Text style={styles.systemBody}>{detail.body}</Text>
            </View>
          )}
        </View>

        {/* ── Pickup details card (hold_ready only) ──────────────── */}
        {notification.type === 'hold_ready' && detail?.pickupLocation && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>PICKUP DETAILS</Text>

            <View style={styles.pickupRow}>
              <IonIcon name="location-outline" size={16} color="#6C7886" />
              <View style={styles.pickupTextBlock}>
                <Text style={styles.pickupKey}>Pickup Location</Text>
                <Text style={styles.pickupValue}>{detail.pickupLocation}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.pickupRow}>
              <IonIcon name="book-outline" size={16} color="#6C7886" />
              <View style={styles.pickupTextBlock}>
                <Text style={styles.pickupKey}>Hold Location</Text>
                <View style={styles.holdShelfRow}>
                  <Text style={styles.pickupValue}>{detail.holdShelf}</Text>
                  <View style={styles.selfServiceTag}>
                    <Text style={styles.selfServiceTagText}>Self-Service Open</Text>
                  </View>
                </View>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.pickupRow}>
              <IonIcon name="calendar-outline" size={16} color="#6C7886" />
              <View style={styles.pickupTextBlock}>
                <Text style={styles.pickupKey}>Hold Expires</Text>
                <View style={styles.holdShelfRow}>
                  <Text style={styles.pickupValue}>{detail.holdExpiry}</Text>
                  {detail.daysRemaining !== undefined && (
                    <StatusBadge
                      label={`${detail.daysRemaining} days left`}
                      variant="warning"
                      size="sm"
                    />
                  )}
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ── Barcode card (hold_ready only) ─────────────────────── */}
        {notification.type === 'hold_ready' && detail?.barcodeValue && (
          <View style={styles.card}>
            <Text style={styles.sectionLabel}>SELF-CHECKOUT DESK BARCODE</Text>
            <BarcodeVisual />
            <Text style={styles.barcodeValue}>{detail.barcodeValue}</Text>
          </View>
        )}

        {/* ── Expiry note ─────────────────────────────────────────── */}
        {notification.type === 'hold_ready' && (
          <View style={styles.noteCard}>
            <IonIcon name="information-circle-outline" size={16} color="#2D7CE9" />
            <Text style={styles.noteText}>
              If not collected by the hold expiry date, this item will be returned
              to general circulation or routed to the next patron in the queue.
            </Text>
          </View>
        )}

        {/* ── Primary CTA ─────────────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [styles.btnPrimary, pressed && styles.pressed]}
          accessibilityRole="button"
          onPress={() => {/* Navigate to full reservation screen */}}
        >
          <Text style={styles.btnPrimaryText}>View Full Reservation →</Text>
        </Pressable>

        {/* ── Contact staff row ───────────────────────────────────── */}
        <Pressable
          style={({ pressed }) => [styles.contactRow, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Contact library staff"
          onPress={() => {/* Navigate to contact screen */}}
        >
          <IonIcon name="people-outline" size={18} color="#6C7886" />
          <Text style={styles.contactText}>Need Help? Contact Library Staff</Text>
          <IonIcon name="chevron-forward" size={16} color="#6C7886" />
        </Pressable>
      </ScrollView>

      <BottomNavBar activeTab="alerts" unreadCount={unreadCount} />
    </View>
  );
}

// ─── Barcode visual placeholder ───────────────────────────────────────────────

function BarcodeVisual() {
  // Alternating wide/narrow bars with a styled View pattern
  const bars = [3, 1, 2, 1, 3, 1, 1, 2, 1, 3, 1, 2, 1, 1, 3, 2, 1, 1, 2, 3, 1, 2, 1] as const;

  return (
    <View style={barcodeStyles.wrap} accessibilityLabel="Barcode image" accessibilityRole="image">
      {bars.map((w, i) => (
        <View
          key={i}
          style={[
            barcodeStyles.bar,
            {
              width: w * 3,
              backgroundColor: i % 2 === 0 ? '#1C283B' : 'transparent',
            },
          ]}
        />
      ))}
    </View>
  );
}

const barcodeStyles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'stretch',
    height: 64,
    alignSelf: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#FAFBFB',
    borderWidth: 1,
    borderColor: '#DDE2E6',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginVertical: 10,
  },
  bar: {
    height: '100%',
    borderRadius: 1,
  },
});

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F7F7',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  notFoundText: {
    fontSize: 15,
    color: '#6C7886',
  },

  // Status chip row
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailTimestamp: {
    fontSize: 12,
    color: '#6C7886',
    fontWeight: '500',
  },

  // Cards
  card: {
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 16,
    gap: 12,
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.8,
  },

  // Card icon row
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  cardIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardTitleBlock: {
    flex: 1,
    gap: 3,
    paddingTop: 4,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1C283B',
    lineHeight: 22,
  },
  cardAutomatedLabel: {
    fontSize: 12,
    color: '#6C7886',
  },

  // Physical copy / book detail
  bookDetail: {
    gap: 6,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F4',
  },
  physicalCopyTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#F0F2F4',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  physicalCopyTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.6,
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C283B',
    lineHeight: 21,
  },
  bookAuthor: {
    fontSize: 13,
    color: '#6C7886',
  },
  bookIsbn: {
    fontSize: 12,
    color: '#6C7886',
    fontVariant: ['tabular-nums'],
  },
  expiryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  expiryText: {
    fontSize: 13,
    color: '#F7A35C',
    fontWeight: '600',
  },
  systemBody: {
    fontSize: 14,
    color: '#1C283B',
    lineHeight: 21,
  },

  // Pickup rows
  pickupRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  pickupTextBlock: {
    flex: 1,
    gap: 3,
  },
  pickupKey: {
    fontSize: 11,
    color: '#6C7886',
    fontWeight: '500',
  },
  pickupValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C283B',
  },
  holdShelfRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  selfServiceTag: {
    backgroundColor: '#EDFAF4',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#B8EDD4',
  },
  selfServiceTagText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#25B87A',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F2F4',
    marginVertical: 2,
  },

  // Barcode
  barcodeValue: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    color: '#1C283B',
    letterSpacing: 1.5,
    fontVariant: ['tabular-nums'],
  },

  // Note card
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#EAF2FD',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B3D0F7',
    padding: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 13,
    color: '#1C283B',
    lineHeight: 19,
  },

  // Buttons
  btnPrimary: {
    backgroundColor: '#2D7CE9',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 4,
  },
  btnPrimaryText: {
    color: '#FAFBFB',
    fontWeight: '700',
    fontSize: 15,
    letterSpacing: 0.2,
  },

  // Contact row
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFBFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 14,
  },
  contactText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1C283B',
  },

  pressed: {
    opacity: 0.75,
  },
});
