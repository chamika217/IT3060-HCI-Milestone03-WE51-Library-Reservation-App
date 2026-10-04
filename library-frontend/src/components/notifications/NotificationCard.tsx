/**
 * NotificationCard — list item for the notifications screen.
 *
 * Renders an icon circle, title + subtitle, timestamp badge, optional status
 * badge, and an optional quick-action button (e.g. "Extend +1h").
 * Tapping the card calls `onPress`; tapping the quick-action calls
 * `onQuickAction` without bubbling to the card.
 *
 * Web-safe nesting: the outer card uses a plain View + an absolutely-
 * positioned Pressable overlay so the quick-action Pressable is never
 * a DOM descendant of another <button> element.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';

import { IonIcon, IonIconName } from './IonIcon';
import { StatusBadge, BadgeVariant } from './StatusBadge';
import { Notification } from '@/features/notifications/types';

// ─── Icon map ────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<Notification['type'], IonIconName> = {
  hold_ready:    'book',
  seat_expiring: 'time',
  seat_released: 'alert-circle',
  system_info:   'information-circle',
};

// ─── Status badge derivation ──────────────────────────────────────────────────

function deriveBadge(
  n: Notification,
): { label: string; variant: BadgeVariant } | null {
  if (n.type === 'seat_expiring' && n.detail?.expiresAt) {
    return { label: `Expires ${n.detail.expiresAt}`, variant: 'warning' };
  }
  if (n.type === 'seat_released') {
    return { label: 'Released', variant: 'error' };
  }
  if (n.type === 'hold_ready') {
    return { label: 'Ready', variant: 'success' };
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onQuickAction?: () => void;
}

export function NotificationCard({
  notification,
  onPress,
  onQuickAction,
}: NotificationCardProps) {
  const isUnread = notification.status === 'unread';
  const badge = deriveBadge(notification);
  const iconName = TYPE_ICON[notification.type];

  return (
    /**
     * Outer View — NOT a Pressable so the quick-action button inside is
     * never nested inside another <button> on web.
     * A full-coverage Pressable overlay sits at z=0; the content sits at z=1
     * above it, so the quick-action button intercepts its own taps first.
     */
    <View
      style={[
        styles.card,
        isUnread && styles.cardUnread,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.subtitle}. ${notification.timestamp}`}
    >
      {/* Full-card tap target — sits behind all content */}
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.cardOverlay,
          pressed && styles.cardPressed,
        ]}
        accessibilityElementsHidden
        importantForAccessibility="no"
      />

      {/* Unread indicator stripe */}
      {isUnread && (
        <View
          style={[styles.unreadStripe, { backgroundColor: notification.accentColor }]}
          pointerEvents="none"
        />
      )}

      {/* Icon circle */}
      <View
        style={[
          styles.iconCircle,
          { backgroundColor: `${notification.accentColor}18` },
        ]}
        pointerEvents="none"
      >
        <IonIcon name={iconName} size={22} color={notification.accentColor} />
      </View>

      {/* Body — pointerEvents="box-none" lets the overlay catch taps on the
          text areas, while still allowing the quick-action button to receive
          its own press events */}
      <View style={styles.body} pointerEvents="box-none">
        {/* Title row */}
        <View style={styles.titleRow} pointerEvents="none">
          <Text
            style={[styles.title, isUnread && styles.titleUnread]}
            numberOfLines={1}
          >
            {notification.title}
          </Text>
          <Text style={styles.timestamp}>{notification.timestamp}</Text>
        </View>

        {/* Subtitle */}
        <Text style={styles.subtitle} numberOfLines={1} pointerEvents="none">
          {notification.subtitle}
        </Text>

        {/* Badge + quick-action row */}
        {(badge || notification.quickAction) && (
          <View style={styles.actionsRow} pointerEvents="box-none">
            {badge && (
              <View pointerEvents="none">
                <StatusBadge
                  label={badge.label}
                  variant={badge.variant}
                  size="sm"
                />
              </View>
            )}

            {/* Quick-action is a real Pressable but is NOT nested inside
                another Pressable — the outer card is a plain View */}
            {notification.quickAction && (
              <Pressable
                onPress={onQuickAction}
                style={({ pressed }) => [
                  styles.quickAction,
                  { borderColor: notification.accentColor },
                  pressed && styles.quickActionPressed,
                ]}
                accessibilityRole="button"
                accessibilityLabel={notification.quickAction}
              >
                <Text
                  style={[
                    styles.quickActionText,
                    { color: notification.accentColor },
                  ]}
                >
                  {notification.quickAction}
                </Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    padding: 14,
    gap: 12,
    overflow: 'hidden',
    position: 'relative',
    // Shadow
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  cardUnread: {
    borderColor: '#B3D0F7',
    backgroundColor: '#F4F9FF',
  },
  // Full-coverage overlay Pressable that handles the card tap
  cardOverlay: {
    ...StyleSheet.absoluteFill,
    borderRadius: 14,
    zIndex: 0,
  },
  cardPressed: {
    backgroundColor: 'rgba(0,0,0,0.04)',
  },
  unreadStripe: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    borderTopLeftRadius: 14,
    borderBottomLeftRadius: 14,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#1C283B',
    lineHeight: 20,
  },
  titleUnread: {
    fontWeight: '700',
  },
  timestamp: {
    fontSize: 11,
    color: '#6C7886',
    lineHeight: 16,
    flexShrink: 0,
  },
  subtitle: {
    fontSize: 13,
    color: '#6C7886',
    lineHeight: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  quickAction: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
