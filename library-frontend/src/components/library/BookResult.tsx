import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import type { Book } from '@/types/book';
import BookCover from './BookCover';
import { Badge, Icon, u } from './ui';
export default function BookResult({ book }: { book: Book }) { return <Pressable accessibilityRole="button" accessibilityLabel={'View ' + book.title} onPress={() => router.push({ pathname: '/books/[id]', params: { id: book.id } })} style={u.card}><View style={u.row}><BookCover book={book} /><View style={{ flex: 1, gap: 6 }}><Badge tone={book.available ? 'success' : 'warning'}>{book.available ? book.copies + ' ON SHELF' : 'UNAVAILABLE'}</Badge><Text style={[u.heading, { fontSize: 14, lineHeight: 20 }]}>{book.title}</Text><Text style={u.small}>{book.author}</Text><Text style={u.caption}>{book.category}</Text></View><Icon name="chevron-right" size={17} /></View></Pressable>; }
