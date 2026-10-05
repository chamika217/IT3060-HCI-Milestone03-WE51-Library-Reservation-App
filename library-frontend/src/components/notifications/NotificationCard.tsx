/**
 * NotificationCard — list item for the notifications screen.
 *
 * Web-safe design: there is exactly ONE Pressable per card (the outer card).
 * The quick-action "button" is a styled View + Text that uses onStartShouldSetResponder
 * on native and a role="button" + onClick on web — no nested <button> elements.
 */

import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Platform,
  GestureResponderEvent,
} from 'react-native';

import { IonIcon, IonIconName } from './IonIcon';
import { StatusBadge, BadgeVariant } from './StatusBadge';
import { Notification } from '@/features/notifications/types';

// ─── Icon map ─────────────────────────────────────────────────────────────────

const TYPE_ICON: Record<Notification['type'], IonIconName> = {
  hold_ready:    'book',
  seat_expiring: 'time',
  seat_released: 'alert-circle',
  system_info:   'information-circle',
};

// ─── Badge derivation ─────────────────────────────────────────────────────────

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

// ─── QuickActionPill ──────────────────────────────────────────────────────────
/**
 * A tappable pill that is intentionally NOT a Pressable/button so it can
 * live inside the card's outer Pressable without producing nested <button>
 * elements on web.
 *
 * On native: uses the responder system (onStartShouldSetResponder +
 *   onResponderGrant/Release) to handle tap + pressed feedback.
 * On web:    rendered as a <div role="button"> via accessibilityRole +
 *   the web onClick prop injected through rest props.
 */
interface QuickActionPillProps {
  label: string;
  accentColor: string;
  onPress?: () => void;
}

function QuickActionPill({ label, accentColor, onPress }: QuickActionPillProps) {
  const [pressed, setPressed] = React.useState(false);

  // Native responder callbacks — stop propagation so the card Pressable
  // doesn't also fire.
  function onStartShouldSetResponder() { return true; }
  function onResponderGrant(_e: GestureResponderEvent) { setPressed(true); }
  function onResponderRelease(_e: GestureResponderEvent) {
    setPressed(false);
    onPress?.();
  }
  function onResponderTerminate() { setPressed(false); }

  // Web-only: inject onClick + keyboard handler directly onto the View node
  const webProps = Platform.OS === 'web'
    ? {
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); onPress?.(); },
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.stopPropagation();
            onPress?.();
          }
        },
        tabIndex: 0,
        role: 'button' as const,
      }
    : {};

  return (
    <View
      accessibilityRole="button"
      accessibilityLabel={label}
      onStartShouldSetResponder={onStartShouldSetResponder}
      onResponderGrant={onResponderGrant}
      onResponderRelease={onResponderRelease}
      onResponderTerminate={onResponderTerminate}
      style={[
        styles.quickAction,
        { borderColor: accentColor },
        pressed && styles.quickActionPressed,
      ]}
      // Spread web-only props — on native these keys are ignored
      {...(webProps as object)}
    >
      <Text style={[styles.quickActionText, { color: accentColor }]}>
        {label}
      </Text>
    </View>
  );
}

// ─── NotificationCard ─────────────────────────────────────────────────────────

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
    // Single Pressable — the ONLY <button> in this subtree.
    // QuickActionPill handles its own tap without being a Pressable.
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        isUnread && styles.cardUnread,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${notification.title}. ${notification.subtitle}. ${notification.timestamp}`}
    >
      {/* Unread stripe */}
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

      {/* Body */}
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
                <StatusBadge label={badge.label} variant={badge.variant} size="sm" />
              </View>
            )}

            {/* QuickActionPill is a View, never a Pressable — safe to nest */}
            {notification.quickAction && (
              <QuickActionPill
                label={notification.quickAction}
                accentColor={notification.accentColor}
                onPress={onQuickAction}
              />
            )}
          </View>
        )}
      </View>
    </Pressable>
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
  cardPressed: {
    opacity: 0.85,
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
    cursor: 'pointer',
  } as object,
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
