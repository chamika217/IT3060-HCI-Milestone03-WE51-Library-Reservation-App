import { Image } from 'expo-image';
import { Text, View } from 'react-native';
import { palette as c } from '@/constants/design-system';
import type { Book } from '@/types/book';

const covers = [
	require('../../../assets/book-covers/cover-01.jpg'),
	require('../../../assets/book-covers/cover-02.jpg'),
	require('../../../assets/book-covers/cover-03.jpg'),
	require('../../../assets/book-covers/cover-04.jpg'),
	require('../../../assets/book-covers/cover-05.jpg'),
	require('../../../assets/book-covers/cover-06.jpg'),
	require('../../../assets/book-covers/cover-07.jpg'),
	require('../../../assets/book-covers/cover-08.jpg'),
	require('../../../assets/book-covers/cover-09.jpg'),
	require('../../../assets/book-covers/cover-10.jpg'),
	require('../../../assets/book-covers/cover-11.jpg'),
	require('../../../assets/book-covers/cover-12.jpg'),
	require('../../../assets/book-covers/cover-13.jpg'),
	require('../../../assets/book-covers/cover-14.jpg'),
	require('../../../assets/book-covers/cover-15.jpg'),
	require('../../../assets/book-covers/cover-16.jpg'),
	require('../../../assets/book-covers/cover-17.jpg'),
	require('../../../assets/book-covers/cover-18.jpg'),
	require('../../../assets/book-covers/cover-19.jpg'),
	require('../../../assets/book-covers/cover-20.jpg'),
	require('../../../assets/book-covers/cover-21.jpg'),
	require('../../../assets/book-covers/cover-22.jpg'),
	require('../../../assets/book-covers/cover-23.jpg'),
	require('../../../assets/book-covers/cover-24.jpg'),
	require('../../../assets/book-covers/cover-25.jpg'),
	require('../../../assets/book-covers/cover-26.jpg'),
	require('../../../assets/book-covers/cover-27.jpg'),
	require('../../../assets/book-covers/cover-28.jpg'),
	require('../../../assets/book-covers/cover-29.jpg'),
	require('../../../assets/book-covers/cover-30.jpg'),
	require('../../../assets/book-covers/cover-31.jpg'),
	require('../../../assets/book-covers/cover-32.jpg'),
	require('../../../assets/book-covers/cover-33.jpg'),
	require('../../../assets/book-covers/cover-34.jpg'),
	require('../../../assets/book-covers/cover-35.jpg'),
	require('../../../assets/book-covers/cover-36.jpg'),
	require('../../../assets/book-covers/cover-37.jpg'),
	require('../../../assets/book-covers/cover-38.jpg'),
	require('../../../assets/book-covers/cover-39.jpg'),
	require('../../../assets/book-covers/cover-40.jpg'),
	require('../../../assets/book-covers/cover-41.jpg'),
	require('../../../assets/book-covers/cover-42.jpg'),
	require('../../../assets/book-covers/cover-43.jpg'),
	require('../../../assets/book-covers/cover-44.jpg'),
	require('../../../assets/book-covers/cover-45.jpg'),
	require('../../../assets/book-covers/cover-46.jpg'),
	require('../../../assets/book-covers/cover-47.jpg'),
	require('../../../assets/book-covers/cover-48.jpg'),
	require('../../../assets/book-covers/cover-49.jpg'),
	require('../../../assets/book-covers/cover-50.jpg'),
];

export default function BookCover({ book, large = false }: { book: Book; large?: boolean }) {
	const cover = covers[(book.cover ?? Number(book.id)) - 1];
	const width = large ? 106 : 62;
	const height = large ? 144 : 86;
	const initials = book.title.split(/\s+/).filter(Boolean).slice(0, 2).map(word => word[0]).join('').toUpperCase() || 'BK';

	return (
		<View
			style={{
				width,
				height,
				backgroundColor: book.color || c.primarySoft,
				borderRadius: 6,
				overflow: 'hidden',
			}}
		>
			{cover ? (
				<Image
					accessibilityLabel={`${book.title} cover`}
					source={cover}
					contentFit="cover"
					style={{ width: '100%', height: '100%' }}
					transition={150}
				/>
			) : (
				<View style={{ flex: 1, padding: large ? 10 : 6, justifyContent: 'space-between', borderLeftWidth: 3, borderLeftColor: c.primary }}>
					<Text style={{ color: c.primary, fontSize: large ? 28 : 17, fontWeight: '800', letterSpacing: -1 }}>{initials}</Text>
					<View style={{ gap: 3 }}>
						<Text numberOfLines={3} style={{ color: c.text, fontSize: large ? 9 : 7, lineHeight: large ? 12 : 9, fontWeight: '700' }}>{book.title}</Text>
						<Text numberOfLines={1} style={{ color: c.secondary, fontSize: large ? 7 : 6 }}>{book.author}</Text>
					</View>
				</View>
			)}
		</View>
	);
}
