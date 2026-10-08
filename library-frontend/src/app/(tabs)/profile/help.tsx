/**
 * Screen 9 — Help & Support
 * Route: /(tabs)/profile/help
 *
 * CRUD: Create (submit feedback), Read (load existing ratings), Delete (undo rating)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

import {
  ScreenHeader,
  BottomNavBar,
  IonIcon,
} from '@/components/shared';
import { MOCK_FAQS, FaqItem } from '@/features/profile/mockData';
import { ApiFaqFeedback } from '@/features/notifications/types';
import { submitFaqFeedback, getFaqFeedback, deleteFaqFeedback, getAuthUserId } from '@/services/api';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Filter chips ─────────────────────────────────────────────────────────────

type HelpFilter = 'all' | 'Book Holds' | 'Seat Booking' | 'Library Hours';
const FILTERS: HelpFilter[] = ['all', 'Book Holds', 'Seat Booking', 'Library Hours'];

// ─── FAQ accordion item ───────────────────────────────────────────────────────

interface FaqAccordionProps {
  item: FaqItem;
  isOpen: boolean;
  onToggle: () => void;
  /** Pre-existing feedback from the server, if any */
  existingFeedback: ApiFaqFeedback | null;
  onFeedbackChange: (updated: ApiFaqFeedback | null) => void;
}

function FaqAccordion({ item, isOpen, onToggle, existingFeedback, onFeedbackChange }: FaqAccordionProps) {
  const [submitting, setSubmitting] = useState(false);
  const [thanks,     setThanks]     = useState(false);

  // Derive current vote from server state
  const voted: 'yes' | 'no' | null = existingFeedback == null
    ? null
    : existingFeedback.helpful ? 'yes' : 'no';

  async function handleVote(helpful: boolean) {
    const voteKey = helpful ? 'yes' : 'no';
    setSubmitting(true);
    try {
      if (voted === voteKey) {
        // Same answer tapped again → undo (delete)
        if (existingFeedback) {
          await deleteFaqFeedback(existingFeedback._id);
          onFeedbackChange(null);
          setThanks(false);
        }
      } else {
        // New or changed answer → upsert
        const res = await submitFaqFeedback(item.id, helpful);
        onFeedbackChange(res.feedback);
        setThanks(true);
        setTimeout(() => setThanks(false), 3000);
      }
    } catch {
      // Fail silently — feedback is non-critical
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={faqStyles.item}>
      <Pressable
        onPress={onToggle}
        style={({ pressed }) => [faqStyles.question, pressed && faqStyles.questionPressed]}
        accessibilityRole="button"
        accessibilityLabel={item.question}
        accessibilityState={{ expanded: isOpen }}
      >
        <Text style={faqStyles.questionText}>{item.question}</Text>
        <IonIcon
          name={isOpen ? 'chevron-down' : 'chevron-forward'}
          size={16}
          color="#6C7886"
        />
      </Pressable>

      {isOpen && (
        <View style={faqStyles.answer}>
          <Text style={faqStyles.answerText}>{item.answer}</Text>
          <View style={faqStyles.helpfulRow}>
            <Text style={faqStyles.helpfulLabel}>Was this helpful?</Text>
            <Pressable
              onPress={() => !submitting && handleVote(true)}
              style={({ pressed }) => [
                faqStyles.helpfulBtn,
                voted === 'yes' && faqStyles.helpfulBtnActive,
                pressed && faqStyles.helpfulBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={voted === 'yes' ? 'Undo helpful vote' : 'Yes, this was helpful'}
            >
              <IonIcon name="thumbs-up-outline" size={13} color={voted === 'yes' ? '#FAFBFB' : '#25B87A'} />
              <Text style={[faqStyles.helpfulBtnText, { color: voted === 'yes' ? '#FAFBFB' : '#25B87A' }]}>
                Yes
              </Text>
            </Pressable>
            <Pressable
              onPress={() => !submitting && handleVote(false)}
              style={({ pressed }) => [
                faqStyles.helpfulBtn,
                voted === 'no' && faqStyles.helpfulBtnNo,
                pressed && faqStyles.helpfulBtnPressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={voted === 'no' ? 'Undo not-helpful vote' : 'No, this was not helpful'}
            >
              <IonIcon name="thumbs-down-outline" size={13} color={voted === 'no' ? '#FAFBFB' : '#6C7886'} />
              <Text style={[faqStyles.helpfulBtnText, { color: voted === 'no' ? '#FAFBFB' : '#6C7886' }]}>
                No
              </Text>
            </Pressable>
          </View>
          {thanks && (
            <Text style={faqStyles.thanksText}>Thanks for your feedback!</Text>
          )}
        </View>
      )}
    </View>
  );
}

const faqStyles = StyleSheet.create({
  item: {
    overflow: 'hidden',
  },
  question: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  questionPressed: {
    backgroundColor: '#F0F2F4',
  },
  questionText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C283B',
    lineHeight: 20,
  },
  answer: {
    paddingHorizontal: 16,
    paddingBottom: 14,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F2F4',
  },
  answerText: {
    fontSize: 13,
    color: '#6C7886',
    lineHeight: 20,
    paddingTop: 10,
  },
  helpfulRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  helpfulLabel: {
    fontSize: 12,
    color: '#6C7886',
    fontWeight: '500',
    marginRight: 2,
  },
  helpfulBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  helpfulBtnPressed: { opacity: 0.75 },
  helpfulBtnActive: {
    backgroundColor: '#25B87A',
    borderColor: '#25B87A',
  },
  helpfulBtnNo: {
    backgroundColor: '#6C7886',
    borderColor: '#6C7886',
  },
  helpfulBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  helpfulBtnTextActive: {
    color: '#FAFBFB',
  },
  thanksText: {
    fontSize: 12,
    color: '#25B87A',
    fontWeight: '600',
  },
});

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const [search,       setSearch]      = useState('');
  const [activeFilter, setFilter]      = useState<HelpFilter>('all');
  const [openId,       setOpenId]      = useState<string | null>(null);
  const [allExpanded,  setAllExpanded] = useState(false);
  // Map of faqId → feedback entry (or null if not yet rated)
  const [feedbackMap,  setFeedbackMap] = useState<Record<string, ApiFaqFeedback | null>>({});

  // Load existing feedback on mount
  useEffect(() => {
    getAuthUserId()
      .then((uid) => getFaqFeedback(uid))
      .then((entries) => {
        const map: Record<string, ApiFaqFeedback | null> = {};
        entries.forEach((e) => { map[e.faqId] = e; });
        setFeedbackMap(map);
      })
      .catch(() => {}); // non-critical
  }, []);

  function toggleItem(id: string) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (allExpanded) {
      setAllExpanded(false);
      setOpenId(openId === id ? null : id);
    } else {
      setOpenId((prev) => (prev === id ? null : id));
    }
  }

  function handleExpandAll() {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAllExpanded((v) => !v);
    setOpenId(null);
  }

  // Simple filter: if search matches the question text
  const filtered = MOCK_FAQS.filter((faq) =>
    search.trim() === '' || faq.question.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.screen}>
      <ScreenHeader title="Help & Support" onBack={() => router.back()} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Subtitle ─────────────────────────────────────────── */}
        <Text style={styles.subtitle}>Knowledge base & reference center</Text>

        {/* ── Search bar ───────────────────────────────────────── */}
        <View style={styles.searchWrap}>
          <IonIcon name="search" size={16} color="#6C7886" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search the catalog, guidelines, keywords..."
            placeholderTextColor="#6C7886"
            returnKeyType="search"
            accessibilityLabel="Search help topics"
          />
          {search.length > 0 && (
            <Pressable onPress={() => setSearch('')} hitSlop={8}>
              <IonIcon name="close" size={14} color="#6C7886" />
            </Pressable>
          )}
        </View>

        {/* ── Filter chips ─────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterRow}
        >
          {FILTERS.map((f) => {
            const active = f === activeFilter;
            return (
              <Pressable
                key={f}
                onPress={() => setFilter(f)}
                style={[styles.filterChip, active && styles.filterChipActive]}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  {f === 'all' ? 'All' : f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* ── FAQ section ──────────────────────────────────────── */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <Text style={styles.faqSectionLabel}>FREQUENTLY ASKED QUESTIONS</Text>
            <Pressable
              onPress={handleExpandAll}
              style={({ pressed }) => [pressed && styles.pressed]}
              accessibilityRole="button"
            >
              <Text style={styles.expandAllLink}>
                {allExpanded ? 'Collapse All' : 'Expand All'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.faqCard}>
            {filtered.map((faq, idx) => (
              <React.Fragment key={faq.id}>
                <FaqAccordion
                  item={faq}
                  isOpen={allExpanded || openId === faq.id}
                  onToggle={() => toggleItem(faq.id)}
                  existingFeedback={feedbackMap[faq.id] ?? null}
                  onFeedbackChange={(updated) =>
                    setFeedbackMap((prev) => ({ ...prev, [faq.id]: updated }))
                  }
                />
                {idx < filtered.length - 1 && (
                  <View style={styles.faqDivider} />
                )}
              </React.Fragment>
            ))}
            {filtered.length === 0 && (
              <View style={styles.emptyFaq}>
                <Text style={styles.emptyFaqText}>No results for "{search}"</Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Still need help card ─────────────────────────────── */}
        <View style={styles.assistCard}>
          <View style={styles.assistTop}>
            <IonIcon name="people-outline" size={22} color="#2D7CE9" />
            <View style={styles.assistText}>
              <Text style={styles.assistHeading}>Still need assistance?</Text>
              <Text style={styles.assistBody}>
                Our reference librarians are available Monday – Friday, 9 AM to 6 PM.
                They can help with holds, account issues, and research resources.
              </Text>
            </View>
          </View>
          <Pressable
            onPress={() => router.push('/(tabs)/profile/contact' as never)}
            style={({ pressed }) => [styles.assistBtn, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <IonIcon name="chatbubble-outline" size={16} color="#FAFBFB" />
            <Text style={styles.assistBtnText}>Contact Library Staff</Text>
          </Pressable>
        </View>

        {/* ── Footer ───────────────────────────────────────────── */}
        <Text style={styles.footer}>
          Curated with care by University Library Services
        </Text>
      </ScrollView>

      <BottomNavBar activeTab="profile" unreadCount={0} />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F5F7F7' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, gap: 14 },

  subtitle: {
    fontSize: 13,
    color: '#6C7886',
    marginTop: -4,
  },

  // Search
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FAFBFB',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C283B',
  },

  // Filter chips
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F0F2F4',
  },
  filterChipActive: {
    backgroundColor: '#2D7CE9',
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6C7886',
  },
  filterChipTextActive: {
    color: '#FAFBFB',
  },

  // FAQ section
  faqSection: { gap: 8 },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  faqSectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6C7886',
    letterSpacing: 0.8,
  },
  expandAllLink: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2D7CE9',
  },
  faqCard: {
    backgroundColor: '#FAFBFB',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#DDE2E6',
    overflow: 'hidden',
    shadowColor: '#1C283B',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  faqDivider: {
    height: 1,
    backgroundColor: '#F0F2F4',
    marginHorizontal: 16,
  },
  emptyFaq: {
    padding: 24,
    alignItems: 'center',
  },
  emptyFaqText: {
    fontSize: 13,
    color: '#6C7886',
  },

  // Assist card
  assistCard: {
    backgroundColor: '#EAF2FD',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#B3D0F7',
    padding: 16,
    gap: 14,
  },
  assistTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  assistText: { flex: 1, gap: 4 },
  assistHeading: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C283B',
  },
  assistBody: {
    fontSize: 13,
    color: '#6C7886',
    lineHeight: 19,
  },
  assistBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#2D7CE9',
    borderRadius: 10,
    paddingVertical: 12,
  },
  assistBtnText: {
    color: '#FAFBFB',
    fontWeight: '700',
    fontSize: 14,
  },

  // Footer
  footer: {
    fontSize: 12,
    color: '#6C7886',
    textAlign: 'center',
    paddingVertical: 4,
  },

  pressed: { opacity: 0.75 },
});
