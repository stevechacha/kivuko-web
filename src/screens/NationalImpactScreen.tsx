// NationalImpactScreen — public reach dashboard for judges & partners
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type LiveImpact, type MapStats } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { markVisited } from '../utils/visitTracking';

type Props = NativeStackScreenProps<RootStackParamList, 'NationalImpact'>;

function Stat({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export default function NationalImpactScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [impact, setImpact] = useState<LiveImpact | null>(null);
  const [map, setMap] = useState<MapStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markVisited('impact');
    Promise.all([api.getLiveImpact(), api.getMapStats()])
      .then(([i, m]) => {
        setImpact(i);
        setMap(m);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>{t('impact.badge')}</Text>
        <Text style={styles.title}>{t('impact.title')}</Text>
        <Text style={styles.sub}>{t('impact.sub')}</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <Stat label={t('impact.youth')} value={impact?.youth_connected ?? 0} accent={colors.blue} />
              <Stat label={t('impact.pairsToday')} value={impact?.pairs_today ?? 0} accent={colors.gold} />
              <Stat label={t('impact.certs')} value={impact?.certificates_issued ?? 0} accent={colors.green} />
              <Stat label={t('impact.connections')} value={impact?.live_connections ?? 0} />
              <Stat label={t('impact.bara')} value={impact?.bara_youth ?? 0} />
              <Stat label={t('impact.visiwani')} value={impact?.visiwani_youth ?? 0} />
              <Stat label={t('impact.regions')} value={impact?.regions_active ?? map?.regions_active ?? 0} />
              <Stat label={t('impact.missions')} value={map?.pairs_today ?? impact?.pairs_today ?? 0} />
            </View>

            {impact?.activity?.length ? (
              <View style={styles.feed}>
                <Text style={styles.feedTitle}>{t('impact.liveFeed')}</Text>
                {impact.activity.slice(0, 6).map((a) => (
                  <View key={a.id} style={styles.feedItem}>
                    <Text style={styles.feedIcon}>{a.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.feedText}>{a.text}</Text>
                      <Text style={styles.feedSub}>{a.subtitle}</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : null}

            <View style={styles.actions}>
              <Button label={t('impact.viewMap')} onPress={() => navigation.navigate('UnionMap')} />
              <Button label={t('impact.partnerDash')} variant="ghost" onPress={() => navigation.navigate('PartnerDashboard')} />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  badge: { fontSize: 9, fontWeight: '800', color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.dark },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 4, fontWeight: '600' },
  feed: { marginTop: 20, backgroundColor: colors.white, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  feedTitle: { fontSize: 12, fontWeight: '800', color: colors.dark, marginBottom: 10 },
  feedItem: { flexDirection: 'row', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: colors.line },
  feedIcon: { fontSize: 18 },
  feedText: { fontSize: 12, fontWeight: '700', color: colors.dark },
  feedSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  actions: { marginTop: 20, gap: 10 },
});
