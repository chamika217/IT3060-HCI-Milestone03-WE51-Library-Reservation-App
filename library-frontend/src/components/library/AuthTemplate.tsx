import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Icon, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';

const featuredCovers = [
  require('../../../assets/book-covers/cover-04.jpg'),
  require('../../../assets/book-covers/cover-14.jpg'),
  require('../../../assets/book-covers/cover-19.jpg'),
];

const readingSteps = [
  { number: '01', title: 'Discover', detail: 'Find books by title, author or subject.' },
  { number: '02', title: 'Reserve', detail: 'Choose a book and pickup window.' },
  { number: '03', title: 'Collect', detail: 'Bring your pickup code to the library.' },
];

type AuthTemplateProps = {
  children: ReactNode;
  footer?: ReactNode;
  accessLabel: string;
  accessBadge: string;
};

export default function AuthTemplate({ children, footer, accessLabel, accessBadge }: AuthTemplateProps) {
  const wide = useWindowDimensions().width >= 900;

  return (
    <View style={{ flex: 1, width: '100%', minWidth: 0, flexDirection: wide ? 'row' : 'column', backgroundColor: c.background }}>
      <View style={{ flex: wide ? 6 : undefined, width: wide ? undefined : '100%', minWidth: 0, minHeight: wide ? undefined : 330, backgroundColor: c.text, borderLeftWidth: 4, borderLeftColor: c.primary, padding: wide ? 44 : 24, justifyContent: 'space-between', gap: 28 }}>
        <View style={u.row}>
          <View style={{ width: 40, height: 40, borderRadius: 8, backgroundColor: c.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="book-open" color={c.text} size={21} />
          </View>
          <View>
            <Text style={{ color: c.white, fontSize: 16, fontWeight: '800' }}>LibraReserve</Text>
            <Text style={{ color: '#C7D2E0', fontSize: 9, marginTop: 3 }}>UNIVERSITY LIBRARY SERVICES</Text>
          </View>
        </View>

        <View style={{ gap: wide ? 20 : 14, maxWidth: 720, width: '100%', alignSelf: 'center' }}>
          <View style={u.row}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary }} />
            <Text style={{ color: '#C7D2E0', fontSize: 10, fontWeight: '700' }}>YOUR CAMPUS. YOUR NEXT CHAPTER.</Text>
          </View>
          <Text style={{ color: c.white, fontSize: wide ? 52 : 36, lineHeight: wide ? 58 : 42, fontWeight: '800' }}>
            Great ideas{'\n'}<Text style={{ color: c.primary }}>start here.</Text>
          </Text>
          <Text style={{ color: '#D3DDE8', fontSize: 14, lineHeight: 22, maxWidth: 460 }}>
            A little curiosity goes a long way. Discover your next read, reserve a book, and make more room for learning.
          </Text>

          <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: wide ? 16 : 10, paddingTop: 8 }}>
            {featuredCovers.map((cover, index) => {
              const imageWidth = wide ? 112 : 82;
              const imageHeight = wide ? 158 : 116;
              const rotation = index === 0 ? '-6deg' : index === 1 ? '0deg' : '6deg';
              const offset = index === 1 ? 14 : 0;
              return (
                <View key={index} style={{ width: imageWidth + 12, height: imageHeight + 12, marginBottom: offset, padding: 6, backgroundColor: c.white, borderRadius: 4, transform: [{ rotate: rotation }] }}>
                  <Image source={cover} contentFit="cover" accessibilityLabel={`Featured library book ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                </View>
              );
            })}
          </View>

          {wide && (
            <View style={{ flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: '#536477', paddingTop: 18 }}>
              {readingSteps.map(step => (
                <View key={step.number} style={{ flex: 1, gap: 6 }}>
                  <Text style={{ color: c.primary, fontSize: 10, fontWeight: '800' }}>{step.number}</Text>
                  <Text style={{ color: c.white, fontSize: 13, fontWeight: '700' }}>{step.title}</Text>
                  <Text style={{ color: '#C7D2E0', fontSize: 10, lineHeight: 15 }}>{step.detail}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {wide && <Text style={{ color: '#C7D2E0', fontSize: 10 }}>Built for curious minds. The campus library portal.</Text>}
      </View>

      <ScrollView style={{ flex: wide ? 4 : 1, width: wide ? undefined : '100%', minWidth: 0 }} contentContainerStyle={{ flexGrow: 1, width: '100%', minWidth: 0, justifyContent: 'center', alignItems: 'center', paddingHorizontal: wide ? 40 : 24, paddingVertical: 32 }} keyboardShouldPersistTaps="handled">
        <View style={{ width: '100%', minWidth: 0, maxWidth: 500, gap: 24 }}>
          <View style={u.between}>
            <Text style={[u.eyebrow, { color: c.secondary }]}>{accessLabel}</Text>
            <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }}>
              <Text style={{ color: c.secondary, fontSize: 10 }}>{accessBadge}</Text>
            </View>
          </View>

          {children}
          {footer && <View style={{ alignItems: 'center', gap: 5 }}>{footer}</View>}
        </View>
      </ScrollView>
    </View>
  );
}