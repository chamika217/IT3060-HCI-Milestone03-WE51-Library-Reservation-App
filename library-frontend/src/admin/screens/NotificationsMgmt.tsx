import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox, Empty, SectionTitle } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function NotificationsMgmt({ nav }: any) {
  const { data, loading, error, reload } = useLoad('/announcements');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const add = async () => {
    if (!title.trim()) return Alert.alert('Missing title', 'Enter a title');
    try {
      await api.post('/announcements', { title: title.trim(), message: message.trim() });
      setTitle('');
      setMessage('');
      reload();
    } catch (e) {
      Alert.alert('Error', errMsg(e));
    }
  };

  const toggle = async (a: any) => {
    try {
      await api.put(`/announcements/${a._id}`, { active: !a.active });
      reload();
    } catch (e) {
      Alert.alert('Error', errMsg(e));
    }
  };

  const remove = (a: any) =>
    Alert.alert('Delete', `Delete "${a.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await api.delete(`/announcements/${a._id}`);
            reload();
          } catch (e) {
            Alert.alert('Error', errMsg(e));
          }
        },
      },
    ]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Notifications Management" subtitle="Broadcast system notices to users" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card style={s.publishCard}>
          <SectionTitle title="Create Announcement" subtitle="Broadcast notice to student & staff mobile apps" style={{ marginTop: 0 }} />

          <Input
            label="Announcement Title *"
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. System Maintenance Notice"
            leftIcon="megaphone-outline"
          />

          <Input
            label="Message Details"
            value={message}
            onChangeText={setMessage}
            placeholder="Enter announcement description..."
            multiline
            style={{ height: 80, textAlignVertical: 'top' }}
            leftIcon="document-text-outline"
          />

          <Button title="Publish Announcement" icon="send-outline" onPress={add} />
        </Card>

        <SectionTitle title="Active Announcements" subtitle={`${data?.length || 0} notices configured`} />

        {loading ? (
          <Loading message="Loading announcements..." />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : !data || !data.length ? (
          <Empty text="No announcements published" icon="notifications-off-outline" />
        ) : (
          data.map((a: any) => (
            <Card key={a._id} style={s.announcementCard}>
              <View style={s.cardTop}>
                <View style={s.iconBox}>
                  <Ionicons name="notifications-outline" size={20} color={colors.warning} />
                </View>
                <Text style={s.announcementTitle}>{a.title}</Text>
                <View style={s.switchWrapper}>
                  <Text style={s.switchLabel}>{a.active ? 'Active' : 'Draft'}</Text>
                  <Switch
                    value={a.active}
                    onValueChange={() => toggle(a)}
                    trackColor={{ false: colors.border, true: colors.success }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              </View>

              {!!a.message && <Text style={s.announcementBody}>{a.message}</Text>}

              <View style={s.cardFooter}>
                <Button
                  title="Delete Announcement"
                  variant="danger"
                  size="sm"
                  icon="trash-outline"
                  onPress={() => remove(a)}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  publishCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  announcementCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.warningLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 2,
  },
  announcementTitle: {
    fontWeight: '700',
    color: colors.text,
    fontSize: font.body,
    flex: 1,
  },
  switchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchLabel: {
    fontSize: font.xs,
    color: colors.textSecondary,
    marginRight: 6,
    fontWeight: '600',
  },
  announcementBody: {
    color: colors.textSecondary,
    fontSize: font.small,
    marginTop: spacing.sm,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: spacing.md,
    alignItems: 'flex-end',
  },
});
