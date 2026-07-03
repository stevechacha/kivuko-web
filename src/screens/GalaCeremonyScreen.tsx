// GalaCeremonyScreen — live ceremony mode with youth + elder finalists
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator, Platform } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type GalaCeremony } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

let GalaLiveEmbed: React.ComponentType<{ url: string; height?: number }> = () => null;
if (Platform.OS === 'web') {
  GalaLiveEmbed = require('../components/GalaLiveEmbed.web').default;
}

type Props = NativeStackScreenProps<RootStackParamList, 'GalaCeremony'>;

export default function GalaCeremonyScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [data, setData] = useState<GalaCeremony | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getGalaCeremony().then(setData).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.liveBanner}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>{t('ceremony.live')}</Text>
        </View>
        <Text style={styles.title}>{data?.event_title ?? t('ceremony.title')}</Text>
        <Text style={styles.message}>{data?.ceremony_message}</Text>

        {data?.live_stream_url ? <GalaLiveEmbed url={data.live_stream_url} /> : null}

        {loading || !data ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : (
          <>
            <View style={styles.statsRow}>
              <MiniStat label={t('ceremony.certs')} value={data.total_certificates} />
              <MiniStat label={t('ceremony.connections')} value={data.total_connections} />
              <MiniStat label={t('ceremony.avgScore')} value={data.average_patriotism_score} />
            </View>

            <Text style={styles.section}>{t('ceremony.youthFinalists')}</Text>
            {data.youth_finalists.map((y) => (
              <View key={y.rank} style={[styles.card, y.gala_nominated && styles.cardNominated]}>
                <Text style={styles.medal}>{y.rank <= 3 ? ['🥇', '🥈', '🥉'][y.rank - 1] : `#${y.rank}`}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{y.name}{y.gala_nominated ? ' ★' : ''}</Text>
                  <Text style={styles.meta}>{y.home_area} · {y.patriotism_points} pts</Text>
                </View>
              </View>
            ))}

            <Text style={styles.section}>{t('ceremony.elderFinalists')}</Text>
            {data.elder_finalists.map((e) => (
              <View key={e.story_id} style={styles.card}>
                <Text style={styles.medal}>🎙️</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{e.contributor_name}</Text>
                  <Text style={styles.meta}>{e.title}</Text>
                </View>
              </View>
            ))}

            <Button label={t('ceremony.leaderboard')} onPress={() => navigation.navigate('GalaLeaderboard')} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.mini}>
      <Text style={styles.miniValue}>{value.toLocaleString()}</Text>
      <Text style={styles.miniLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 720, alignSelf: 'center', width: '100%' },
  liveBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'flex-start', backgroundColor: '#FEE2E2', paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626' },
  liveText: { fontSize: 11, fontWeight: '800', color: '#DC2626' },
  title: { fontSize: 24, fontWeight: '800', color: colors.dark, marginTop: 12 },
  message: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: spacing.lg, lineHeight: 20 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  mini: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 10, borderWidth: 1, borderColor: colors.line, alignItems: 'center' },
  miniValue: { fontSize: 16, fontWeight: '800', color: colors.green },
  miniLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center' },
  section: { fontSize: 13, fontWeight: '800', color: colors.dark, marginTop: spacing.md, marginBottom: 8 },
  card: { flexDirection: 'row', gap: 10, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  cardNominated: { borderColor: colors.gold, borderWidth: 2 },
  medal: { fontSize: 18, width: 36, textAlign: 'center' },
  name: { fontSize: 13, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
