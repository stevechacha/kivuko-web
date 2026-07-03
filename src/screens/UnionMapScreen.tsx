// screens/UnionMapScreen.tsx
// Step 5 of 5 — The Interactive "Live Union Map" & Admin Dashboard
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator, Platform } from 'react-native';
import Svg, { Rect, Ellipse, Path, Circle, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import ScreenHeader from '../components/ScreenHeader';
import { api, type ElderAudio, type MapConnection, type LiveImpact } from '../api/client';
import LiveActivityFeed from '../components/LiveActivityFeed';
import { useSession } from '../context/SessionContext';
import { playAudioUrl, stopActiveAudio } from '../utils/audio';
import { speakKiswahili, stopSpeech } from '../utils/speech';
import { useAppBack } from '../navigation/useAppBack';

let UnionLeafletMap: React.ComponentType<{ connections: MapConnection[]; height?: number }> | null = null;
if (Platform.OS === 'web') {
  UnionLeafletMap = require('../components/UnionLeafletMap.web').default;
}

type Props = NativeStackScreenProps<RootStackParamList, 'UnionMap'>;

const REGION_COORDS: Record<string, [number, number]> = {
  Mwanza: [120, 110],
  Dodoma: [200, 180],
  Mbeya: [150, 280],
  'Dar es Salaam': [260, 250],
  Unguja: [410, 200],
  Pemba: [430, 270],
};

function buildConnections(connections: MapConnection[]) {
  return connections.map((c, i) => {
    const from = REGION_COORDS[c.from_region] ?? [120, 110];
    const to = REGION_COORDS[c.to_region] ?? [410, 200];
    return {
      from,
      to,
      color: i % 2 === 0 ? colors.gold : colors.blue,
    };
  });
}

export default function UnionMapScreen({ navigation }: Props) {
  const { clearSession, participant, updateParticipant } = useSession();
  const goBack = useAppBack(navigation);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ pairs: '0', regions: '0' });
  const [connections, setConnections] = useState<MapConnection[]>([]);
  const [audioArchive, setAudioArchive] = useState<ElderAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activity, setActivity] = useState<LiveImpact['activity']>([]);

  const loadMapData = useCallback(async () => {
    const [mapResult, audioResult, impactResult] = await Promise.allSettled([
      api.getMapStats(),
      api.getAudioArchive(),
      api.getLiveImpact(),
    ]);

    if (mapResult.status === 'fulfilled') {
      setStats({
        pairs: String(mapResult.value.pairs_today),
        regions: String(mapResult.value.regions_active),
      });
      setConnections(mapResult.value.connections);
    }

    if (audioResult.status === 'fulfilled') {
      setAudioArchive(audioResult.value);
    }

    if (impactResult.status === 'fulfilled') {
      setActivity(impactResult.value.activity);
    }

    const allFailed =
      mapResult.status === 'rejected' &&
      audioResult.status === 'rejected' &&
      impactResult.status === 'rejected';

    if (allFailed) {
      const reason = mapResult.reason;
      setLoadError(reason instanceof Error ? reason.message : 'Imeshindwa kupakia ramani.');
      return false;
    }

    setLoadError(null);
    return true;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await loadMapData();
        if (participant?.session_token) {
          try {
            const progress = await api.getMissionProgress(participant.session_token);
            const step5 = progress.steps.find((s) => s.number === 5);
            if (step5 && step5.status !== 'completed') {
              const updated = await api.completeMissionStep(5, participant.session_token);
              if (updated.patriotism_points != null) {
                updateParticipant({ patriotism_points: updated.patriotism_points });
              }
            }
          } catch {
            // step may already be complete
          }
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Imeshindwa kupakia ramani.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [loadMapData, participant?.session_token, updateParticipant]);

  const handlePlay = (item: ElderAudio) => {
    if (playingId === item.id) {
      stopActiveAudio();
      stopSpeech();
      setPlayingId(null);
      return;
    }

    speakKiswahili(item.name, item.id);

    if (item.audio_url && playAudioUrl(item.audio_url)) {
      setPlayingId(item.id);
      return;
    }

    setPlayingId(item.id);
    setTimeout(() => setPlayingId((cur) => (cur === item.id ? null : cur)), 2600);
  };

  const mapLines = buildConnections(connections);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={5} showBack onBack={goBack} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          stepLabel="Hatua 5 ya 5 — Ramani Hai ya Muungano"
          title="Dashibodi ya Taifa"
        />

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: spacing.xl }} />
        ) : loadError ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{loadError}</Text>
            <View style={{ marginTop: spacing.md }}>
              <Button
                label="Jaribu Tena"
                variant="ghost"
                onPress={() => {
                  setLoading(true);
                  loadMapData().finally(() => setLoading(false));
                }}
              />
            </View>
          </View>
        ) : (
          <>
            <View style={styles.mapCard}>
              <View style={styles.mapHead}>
                <Text style={styles.mapHeadTitle}>Ramani Hai — Miunganisho ya Leo</Text>
                <View style={styles.statRow}>
                  <Stat label="Jozi" value={stats.pairs} />
                  <Stat label="Mikoa" value={stats.regions} />
                </View>
              </View>

              {UnionLeafletMap ? (
                <UnionLeafletMap connections={connections} height={320} />
              ) : (
              <Svg viewBox="0 0 500 420" width="100%" height={280}>
                <Rect x={0} y={0} width={500} height={420} rx={12} fill="#F0F5F4" />
                <Path
                  d="M60 60 L220 45 L300 80 L340 140 L310 220 L260 300 L180 340 L100 300 L70 220 L50 140 Z"
                  fill="#DCEDE7"
                  stroke={colors.green}
                  strokeWidth={1.5}
                />
                <Ellipse cx={410} cy={200} rx={20} ry={34} fill="#DCE9F2" stroke={colors.blue} strokeWidth={1.5} />
                <Ellipse cx={430} cy={270} rx={14} ry={22} fill="#DCE9F2" stroke={colors.blue} strokeWidth={1.5} />
                <SvgText x={392} y={150} fontSize={10} fontWeight="bold" fill={colors.blueDeep}>UNGUJA</SvgText>
                <SvgText x={402} y={308} fontSize={10} fontWeight="bold" fill={colors.blueDeep}>PEMBA</SvgText>

                <Circle cx={120} cy={110} r={4} fill={colors.green} />
                <SvgText x={90} y={100} fontSize={9} fill={colors.greenDeep}>Mwanza</SvgText>
                <Circle cx={200} cy={180} r={4} fill={colors.green} />
                <SvgText x={205} y={176} fontSize={9} fill={colors.greenDeep}>Dodoma</SvgText>
                <Circle cx={150} cy={280} r={4} fill={colors.green} />
                <SvgText x={118} y={298} fontSize={9} fill={colors.greenDeep}>Mbeya</SvgText>
                <Circle cx={260} cy={250} r={4} fill={colors.green} />
                <SvgText x={265} y={246} fontSize={9} fill={colors.greenDeep}>Dar</SvgText>

                {mapLines.map((c, i) => {
                  const midX = (c.from[0] + c.to[0]) / 2;
                  const midY = Math.min(c.from[1], c.to[1]) - 40;
                  const d = `M${c.from[0]} ${c.from[1]} Q ${midX} ${midY}, ${c.to[0]} ${c.to[1]}`;
                  return (
                    <React.Fragment key={i}>
                      <Path d={d} stroke={c.color} strokeWidth={5} fill="none" opacity={0.25} />
                      <Path d={d} stroke={c.color} strokeWidth={2} fill="none" opacity={0.95} />
                    </React.Fragment>
                  );
                })}
              </Svg>
              )}
            </View>

            {activity.length > 0 && <LiveActivityFeed items={activity} />}

            <View style={styles.sideCard}>
              <Text style={styles.sideCardTitle}>Hifadhi ya Sauti za Wazee</Text>
              <Text style={styles.sideCardSub}>
                Kumbukumbu za wazee kuhusu Muungano, zilizorekodiwa kwa sauti.
              </Text>
              {audioArchive.map((a) => (
                <View key={a.id} style={styles.archiveItem}>
                  <Pressable style={styles.archivePlay} onPress={() => handlePlay(a)}>
                    <Text style={{ color: colors.white, fontSize: 12 }}>{playingId === a.id ? '⏸' : '▶'}</Text>
                  </Pressable>
                  <View>
                    <Text style={styles.archiveName}>{a.name}, {a.area}</Text>
                    <Text style={styles.archiveMeta}>{a.duration_label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ alignItems: 'center', marginTop: spacing.xl }}>
          <Button
            label="↺ Anzisha Onyesho Tena"
            variant="ghost"
            onPress={() => {
              clearSession();
              navigation.navigate('Landing');
            }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ alignItems: 'center', marginLeft: 16 }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  mapCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, overflow: 'hidden' },
  mapHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.line },
  mapHeadTitle: { fontWeight: '700', fontSize: 14.5, color: colors.dark, flexShrink: 1 },
  statRow: { flexDirection: 'row' },
  statValue: { fontWeight: '700', fontSize: 15, color: colors.dark },
  statLabel: { fontSize: 10.5, color: colors.textMuted },
  sideCard: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.lg, marginTop: spacing.lg },
  sideCardTitle: { fontWeight: '700', fontSize: 15, color: colors.dark },
  sideCardSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 4 },
  archiveItem: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: colors.line, borderRadius: radius.md, padding: 12, marginTop: 12 },
  archivePlay: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.blue, alignItems: 'center', justifyContent: 'center' },
  archiveName: { fontSize: 13.5, fontWeight: '700', color: colors.dark },
  archiveMeta: { fontSize: 11, color: colors.textMuted },
  errorText: { color: colors.danger, fontSize: 14, textAlign: 'center' },
  errorWrap: { marginTop: spacing.lg, alignItems: 'center', paddingHorizontal: spacing.md },
});
