import type { ReactNode } from 'react';
import { Image } from 'expo-image';
import { ScrollView, Text, View, StyleSheet, Platform } from 'react-native';
import { Icon, u } from '@/components/library/ui';
import { palette as c } from '@/constants/design-system';

const featuredCovers = [
  require('../../../assets/book-covers/cover-04.jpg'),
  require('../../../assets/book-covers/cover-14.jpg'),
  require('../../../assets/book-covers/cover-19.jpg'),
];

type AuthTemplateProps = {
  children: ReactNode;
  footer?: ReactNode;
  accessLabel: string;
  accessBadge: string;
};

export default function AuthTemplate({ children, footer, accessLabel, accessBadge }: AuthTemplateProps) {
  return (
    <View style={s.outer}>
      <View style={s.frame}>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mobile Hero Header */}
          <View style={s.heroBanner}>
            <View style={u.row}>
              <View style={s.logoIcon}>
                <Icon name="book-open" color={c.text} size={18} />
              </View>
              <View>
                <Text style={{ color: c.white, fontSize: 15, fontWeight: '800' }}>LibraReserve</Text>
                <Text style={{ color: '#C7D2E0', fontSize: 9, marginTop: 2 }}>UNIVERSITY LIBRARY SERVICES</Text>
              </View>
            </View>

            <View style={{ gap: 8, marginTop: 14 }}>
              <View style={u.row}>
                <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c.primary }} />
                <Text style={{ color: '#C7D2E0', fontSize: 9, fontWeight: '700' }}>YOUR CAMPUS. YOUR NEXT CHAPTER.</Text>
              </View>
              <Text style={{ color: c.white, fontSize: 26, lineHeight: 32, fontWeight: '800' }}>
                Great ideas <Text style={{ color: c.primary }}>start here.</Text>
              </Text>
              <Text style={{ color: '#D3DDE8', fontSize: 12, lineHeight: 18 }}>
                Discover your next read, reserve a book, and make more room for learning.
              </Text>
            </View>

            <View style={s.coversRow}>
              {featuredCovers.map((cover, index) => {
                const rotation = index === 0 ? '-6deg' : index === 1 ? '0deg' : '6deg';
                const offset = index === 1 ? 10 : 0;
                return (
                  <View key={index} style={[s.coverWrapper, { marginBottom: offset, transform: [{ rotate: rotation }] }]}>
                    <Image source={cover} contentFit="cover" accessibilityLabel={`Featured library book ${index + 1}`} style={{ width: '100%', height: '100%' }} />
                  </View>
                );
              })}
            </View>
          </View>

          {/* Form Content */}
          <View style={s.formContainer}>
            <View style={u.between}>
              <Text style={[u.eyebrow, { color: c.secondary }]}>{accessLabel}</Text>
              <View style={s.badgePill}>
                <Text style={{ color: c.secondary, fontSize: 10, fontWeight: '600' }}>{accessBadge}</Text>
              </View>
            </View>

            {children}

            {footer && <View style={{ alignItems: 'center', gap: 4, marginTop: 8 }}>{footer}</View>}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: c.background,
  },
  frame: {
    flex: 1,
    width: '100%',
    backgroundColor: c.background,
  },
  heroBanner: {
    backgroundColor: c.text,
    borderLeftWidth: 4,
    borderLeftColor: c.primary,
    padding: 20,
    paddingBottom: 24,
  },
  logoIcon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: c.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coversRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
    paddingTop: 16,
  },
  coverWrapper: {
    width: 74,
    height: 104,
    padding: 4,
    backgroundColor: c.white,
    borderRadius: 4,
    ...(Platform.OS === 'web' ? { boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)' } : {}),
  },
  formContainer: {
    padding: 20,
    gap: 20,
    flex: 1,
  },
  badgePill: {
    borderWidth: 1,
    borderColor: c.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
});