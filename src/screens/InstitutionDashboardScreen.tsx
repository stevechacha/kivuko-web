// InstitutionDashboardScreen — cohort campaign stats (Tier 1)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import { api, type InstitutionStats } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'InstitutionDashboard'>;

export default function InstitutionDashboardScreen({ route, navigation }: Props) {
  const { code } = route.params;
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [data, setData] = useState<InstitutionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getInstitutionStats(code)
      .then(setData)
      .catch(() => setError(t('institution.notFound')))
      .finally(() => setLoading(false));
  }, [code, t]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 40 }} />
        ) : error || !data ? (
          <Text style={styles.error}>{error ?? t('institution.notFound')}</Text>
        ) : (
          <>
            <Text style={styles.badge}>{data.code}</Text>
            <Text style={styles.title}>{data.name}</Text>
            <Text style={styles.sub}>{data.home_area} · {data.region_label}</Text>

            <View style={styles.stats}>
              <Stat label={t('institution.youth')} value={data.youth_count} />
              <Stat label={t('institution.pairs')} value={data.pairs_active} />
              <Stat label={t('institution.certs')} value={data.certificates} />
            </View>

            <Text style={styles.section}>{t('institution.leaderboard')}</Text>
            {data.leaderboard.length === 0 ? (
              <Text style={styles.empty}>{t('institution.empty')}</Text>
            ) : (
              data.leaderboard.map((y) => (
                <View key={y.rank} style={styles.row}>
                  <Text style={styles.rank}>#{y.rank}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{y.name}</Text>
                    <Text style={styles.meta}>{y.home_area} · {y.patriotism_points} pts · {y.grade}</Text>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  badge: { fontSize: 10, fontWeight: '800', color: colors.gold, letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 4, marginBottom: 16 },
  stats: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  stat: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, borderWidth: 1, borderColor: colors.line },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.dark },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4 },
  section: { fontSize: 14, fontWeight: '800', color: colors.dark, marginBottom: 10 },
  row: { flexDirection: 'row', gap: 10, backgroundColor: colors.white, padding: 12, borderRadius: radius.md, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  rank: { fontSize: 14, fontWeight: '800', color: colors.blue, width: 32 },
  name: { fontSize: 13, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  empty: { color: colors.textMuted, textAlign: 'center', marginTop: 12 },
  error: { color: '#DC2626', textAlign: 'center', marginTop: 40 },
});
