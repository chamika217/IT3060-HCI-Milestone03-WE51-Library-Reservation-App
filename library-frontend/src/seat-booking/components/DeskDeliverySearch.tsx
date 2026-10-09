import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, Shadows } from '../constants/designSystem';
import { MOCK_DESK_BOOK } from '../mock/roomsData';
import { BookItem } from '../types/seatBooking';

interface DeskDeliverySearchProps {
  seatNumber?: string;
  onToggleDelivery?: (enabled: boolean, book?: BookItem) => void;
}

export const DeskDeliverySearch: React.FC<DeskDeliverySearchProps> = ({
  seatNumber = 'B-14',
  onToggleDelivery,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('Software Architecture: Foundations');
  const [selectedBook, setSelectedBook] = useState<BookItem | null>(MOCK_DESK_BOOK);
  const [deliveryEnabled, setDeliveryEnabled] = useState<boolean>(true);

  const handleToggle = (value: boolean) => {
    setDeliveryEnabled(value);
    onToggleDelivery?.(value, value ? selectedBook || undefined : undefined);
  };

  return (
    <View style={styles.cardContainer}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View style={styles.titleGroup}>
          <Ionicons name="book-outline" size={16} color={Colors.primary} />
          <Text style={styles.headerTitle}>Desk Delivery (Optional)</Text>
        </View>

        <View style={styles.holdBadge}>
          <Text style={styles.holdBadgeText}>HOLD READY</Text>
        </View>
      </View>

      <Text style={styles.subtitleText}>
        Request physical hold delivery placed at your desk before arrival.
      </Text>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={16} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={(txt) => {
            setSearchQuery(txt);
            if (!txt) setSelectedBook(null);
            else setSelectedBook(MOCK_DESK_BOOK);
          }}
          placeholder="Search textbook title, ISBN or author..."
          placeholderTextColor={Colors.textSecondary}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')} activeOpacity={0.7}>
            <Ionicons name="close-circle" size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Selected Book Card */}
      {selectedBook && (
        <View style={styles.bookCard}>
          <View style={styles.bookIconBadge}>
            <Ionicons name="journal-outline" size={18} color={Colors.primary} />
            <Text style={styles.callNumText}>005.1</Text>
          </View>

          <View style={styles.bookInfo}>
            <Text style={styles.bookTitle}>{selectedBook.title}</Text>
            <Text style={styles.bookAuthor}>
              {selectedBook.author} • {selectedBook.edition}
            </Text>
            <View style={styles.stackRow}>
              <Text style={styles.stackTag}>{selectedBook.stack}</Text>
              <Text style={styles.stackDot}>{'//'}</Text>
              <Text style={styles.stackTag}>{selectedBook.shelf}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Place at Desk Toggle */}
      <View style={styles.toggleRow}>
        <Text style={styles.toggleLabel}>Place at Desk {seatNumber}</Text>
        <Switch
          value={deliveryEnabled}
          onValueChange={handleToggle}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#FFFFFF"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.card,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: Colors.textDark,
  },
  holdBadge: {
    backgroundColor: Colors.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  holdBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.success,
  },
  subtitleText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 42,
    backgroundColor: Colors.searchBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textDark,
  },
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: Colors.primarySoft,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4E5FA',
    marginBottom: 12,
    gap: 12,
  },
  bookIconBadge: {
    width: 44,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D4E5FA',
  },
  callNumText: {
    fontSize: 8,
    fontWeight: '800',
    color: Colors.primary,
    marginTop: 2,
  },
  bookInfo: {
    flex: 1,
  },
  bookTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  stackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stackTag: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textDark,
  },
  stackDot: {
    fontSize: 10,
    color: Colors.textSecondary,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F3F6',
  },
  toggleLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textDark,
  },
});
