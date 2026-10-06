import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, Alert } from 'react-native';
import { colors, spacing } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox, Empty } from '../components';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function NotificationsMgmt({ nav }: any) {
  const { data, loading, error, reload } = useLoad('/announcements');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');

  const add = async () => {
    if (!title.trim()) return Alert.alert('Missing title', 'Enter a title');
    try { await api.post('/announcements', { title, message }); setTitle(''); setMessage(''); reload(); }
    catch (e) { Alert.alert('Error', errMsg(e)); }
  };
  const toggle = async (a: any) => { await api.put(`/announcements/${a._id}`, { active: !a.active }); reload(); };
  const remove = (a: any) => Alert.alert('Delete', `Delete "${a.title}"?`, [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Delete', style: 'destructive', onPress: async () => { await api.delete(`/announcements/${a._id}`); reload(); } },
  ]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Notifications Management" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Card>
          <Input label="Announcement title" value={title} onChangeText={setTitle} />
          <Input label="Message" value={message} onChangeText={setMessage} multiline />
          <Button title="Publish announcement" onPress={add} />
        </Card>
        {loading ? <Loading /> : error ? <ErrorBox message={error} onRetry={reload} /> : !data.length ? <Empty text="No announcements" /> :
          data.map((a: any) => (
            <Card key={a._id}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: '700', color: colors.text, flex: 1 }}>{a.title}</Text>
                <Switch value={a.active} onValueChange={() => toggle(a)} trackColor={{ true: colors.success }} />
              </View>
              {!!a.message && <Text style={{ color: colors.textSecondary, marginVertical: spacing.sm }}>{a.message}</Text>}
              <Button title="Delete" variant="danger" style={{ paddingVertical: 6 }} onPress={() => remove(a)} />
            </Card>
          ))}
      </ScrollView>
    </View>
  );
}
