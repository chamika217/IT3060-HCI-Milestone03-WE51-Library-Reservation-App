/**
 * NotificationCard — notification list item.
 *
 * Web-nesting problem (recurring):
 *   Pressable → <button>
 *   Any child View with responder/accessibility callbacks → <button>
 *   Result: nested <button> error on web.
 *
 * Permanent fix — platform split:
 *   • Native : outer card is a Pressable (normal RN behaviour)
 *   • Web    : outer card is a plain View; tap is handled by a full-coverage
 *              <div onClick> injected via a .web.tsx companion file.
 *              QuickActionPill is ALWAYS a plain View + onClick, never a Pressable.
 *
 * This file handles BOTH platforms by detecting Platform.OS at runtime and
 * choosing the correct outer wrapper so there is only one file to maintain.
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

function deriveBadge(n: Notification): { label: string; variant: BadgeVariant } | null {
  if (n.type === 'seat_expiring' && n.detail?.expiresAt)
    return { label: `Expires ${n.detail.expiresAt}`, variant: 'warning' };
  if (n.type === 'seat_released')
    return { label: 'Released', variant: 'error' };
  if (n.type === 'hold_ready')
    return { label: 'Ready', variant: 'success' };
  return null;
}

// ─── QuickActionPill ──────────────────────────────────────────────────────────
// Always a View — NEVER a Pressable — so it can never produce a nested <button>.
// On native: responder system.  On web: onClick on the div via spread props.

interface QuickActionPillProps {
  label: string;
  accentColor: string;
  onPress?: () => void;
}

function QuickActionPill({ label, accentColor, onPress }: QuickActionPillProps) {
  const [pressed, setPressed] = React.useState(false);

  const nativeResponder = {
    onStartShouldSetResponder: () => true,
    onResponderGrant:   (_e: GestureResponderEvent) => setPressed(true),
    onResponderRelease: (_e: GestureResponderEvent) => { setPressed(false); onPress?.(); },
    onResponderTerminate: () => setPressed(false),
  };

  // On web we spread onClick directly onto the View (renders as <div>).
  // We intentionally do NOT set accessibilityRole="button" — that would
  // make RN-Web render a <button> element and re-introduce the nesting error.
  const webHandlers = Platform.OS === 'web'
    ? {
        onClick: (e: React.MouseEvent) => { e.stopPropagation(); onPress?.(); },
        onMouseDown: () => setPressed(true),
        onMouseUp:   () => setPressed(false),
        onMouseLeave: () => setPressed(false),
        style: [
          styles.quickAction,
          { borderColor: accentColor, cursor: 'pointer' as const },
          pressed && styles.quickActionPressed,
        ],
      }
    : {};

  if (Platform.OS === 'web') {
    return (
      // @ts-ignore — web-only props (onClick, cursor) are valid on RN-Web View
      <View {...webHandlers} accessibilityLabel={label}>
        <Text style={[styles.quickActionText, { color: accentColor }]}>{label}</Text>
      </View>
    );
  }

  return (
    <View
      {...nativeResponder}
      accessibilityLabel={label}
      style={[
        styles.quickAction,
        { borderColor: accentColor },
        pressed && styles.quickActionPressed,
      ]}
    >
      <Text style={[styles.quickActionText, { color: accentColor }]}>{label}</Text>
    </View>
  );
}

// ─── Card inner content ───────────────────────────────────────────────────────
// Extracted so both the Pressable (native) and View (web) wrappers can reuse it.

interface CardContentProps {
  notification: Notification;
  isUnread: boolean;
  badge: { label: string; variant: BadgeVariant } | null;
  iconName: IonIconName;
  onQuickAction?: () => void;
}

function CardContent({ notification, isUnread, badge, iconName, onQuickAction }: CardContentProps) {
  return (
    <>
      {/* Unread stripe */}
      {isUnread && (
        <View
          style={[styles.unreadStripe, { backgroundColor: notification.accentColor }]}
          pointerEvents="none"
        />
      )}

      {/* Icon circle */}
      <View
        style={[styles.iconCircle, { backgroundColor: `${notification.accentColor}18` }]}
        pointerEvents="none"
      >
        <IonIcon name={iconName} size={22} color={notification.accentColor} />
      </View>

      {/* Body */}
      <View style={styles.body} pointerEvents="box-none">
        <View style={styles.titleRow} pointerEvents="none">
          <Text style={[styles.title, isUnread && styles.titleUnread]} numberOfLines={1}>
            {notification.title}
          </Text>
          <Text style={styles.timestamp}>{notification.timestamp}</Text>
        </View>

        <Text style={styles.subtitle} numberOfLines={1} pointerEvents="none">
          {notification.subtitle}
        </Text>

        {(badge || notification.quickAction) && (
          <View style={styles.actionsRow} pointerEvents="box-none">
            {badge && (
              <View pointerEvents="none">
                <StatusBadge label={badge.label} variant={badge.variant} size="sm" />
              </View>
            )}
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
    </>
  );
}

// ─── NotificationCard ─────────────────────────────────────────────────────────

interface NotificationCardProps {
  notification: Notification;
  onPress: () => void;
  onQuickAction?: () => void;
}

export function NotificationCard({ notification, onPress, onQuickAction }: NotificationCardProps) {
  const isUnread = notification.status === 'unread';
  const badge    = deriveBadge(notification);
  const iconName = TYPE_ICON[notification.type];

  const cardStyle = [styles.card, isUnread && styles.cardUnread];
  const content   = (
    <CardContent
      notification={notification}
      isUnread={isUnread}
      badge={badge}
      iconName={iconName}
      onQuickAction={onQuickAction}
    />
  );

  // ── Web: plain View + onClick — zero nested <button> elements ─────────────
  if (Platform.OS === 'web') {
    // Cast to 'any' so TypeScript accepts the web-only onClick prop.
    // RN-Web renders View as a <div>, so onClick is valid at runtime.
    // No accessibilityRole="button" — that makes RN-Web emit a <button>
    // element which would produce the nested-button error again.
    const WebView = View as React.ComponentType<React.ComponentProps<typeof View> & { onClick?: () => void }>;
    return (
      <WebView
        style={[styles.card, isUnread && styles.cardUnread]}
        onClick={onPress}
        accessibilityLabel={`${notification.title}. ${notification.subtitle}`}
      >
        {content}
      </WebView>
    );
  }

  // ── Native: Pressable (renders as a touchable, no DOM concern) ────────────
  return (
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
      {content}
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
  },
  quickActionPressed: {
    opacity: 0.7,
  },
  quickActionText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
