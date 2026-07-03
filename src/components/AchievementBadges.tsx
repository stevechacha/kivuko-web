import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

type Badge = { id: string; icon: string; label: string; earned: boolean };

type Props = {
  points: number;
  missionSteps: number;
  hasCertificate: boolean;
};

export default function AchievementBadges({ points, missionSteps, hasCertificate }: Props) {
  const { t } = useLocale();

  const badges: Badge[] = [
    { id: 'join', icon: '🌊', label: t('badges.join'), earned: true },
    { id: 'match', icon: '🤝', label: t('badges.match'), earned: missionSteps >= 1 },
    { id: 'culture', icon: '🎭', label: t('badges.culture'), earned: missionSteps >= 2 },
    { id: 'cert', icon: '🏅', label: t('badges.cert'), earned: hasCertificate || missionSteps >= 4 },
    { id: 'uzalendo', icon: '⭐', label: t('badges.uzalendo'), earned: points >= 100 },
  ];

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('badges.title')}</Text>
      <View style={styles.row}>
        {badges.map((b) => (
          <View key={b.id} style={[styles.badge, !b.earned && styles.badgeLocked]}>
            <Text style={[styles.icon, !b.earned && styles.iconLocked]}>{b.icon}</Text>
            <Text style={[styles.label, !b.earned && styles.labelLocked]} numberOfLines={2}>
              {b.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  title: { fontSize: 11, fontWeight: '800', color: colors.greenDeep, marginBottom: 10, textTransform: 'uppercase' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: {
    width: 72,
    alignItems: 'center',
    backgroundColor: '#F0FAF8',
    borderRadius: radius.md,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.green,
  },
  badgeLocked: { backgroundColor: '#F4F7F6', borderColor: colors.line, opacity: 0.7 },
  icon: { fontSize: 22 },
  iconLocked: { opacity: 0.4 },
  label: { fontSize: 8, fontWeight: '700', color: colors.dark, textAlign: 'center', marginTop: 4 },
  labelLocked: { color: colors.textMuted },
});
