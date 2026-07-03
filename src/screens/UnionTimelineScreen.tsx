// UnionTimelineScreen — Interactive historical timeline of Tanzanian unity
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type TimelineEvent } from '../api/client';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'UnionTimeline'>;

export default function UnionTimelineScreen({ navigation }: Props) {
  const goBack = useAppBack(navigation);
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getTimelineEvents().then(setEvents).finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>Mstari wa Historia 🇹🇿</Text>
        <Text style={styles.title}>Safari ya Muungano (1961 — Leo)</Text>
        <Text style={styles.sub}>
          Matukio muhimu yaliyounda Jamhuri ya Muungano wa Tanzania — kutoka uhuru hadi kizazi cha kidijitali.
        </Text>

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.timeline}>
            {events.map((ev, i) => (
              <View key={ev.id} style={styles.row}>
                <View style={styles.rail}>
                  <View style={[styles.dot, i === events.length - 1 && styles.dotLatest]} />
                  {i < events.length - 1 && <View style={styles.line} />}
                </View>
                <View style={styles.card}>
                  <Text style={styles.year}>{ev.year}{ev.month_label ? ` · ${ev.month_label}` : ''}</Text>
                  <Text style={styles.eventTitle}>{ev.title}</Text>
                  <Text style={styles.eventDesc}>{ev.description}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <Button label="Rudi Dashibodi" variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 720, alignSelf: 'center', width: '100%' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.greenDeep, textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { fontSize: 24, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: spacing.lg },
  timeline: { gap: 0 },
  row: { flexDirection: 'row', gap: 14 },
  rail: { alignItems: 'center', width: 20 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.green, borderWidth: 2, borderColor: colors.white },
  dotLatest: { backgroundColor: colors.gold, width: 14, height: 14, borderRadius: 7 },
  line: { flex: 1, width: 2, backgroundColor: colors.line, minHeight: 40 },
  card: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: colors.line },
  year: { fontSize: 11, fontWeight: '800', color: colors.blueDeep },
  eventTitle: { fontSize: 15, fontWeight: '700', color: colors.dark, marginTop: 4 },
  eventDesc: { fontSize: 13, color: colors.textMuted, marginTop: 6, lineHeight: 19 },
});
