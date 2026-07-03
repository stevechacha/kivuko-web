import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

const PILLS = ['pill1', 'pill2', 'pill3', 'pill4'] as const;

export default function MarketTrustBar() {
  const { t } = useLocale();

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t('market.eyebrow')}</Text>
      <View style={styles.row}>
        {PILLS.map((key) => (
          <View key={key} style={styles.pill}>
            <Text style={styles.pillText}>{t(`market.${key}`)}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.tagline}>{t('market.tagline')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 24,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
    maxWidth: 520,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.greenDeep,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  pill: {
    backgroundColor: '#F0FAF8',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: '#C8E6DF',
  },
  pillText: { fontSize: 10, fontWeight: '700', color: colors.dark },
  tagline: { fontSize: 12, color: colors.textMuted, marginTop: 12, lineHeight: 18 },
});
