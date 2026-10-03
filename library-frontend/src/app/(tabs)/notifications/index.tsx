import { StyleSheet, Text, View } from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Notifications</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 20, fontWeight: 'bold' },
});