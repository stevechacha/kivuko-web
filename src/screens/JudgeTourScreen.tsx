// JudgeTourScreen — guided 3-minute judge walkthrough with progress tracking
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import { useSession } from '../context/SessionContext';
import { api } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'JudgeTour'>;

type TourStep = {
  id: number;
  title: string;
  desc: string;
  route: keyof RootStackParamList;
  time: string;
  done: boolean;
};

export default function JudgeTourScreen({ navigation }: Props) {
  const { participant, missionId } = useSession();
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (!participant?.session_token) return;
    api
      .getMissionProgress(participant.session_token)
      .then((p) => setProgressStep(p.completed_count))
      .catch(() => {});
  }, [participant?.session_token]);

  const steps: TourStep[] = [
    {
      id: 1,
      title: 'Usajili wa Mzalendo',
      desc: 'Jisajili Bara au Visiwani — taarifa halisi kutoka API.',
      route: 'Onboarding',
      time: '0:20',
      done: !!participant,
    },
    {
      id: 2,
      title: 'Dashibodi ya Kitaifa',
      desc: 'Milango minne + safari ya Dhamira 5.',
      route: 'HubDashboard',
      time: '0:40',
      done: !!participant,
    },
    {
      id: 3,
      title: 'Uoanishaji wa Kivuko',
      desc: 'Injini inaoanisha Bara ↔ Visiwani sekunde chache.',
      route: 'Matching',
      time: '1:00',
      done: !!missionId,
    },
    {
      id: 4,
      title: 'Chat ya WhatsApp + Jaribio',
      desc: 'Mazungumzo halisi na jaribio la 1964.',
      route: 'MissionChat',
      time: '1:25',
      done: progressStep >= 1,
    },
    {
      id: 5,
      title: 'Utamaduni & Maono',
      desc: 'Dhamira 2 na 3 — ubadilishanaji wa utamaduni.',
      route: 'CultureMission',
      time: '2:00',
      done: progressStep >= 3,
    },
    {
      id: 6,
      title: 'Cheti cha Balozi + QR',
      desc: 'Cheti kinachothibitishwa kwa CV.',
      route: 'Certificate',
      time: '2:20',
      done: progressStep >= 4,
    },
    {
      id: 7,
      title: 'Ramani Hai ya Muungano',
      desc: 'Miunganiko ya dhahabu Bara–Visiwani + sauti za wazee.',
      route: 'UnionMap',
      time: '2:45',
      done: progressStep >= 5,
    },
    {
      id: 8,
      title: 'Gala, Historia, WhatsApp',
      desc: 'Top 10 vijana, mstari wa historia, bot ya WhatsApp.',
      route: 'GalaLeaderboard',
      time: '3:00',
      done: false,
    },
  ];

  const nextStep = steps.find((s) => !s.done) ?? steps[steps.length - 1];
  const completedCount = steps.filter((s) => s.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.badge}>🎬 ONYESHO LA WAAMUZI</Text>
          <Text style={styles.title}>Safari ya Dakika 3 — Mwanzo hadi Mwisho</Text>
          <Text style={styles.sub}>
            Fuata hatua hizi kwa mpangilio. Kila hatua inaonyesha muda wa video na inaunganisha moja kwa moja na
            skrini halisi ya mfumo.
          </Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / steps.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {completedCount}/{steps.length} hatua zimekamilika
          </Text>
        </View>

        {steps.map((step) => (
          <Pressable
            key={step.id}
            style={[styles.stepCard, step.done && styles.stepDone, step.id === nextStep.id && !step.done && styles.stepNext]}
            onPress={() => navigation.navigate(step.route as never)}
          >
            <View style={styles.stepLeft}>
              <Text style={styles.stepNum}>{step.done ? '✓' : step.id}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.stepHead}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        <View style={styles.ctaBlock}>
          <Button
            label={`▶ Endelea: ${nextStep.title} →`}
            onPress={() => navigation.navigate(nextStep.route as never)}
          />
          <Button label="Rudi Nyumbani" variant="ghost" onPress={() => navigation.navigate('Landing')} />
        </View>

        <View style={styles.pitchBox}>
          <Text style={styles.pitchLabel}>ONE-LINE PITCH (kwa waamuzi)</Text>
          <Text style={styles.pitchText}>
            "Kivuko la Muungano Hub inaoanisha vijana wa Bara na Visiwani, inawapeleka kwenye Dhamira 5,
            inawapa cheti cha QR kinachothibitishwa, na inaonyesha umoja kwenye Ramani Hai — kupitia wavuti,
            WhatsApp, na USSD."
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 640, alignSelf: 'center', width: '100%' },
  hero: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    marginBottom: spacing.lg,
  },
  badge: { fontSize: 10, fontWeight: '800', color: colors.gold, letterSpacing: 1.2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, marginTop: 8 },
  sub: { fontSize: 13, color: '#CBD5E1', marginTop: 8, lineHeight: 20 },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 3 },
  progressText: { fontSize: 11, color: colors.gold, marginTop: 6, fontWeight: '700' },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 8,
  },
  stepDone: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  stepNext: { borderColor: colors.gold, borderWidth: 2 },
  stepLeft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { color: colors.white, fontWeight: '800', fontSize: 14 },
  stepHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, flex: 1 },
  stepTime: { fontSize: 10, color: colors.textMuted, fontWeight: '700' },
  stepDesc: { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 17 },
  chevron: { fontSize: 22, color: colors.textMuted, fontWeight: '300' },
  ctaBlock: { marginTop: spacing.lg, gap: 4 },
  pitchBox: {
    marginTop: spacing.xl,
    backgroundColor: '#FBF6E3',
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  pitchLabel: { fontSize: 9, fontWeight: '800', color: '#7A5E00', letterSpacing: 1 },
  pitchText: { fontSize: 12, color: colors.dark, marginTop: 8, lineHeight: 19, fontStyle: 'italic' },
});
