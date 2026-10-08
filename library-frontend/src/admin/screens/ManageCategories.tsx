import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, font, radius } from '../theme';
import { Header, Card, Button, Input, Loading, ErrorBox, Empty, SectionTitle } from '../components';
import { notify, confirmAction } from '../dialog';
import useLoad from '../useLoad';
import api, { errMsg } from '../api';

export default function ManageCategories({ nav }: any) {
  const { data, loading, error, reload } = useLoad('/categories');
  const [name, setName] = useState('');
  const [editing, setEditing] = useState<any>(null);

  const save = async () => {
    if (!name.trim()) return notify('Missing name', 'Enter a category name');
    try {
      if (editing) await api.put(`/categories/${editing._id}`, { name: name.trim() });
      else await api.post('/categories', { name: name.trim() });
      setName('');
      setEditing(null);
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  const remove = async (c: any) => {
    const ok = await confirmAction('Delete category', `Delete "${c.name}"?`, 'Delete', true);
    if (!ok) return;
    try {
      await api.delete(`/categories/${c._id}`);
      reload();
    } catch (e) {
      notify('Error', errMsg(e));
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Manage Categories" subtitle="Organize library genres and topics" onBack={nav.goBack} />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <Card style={s.inputCard}>
          <SectionTitle
            title={editing ? `Edit Category` : 'Add New Category'}
            subtitle={editing ? `Renaming "${editing.name}"` : 'Create a new book classification'}
            style={{ marginTop: 0 }}
          />

          <Input
            label="Category Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Computer Science, Fiction, History"
            leftIcon="pricetag-outline"
          />

          <View style={{ flexDirection: 'row' }}>
            <Button
              title={editing ? 'Update Category' : 'Add Category'}
              icon={editing ? 'checkmark-outline' : 'add-outline'}
              style={{ flex: 1 }}
              onPress={save}
            />
            {editing && (
              <Button
                title="Cancel"
                variant="outline"
                style={{ flex: 1, marginLeft: spacing.sm }}
                onPress={() => {
                  setEditing(null);
                  setName('');
                }}
              />
            )}
          </View>
        </Card>

        <SectionTitle title="Existing Categories" subtitle={`${data?.length || 0} categories listed`} />

        {loading ? (
          <Loading message="Loading categories..." />
        ) : error ? (
          <ErrorBox message={error} onRetry={reload} />
        ) : !data || !data.length ? (
          <Empty text="No categories found" icon="pricetag-outline" />
        ) : (
          data.map((c: any) => (
            <Card key={c._id} style={s.categoryCard}>
              <View style={s.iconBox}>
                <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
              </View>
              <Text style={s.categoryName}>{c.name}</Text>
              <View style={s.actionGroup}>
                <Button
                  title="Edit"
                  variant="outline"
                  size="sm"
                  icon="create-outline"
                  style={{ marginRight: spacing.xs + 2 }}
                  onPress={() => {
                    setEditing(c);
                    setName(c.name);
                  }}
                />
                <Button
                  title="Delete"
                  variant="danger"
                  size="sm"
                  icon="trash-outline"
                  onPress={() => remove(c)}
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
  inputCard: {
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm + 4,
  },
  categoryName: {
    color: colors.text,
    fontWeight: '700',
    fontSize: font.body,
    flex: 1,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
