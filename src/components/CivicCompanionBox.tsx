import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import type { TKey } from '../i18n/strings';

type FaqKey = 'union' | 'jwtz' | 'nyerere' | 'default';

const FAQ_ANSWER_KEYS: Record<FaqKey, TKey> = {
  union: 'academy.faqUnion',
  jwtz: 'academy.faqJwtz',
  nyerere: 'academy.faqNyerere',
  default: 'academy.faqDefault',
};

function matchFaq(query: string): FaqKey {
  const q = query.toLowerCase();
  if (q.includes('muungano') || q.includes('union') || q.includes('1964') || q.includes('april')) return 'union';
  if (q.includes('jwtz') || q.includes('jeshi') || q.includes('army') || q.includes('military')) return 'jwtz';
  if (q.includes('nyerere') || q.includes('karume')) return 'nyerere';
  return 'default';
}

export default function CivicCompanionBox() {
  const { t } = useLocale();
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  const ask = () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    const key = matchFaq(trimmed);
    setAnswer(t(FAQ_ANSWER_KEYS[key]));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.badge}>{t('academy.companionBadge')}</Text>
      <Text style={styles.title}>{t('academy.companionTitle')}</Text>
      <Text style={styles.sub}>{t('academy.companionSub')}</Text>
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={t('academy.companionPlaceholder')}
          placeholderTextColor="#9AA5A3"
          onSubmitEditing={ask}
          returnKeyType="search"
        />
        <Pressable style={styles.askBtn} onPress={ask}>
          <Text style={styles.askBtnText}>{t('academy.companionAsk')}</Text>
        </Pressable>
      </View>
      {answer ? (
        <View style={styles.answerBox}>
          <Text style={styles.answerLabel}>{t('academy.companionAnswer')}</Text>
          <Text style={styles.answerText}>{answer}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#F8FAFC',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderStyle: 'dashed',
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  badge: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.blueDeep,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: { fontSize: 14, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
  row: { flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    backgroundColor: colors.white,
    color: colors.dark,
  },
  askBtn: {
    backgroundColor: colors.blue,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  askBtnText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  answerBox: {
    marginTop: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 12,
    borderWidth: 1,
    borderColor: '#C8E8E0',
  },
  answerLabel: { fontSize: 10, fontWeight: '800', color: colors.greenDeep, marginBottom: 4 },
  answerText: { fontSize: 12, color: colors.dark, lineHeight: 18 },
});
