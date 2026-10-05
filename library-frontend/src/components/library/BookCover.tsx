import { Text, View } from 'react-native';
import { palette as c } from '@/constants/design-system';
import type { Book } from '@/types/book';
export default function BookCover({ book, large = false }: { book: Book; large?: boolean }) { return <View style={{ width: large ? 106 : 62, height: large ? 144 : 86, backgroundColor: book.color || c.primarySoft, borderRadius: 6, padding: large ? 12 : 7, borderLeftWidth: 5, borderLeftColor: 'rgba(28,40,59,0.15)', justifyContent: 'space-between' }}><Text numberOfLines={4} style={{ color: c.text, fontSize: large ? 15 : 9, fontWeight: '800' }}>{book.title}</Text><View style={{ height: 1, backgroundColor: 'rgba(28,40,59,0.2)' }} /><Text numberOfLines={2} style={{ color: c.text, fontSize: large ? 9 : 6 }}>{book.author}</Text></View>; }
