// GalaLeaderboardScreen — Annual Union & Patriotism Gala vision (Top 10 Youth)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type LeaderboardEntry } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'GalaLeaderboard'>;

export default function GalaLeaderboardScreen({ navigation }: Props) {
  const { participant } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState<'all' | 'bara' | 'visiwani'>('all');

  useEffect(() => {
    setLoading(true);
    const region = regionFilter === 'all' ? undefined : regionFilter;
    api.getLeaderboard(10, region).then(setLeaders).finally(() => setLoading(false));
  }, [regionFilter]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.heroBadge}>{t('gala.heroBadge')}</Text>
          <Text style={styles.heroTitle}>{t('gala.heroTitle')}</Text>
          <Text style={styles.heroSub}>{t('gala.heroSub')}</Text>
        </View>

        <View style={styles.filterRow}>
          {(['all', 'bara', 'visiwani'] as const).map((r) => (
            <Pressable
              key={r}
              style={[styles.filterChip, regionFilter === r && styles.filterChipActive]}
              onPress={() => setRegionFilter(r)}
            >
              <Text style={[styles.filterText, regionFilter === r && styles.filterTextActive]}>
                {r === 'all' ? t('common.all') : r === 'bara' ? t('gala.filterBara') : t('gala.filterVisiwani')}
              </Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.list}>
            {leaders.map((entry) => {
              const isMe = participant?.name === entry.name;
              return (
                <View key={entry.rank} style={[styles.row, isMe && styles.rowMe, entry.rank <= 3 && styles.rowTop]}>
                  <Text style={styles.rank}>{entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{entry.name}{isMe ? ` ${t('gala.you')}` : ''}</Text>
                    <Text style={styles.meta}>{entry.home_area} · {entry.region_label} · {entry.grade.badge} {entry.grade.label}</Text>
                  </View>
                  <Text style={styles.pts}>{entry.patriotism_points.toLocaleString()}</Text>
                </View>
              );
            })}
          </View>
        )}

        <Text style={styles.note}>
          Wazee 10 bora pia wanatangazwa kwenye redio ya taifa — hakuna hadithi isiyosikika.
        </Text>

        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Button label={t('admin.backDashboard')} variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 720, alignSelf: 'center', width: '100%' },
  hero: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderBottomWidth: 4,
    borderBottomColor: colors.gold,
    marginBottom: spacing.lg,
  },
  heroBadge: { fontSize: 10, fontWeight: '800', color: colors.gold },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.white, marginTop: 8 },
  heroSub: { fontSize: 12, color: '#CBD5E1', marginTop: 8, lineHeight: 18 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  filterChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  filterChipActive: { backgroundColor: colors.green, borderColor: colors.green },
  filterText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  filterTextActive: { color: colors.white },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rowMe: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  rowTop: { borderColor: colors.gold },
  rank: { fontSize: 18, fontWeight: '800', width: 32, textAlign: 'center' },
  name: { fontSize: 14, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  pts: { fontSize: 14, fontWeight: '800', color: colors.greenDeep },
  note: { fontSize: 11, color: colors.textMuted, fontStyle: 'italic', marginTop: spacing.lg, textAlign: 'center' },
});
