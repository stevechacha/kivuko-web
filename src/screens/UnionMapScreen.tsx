// screens/UnionMapScreen.tsx
// Step 5 of 5 — The Interactive "Live Union Map" & Admin Dashboard
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import Svg, { Rect, Ellipse, Path, Circle, Text as SvgText } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import ScreenHeader from '../components/ScreenHeader';
import { api, type ElderAudio, type MapConnection } from '../api/client';
import { useSession } from '../context/SessionContext';

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
  const { clearSession } = useSession();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [stats, setStats] = useState({ pairs: '128', regions: '14' });
  const [connections, setConnections] = useState<MapConnection[]>([]);
  const [audioArchive, setAudioArchive] = useState<ElderAudio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [mapStats, audio] = await Promise.all([api.getMapStats(), api.getAudioArchive()]);
        setStats({
          pairs: String(mapStats.pairs_today),
          regions: String(mapStats.regions_active),
        });
        setConnections(mapStats.connections);
        setAudioArchive(audio);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handlePlay = (id: string) => {
    setPlayingId(id);
    setTimeout(() => setPlayingId((cur) => (cur === id ? null : cur)), 2600);
  };

  const mapLines = buildConnections(connections);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={5} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader
          stepLabel="Hatua 5 ya 5 — Ramani Hai ya Muungano"
          title="Dashibodi ya Taifa"
        />

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: spacing.xl }} />
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
                  return (
                    <Path
                      key={i}
                      d={`M${c.from[0]} ${c.from[1]} Q ${midX} ${midY}, ${c.to[0]} ${c.to[1]}`}
                      stroke={c.color}
                      strokeWidth={1.8}
                      fill="none"
                      opacity={0.85}
                    />
                  );
                })}
              </Svg>
            </View>

            <View style={styles.sideCard}>
              <Text style={styles.sideCardTitle}>Hifadhi ya Sauti za Wazee</Text>
              <Text style={styles.sideCardSub}>
                Kumbukumbu za wazee kuhusu Muungano, zilizorekodiwa kwa sauti.
              </Text>
              {audioArchive.map((a) => (
                <View key={a.id} style={styles.archiveItem}>
                  <Pressable style={styles.archivePlay} onPress={() => handlePlay(a.id)}>
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
});
