import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Button, Card, Icon, Message, Screen, Section, u } from '@/components/library/ui';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import type { Notification } from '@/features/notifications/types';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '@/services/api';
import { useLibrary } from '@/state/library';
import { palette as c } from '@/constants/design-system';

type FilterKey = 'all' | 'books' | 'seats' | 'system';
const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'books', label: 'Books' },
  { key: 'seats', label: 'Seats' },
  { key: 'system', label: 'System' },
];

export default function Notifications() {
  const { user } = useLibrary();
  const userId = user?.id;
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<FilterKey>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      setNotifications(await getNotifications(userId));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not load notifications.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useFocusEffect(useCallback(() => {
    void loadNotifications();
  }, [loadNotifications]));

  async function openNotification(notification: Notification) {
    try {
      if (notification.status === 'unread') {
        await markNotificationRead(notification.id);
        setNotifications(current => current.map(item =>
          item.id === notification.id ? { ...item, status: 'read' } : item,
        ));
      }
      router.push({ pathname: '/(tabs)/notifications/[id]', params: { id: notification.id } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not open this notification.');
    }
  }

  async function markAllRead() {
    if (!userId) return;
    try {
      await markAllNotificationsRead(userId);
      setNotifications(current => current.map(item => ({ ...item, status: 'read' })));
      setError('');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update notifications.');
    }
  }

  const unreadCount = notifications.filter(item => item.status === 'unread').length;
  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'books') return notification.type === 'hold_ready';
    if (selectedFilter === 'seats') return notification.type === 'seat_expiring' || notification.type === 'seat_released';
    if (selectedFilter === 'system') return notification.type === 'system_info';
    return true;
  });
  const countForFilter = (filter: FilterKey) => notifications.filter(notification => {
    if (filter === 'books') return notification.type === 'hold_ready';
    if (filter === 'seats') return notification.type === 'seat_expiring' || notification.type === 'seat_released';
    if (filter === 'system') return notification.type === 'system_info';
    return true;
  }).length;

  return (
    <Screen
      title="Notifications"
      subtitle="LIBRARY UPDATES"
      tab="alerts"
      alertCount={unreadCount}
      action={(
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Notification preferences"
          onPress={() => router.push('/(tabs)/notifications/preferences')}
          style={u.iconButton}
        >
          <Icon name="sliders" size={19} color={c.primary} />
        </Pressable>
      )}
    >
      {!userId ? (
        <Card style={{ alignItems: 'center', paddingVertical: 30, gap: 12 }}>
          <Icon name="bell" size={28} />
          <Text style={u.heading}>Sign in to view your notifications</Text>
          <Button onPress={() => router.push('/login')}>Sign in</Button>
        </Card>
      ) : (
        <>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {FILTERS.map(filter => {
              const selected = filter.key === selectedFilter;
              return (
                <Pressable
                  key={filter.key}
                  accessibilityRole="tab"
                  accessibilityState={{ selected }}
                  onPress={() => setSelectedFilter(filter.key)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    paddingHorizontal: 14,
                    paddingVertical: 9,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: selected ? c.primary : c.border,
                    backgroundColor: selected ? c.primarySoft : c.card,
                  }}
                >
                  <Text style={{ color: selected ? c.primary : c.secondary, fontSize: 12, fontWeight: '700' }}>
                    {filter.label}
                  </Text>
                  <Text style={{ color: selected ? c.primary : c.secondary, fontSize: 11 }}>
                    {countForFilter(filter.key)}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {unreadCount > 0 && (
            <View style={u.between}>
              <Text style={[u.small, { color: c.secondary }]}>{unreadCount} unread updates</Text>
              <Pressable accessibilityRole="button" onPress={() => void markAllRead()}>
                <Text style={[u.link, { color: c.primary }]}>Mark all read</Text>
              </Pressable>
            </View>
          )}

          {!!error && <Message error>{error}</Message>}

          {loading ? (
            <View style={{ padding: 32, alignItems: 'center' }}>
              <ActivityIndicator color={c.primary} />
              <Text style={[u.small, { marginTop: 10 }]}>Loading notifications…</Text>
            </View>
          ) : filteredNotifications.length > 0 ? (
            <>
              <Section title="Recent updates" />
              {filteredNotifications.map(notification => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onPress={() => void openNotification(notification)}
                />
              ))}
            </>
          ) : (
            <Card style={{ alignItems: 'center', paddingVertical: 30, gap: 12 }}>
              <View style={{ width: 56, height: 56, borderRadius: 12, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name="bell" size={26} color={c.primary} />
              </View>
              <Text style={[u.caption, { color: c.primary, fontWeight: '700' }]}>ALL CLEAR</Text>
              <Text style={u.heading}>{notifications.length ? 'No matching notifications' : 'No notifications yet'}</Text>
              <Text style={[u.body, { textAlign: 'center' }]}>
                {notifications.length
                  ? 'Try another category to see more library updates.'
                  : 'Reservation confirmations and library updates will appear here.'}
              </Text>
              {notifications.length === 0 && (
                <Button outline icon="archive" onPress={() => router.push('/books/reservations')}>
                  View reservations
                </Button>
              )}
            </Card>
          )}
        </>
      )}
    </Screen>
  );
}
