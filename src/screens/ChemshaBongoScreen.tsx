// ChemshaBongoScreen — Timed patriotism trivia game (competition wow-factor)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Modal,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type QuizQuestion } from '../api/client';
import { useSession } from '../context/SessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ChemshaBongo'>;

const TIMER_SEC = 15;

export default function ChemshaBongoScreen({ navigation }: Props) {
  const { participant, updateParticipant } = useSession();
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SEC);
  const [loading, setLoading] = useState(true);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<{ bonus: number; airtime: number; message: string } | null>(null);
  const answered = useRef(false);

  useEffect(() => {
    api.getQuizQuestions().then(setQuestions).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (loading || finished || !questions.length) return;
    answered.current = false;
    setTimeLeft(TIMER_SEC);
    const t = setInterval(() => {
      setTimeLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          goNext(false);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [index, loading, finished, questions.length]);

  const goNext = (correct: boolean) => {
    if (answered.current) return;
    answered.current = true;
    const newScore = correct ? score + 1 : score;
    if (index + 1 >= questions.length) {
      finishGame(newScore);
    } else {
      setScore(newScore);
      setIndex((i) => i + 1);
    }
  };

  const finishGame = async (finalScore: number) => {
    setFinished(true);
    setScore(finalScore);
    if (!participant?.session_token) return;
    try {
      const res = await api.submitChemshaBongo(finalScore, questions.length, participant.session_token);
      updateParticipant({ patriotism_points: res.patriotism_points });
      setResult({ bonus: res.bonus_points, airtime: res.airtime_reward_tzs, message: res.message });
    } catch {
      setResult({ bonus: finalScore * 10, airtime: 200, message: 'Umechemsha bongo!' });
    }
  };

  const pick = (oi: number) => {
    const q = questions[index];
    if (!q || answered.current) return;
    goNext(oi === q.correct_index);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center]}>
        <ActivityIndicator color={colors.green} size="large" />
      </SafeAreaView>
    );
  }

  const q = questions[index];
  const pct = questions.length ? Math.round((score / questions.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>Chemsha Bongo ya Muungano 🔥</Text>
        <Text style={styles.title}>Jibu haraka — kila sekunde inahesabu!</Text>

        <View style={styles.statsRow}>
          <StatBox label="Swali" value={`${Math.min(index + 1, questions.length)}/${questions.length}`} />
          <StatBox label="Alama" value={String(score)} accent={colors.gold} />
          <StatBox label="Muda" value={`${timeLeft}s`} accent={timeLeft <= 5 ? colors.danger : colors.blue} />
        </View>

        {!finished && q ? (
          <View style={styles.card}>
            <Text style={styles.question}>{q.question}</Text>
            {q.options.map((opt, oi) => (
              <Pressable key={oi} style={styles.option} onPress={() => pick(oi)}>
                <Text style={styles.optionText}>{opt}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Mchezo Umekamilika!</Text>
            <Text style={styles.doneScore}>{pct}% sahihi · Alama {score}/{questions.length}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Button label="Rudi Dashibodi" variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>

      <Modal visible={!!result} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{result?.message}</Text>
            <Text style={styles.modalPill}>🎁 TZS {result?.airtime} Vocha</Text>
            <Text style={styles.modalPill}>⭐ +{result?.bonus} Pointi za Uzalendo</Text>
            <View style={{ marginTop: 16 }}>
              <Button label="Endelea →" onPress={() => { setResult(null); navigation.navigate('HubDashboard'); }} />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function StatBox({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statValue, accent ? { color: accent } : null]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 640, alignSelf: 'center', width: '100%' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.greenDeep, textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 6 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 20, marginBottom: 16 },
  statBox: { flex: 1, backgroundColor: colors.white, borderRadius: 12, padding: 12, alignItems: 'center', borderWidth: 1, borderColor: colors.line },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.dark },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  question: { fontSize: 16, fontWeight: '700', color: colors.dark, marginBottom: 16, lineHeight: 24 },
  option: { borderWidth: 1.5, borderColor: colors.line, borderRadius: 10, padding: 14, marginBottom: 10, backgroundColor: '#FAFBFB' },
  optionText: { fontSize: 14, color: colors.dark },
  doneCard: { alignItems: 'center', padding: 40, backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 2, borderColor: colors.green },
  doneEmoji: { fontSize: 48 },
  doneTitle: { fontSize: 20, fontWeight: '800', marginTop: 12 },
  doneScore: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  modal: { backgroundColor: colors.white, borderRadius: 20, padding: 28, maxWidth: 360, width: '100%', alignItems: 'center' },
  modalTitle: { fontSize: 18, fontWeight: '800', textAlign: 'center', color: colors.dark },
  modalPill: { marginTop: 12, fontSize: 14, fontWeight: '700', color: '#7A5E00', backgroundColor: '#FBF6E3', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, overflow: 'hidden' },
});
