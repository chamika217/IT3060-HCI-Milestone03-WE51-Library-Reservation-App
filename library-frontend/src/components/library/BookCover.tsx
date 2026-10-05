import { Image } from 'expo-image';
import { View } from 'react-native';
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
];

export default function BookCover({ book, large = false }: { book: Book; large?: boolean }) {
	const cover = covers[Number(book.id) - 1];
	const width = large ? 106 : 62;
	const height = large ? 144 : 86;

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
			) : null}
		</View>
	);
}
