import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

type Nav = Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;

type Props = {
  navigation: Nav;
};

const PILLARS = [
  { id: 'elder', icon: '🎙️', route: 'ElderRadio' as const, color: '#7C3AED' },
  { id: 'cert', icon: '📜', route: 'CertificateGallery' as const, color: colors.green },
  { id: 'safety', icon: '🛡️', route: 'ModeratorFlaggedContent' as const, color: '#DC2626' },
  { id: 'partner', icon: '🏛️', route: 'PartnerDashboard' as const, color: colors.blue },
] as const;

export default function WinningPitchPillars({ navigation }: Props) {
  const { t } = useLocale();

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t('pitch.eyebrow')}</Text>
      <Text style={styles.title}>{t('pitch.title')}</Text>
      <View style={styles.grid}>
        {PILLARS.map((p) => (
          <Pressable
            key={p.id}
            style={[styles.card, { borderLeftColor: p.color }]}
            onPress={() => navigation.navigate(p.route)}
          >
            <Text style={styles.icon}>{p.icon}</Text>
            <Text style={styles.cardTitle}>{t(`pitch.${p.id}Title`)}</Text>
            <Text style={styles.cardDesc}>{t(`pitch.${p.id}Desc`)}</Text>
            <Text style={[styles.cta, { color: p.color }]}>{t('pitch.open')} →</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: spacing.lg, marginBottom: spacing.md },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.dark, marginTop: 6, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 150,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    padding: 12,
  },
  icon: { fontSize: 22, marginBottom: 6 },
  cardTitle: { fontSize: 12, fontWeight: '800', color: colors.dark },
  cardDesc: { fontSize: 10, color: colors.textMuted, marginTop: 4, lineHeight: 15 },
  cta: { fontSize: 10, fontWeight: '800', marginTop: 8 },
});
