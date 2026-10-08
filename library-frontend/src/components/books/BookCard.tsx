import { Pressable, Text, View } from 'react-native';
import type { Book } from '@/types/book';
import { styles as s } from './styles';
export default function BookCard({ book, onPress }: { book: Book; onPress: () => void }) {
  return <Pressable accessibilityRole="button" accessibilityLabel={`View ${book.title}`} onPress={onPress} style={s.card}>
    <View style={s.row}><View style={[s.cover, { backgroundColor: book.color }]}><Text style={s.coverLetter}>{book.title[0]}</Text></View>
      <View style={s.grow}><Text style={s.heading}>{book.title}</Text><Text style={s.copy}>{book.author}</Text><Text style={s.copy}>{book.category}</Text></View></View>
    <Text numberOfLines={2} style={s.copy}>{book.description}</Text>
    <Text style={s.link}>{book.available ? `${book.copies} available · View details` : 'Unavailable · View details'}</Text>
  </Pressable>;
}
