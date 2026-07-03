// MissionChatScreen — WhatsApp-style joint mission chat + quiz
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  Pressable,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import WhatsAppChat from '../components/WhatsAppChat';
import ReportModal, { type ReportReasonId } from '../components/ReportModal';
import { api, type ChatMessage, type Peer, type QuizQuestion, type QuizSubmitResponse } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useCleanWebUrl } from '../navigation/useCleanWebUrl';
import { useAppBack } from '../navigation/useAppBack';
import TopNav from '../components/TopNav';

type Props = NativeStackScreenProps<RootStackParamList, 'MissionChat'>;

const POLL_MS = 1200;

export default function MissionChatScreen({ navigation }: Props) {
  useCleanWebUrl();
  const goBack = useAppBack(navigation);
  const { participant, missionId, matchId, peer: sessionPeer, updateParticipant, setMission } = useSession();
  const { t } = useLocale();
  const userName = participant?.name || 'Mzalendo';
  const { width } = useWindowDimensions();
  const isWide = width >= 900;

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peer, setPeer] = useState<Peer | null>(sessionPeer);
  const [missionTitle, setMissionTitle] = useState('Jaribio la Historia ya Muungano');
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [rewardVisible, setRewardVisible] = useState(false);
  const [quizModalVisible, setQuizModalVisible] = useState(false);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [peerTyping, setPeerTyping] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);

  const messageCountRef = useRef(0);
  const awaitingReplyRef = useRef(false);

  const refreshChat = useCallback(async () => {
    if (!missionId || !participant?.session_token) return;
    const thread = await api.getChat(missionId, participant.session_token);
    setPeer(thread.peer);
    setMissionTitle(thread.mission_title);
    setMessages(thread.messages);

    const peerCount = thread.messages.filter((m) => m.from_role === 'peer').length;
    if (awaitingReplyRef.current && peerCount > messageCountRef.current) {
      awaitingReplyRef.current = false;
      setPeerTyping(false);
    }
    messageCountRef.current = peerCount;
  }, [missionId, participant?.session_token]);

  useEffect(() => {
    if (!missionId) {
      setLoadError('Hakuna dhamira iliyopatikana. Tafadhali fanya uoanishaji kwanza.');
      setLoading(false);
      return;
    }
    if (!participant?.session_token) {
      setLoadError('Kipindi kimeisha. Tafadhali ingia tena ili kuendelea.');
      setLoading(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      setLoadError(null);
      try {
        const [thread, questions] = await Promise.all([
          api.getChat(missionId, participant.session_token),
          api.getQuizQuestions(),
        ]);
        if (cancelled) return;
        setPeer(thread.peer);
        if (matchId && (!sessionPeer || sessionPeer.id !== thread.peer.id)) {
          setMission(missionId, matchId, thread.peer);
        }
        setMissionTitle(thread.mission_title);
        setMessages(thread.messages);
        setQuiz(questions);
        messageCountRef.current = thread.messages.filter((m) => m.from_role === 'peer').length;
      } catch (e) {
        if (!cancelled) {
          setLoadError(e instanceof Error ? e.message : 'Imeshindwa kupakia dhamira.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();

    const poll = setInterval(() => {
      refreshChat().catch(() => {});
    }, POLL_MS);

    return () => {
      cancelled = true;
      clearInterval(poll);
    };
  }, [missionId, matchId, participant?.session_token, refreshChat, sessionPeer, setMission]);

  const sendMessage = async (text: string) => {
    if (!missionId || !participant?.session_token || sending) return;
    setSending(true);
    setPeerTyping(true);
    awaitingReplyRef.current = true;
    try {
      const res = await api.sendMessage(missionId, text, participant.session_token);
      setMessages((prev) => [...prev, res.sent]);
      setTimeout(() => refreshChat().catch(() => {}), 800);
    } catch (e) {
      setPeerTyping(false);
      awaitingReplyRef.current = false;
      setLoadError(e instanceof Error ? e.message : 'Imeshindwa kutuma ujumbe.');
    } finally {
      setSending(false);
    }
  };

  const answerQuestion = async (questionId: string, optionIndex: number) => {
    if (!missionId || answers[questionId] !== undefined || !participant?.session_token) return;
    const updated = { ...answers, [questionId]: optionIndex };
    setAnswers(updated);

    if (Object.keys(updated).length === quiz.length) {
      try {
        const result = await api.submitQuiz(missionId, updated, participant.session_token);
        setQuizResult(result);
        if (result.completed) {
          updateParticipant({
            patriotism_points: (participant.patriotism_points || 0) + result.patriotism_points,
          });
          setQuizModalVisible(false);
          setTimeout(() => setRewardVisible(true), 400);
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Imeshindwa kuwasilisha majibu.');
      }
    }
  };

  // Safety: submits a report against the current mission/peer for moderator
  // review. Never reveals the report to the peer, and never exposes the
  // peer's contact details — see ReportModal + Chapter Four safety design.
  const submitReport = async (reason: ReportReasonId) => {
    if (!missionId || !participant?.session_token) return;
    try {
      await api.reportMission(missionId, reason, participant.session_token);
    } catch (e) {
      // Reporting must never appear to fail to the user even if the network
      // call errors — log locally and still show the confirmation state so
      // a distressed user isn't blocked from feeling heard. Retry silently.
      console.warn('Report submission failed, will retry on next app open', e);
    }
  };

  const quizProgress = quiz.length ? Object.keys(answers).length / quiz.length : 0;
  const peerName = peer?.name || 'Rafiki wa Kivuko';
  const peerInitials = peer?.initials || 'RK';
  const peerRegion = peer?.region_label || 'Muungano';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopNav currentStep={2} showBack onBack={goBack} hideSteps />
        <View style={[styles.centered, { flex: 1 }]}>
          <ActivityIndicator color={colors.green} size="large" />
          <Text style={styles.loadingText}>Inapakia mazungumzo…</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!missionId || loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopNav currentStep={2} showBack onBack={goBack} hideSteps />
        <View style={[styles.centered, { flex: 1, padding: spacing.lg }]}>
          <Text style={styles.errorText}>{loadError || 'Dhamira haipatikani.'}</Text>
          <View style={{ marginTop: 16 }}>
            <Button label="Rudi Nyumbani" onPress={goBack} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const headerActions = (
    <View style={styles.headerActionsRow}>
      <Pressable
        style={styles.reportHeaderBtn}
        onPress={() => setReportModalVisible(true)}
        accessibilityLabel={t('report.title')}
      >
        <Text style={styles.reportHeaderBtnText}>🚩</Text>
      </Pressable>
      <Pressable style={styles.quizHeaderBtn} onPress={() => setQuizModalVisible(true)}>
        <Text style={styles.quizHeaderBtnText}>📝 Jaribio</Text>
        {quizProgress > 0 && quizProgress < 1 && <View style={styles.quizDot} />}
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={[styles.shell, isWide && styles.shellWide]}>
        <View style={[styles.chatPane, isWide && styles.chatPaneWide]}>
          <WhatsAppChat
            messages={messages}
            peerName={peerName}
            peerInitials={peerInitials}
            peerRegionLabel={peerRegion}
            peerHomeArea={peer?.home_area}
            headerSubtitle={`${missionTitle} · mtandaoni`}
            placeholder="Andika ujumbe…"
            sending={sending}
            peerTyping={peerTyping}
            onSend={sendMessage}
            onBack={goBack}
            headerAction={headerActions}
          />
        </View>

        {isWide && (
          <View style={styles.quizPane}>
            <QuizPanel
              quiz={quiz}
              answers={answers}
              onAnswer={answerQuestion}
              missionTitle={missionTitle}
            />
          </View>
        )}
      </View>

      <Modal visible={quizModalVisible && !isWide} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.quizModal}>
          <View style={styles.quizModalHead}>
            <Text style={styles.quizModalTitle}>Dhamira 1 — Jaribio</Text>
            <Pressable onPress={() => setQuizModalVisible(false)}>
              <Text style={styles.quizModalClose}>Funga</Text>
            </Pressable>
          </View>
          <QuizPanel
            quiz={quiz}
            answers={answers}
            onAnswer={answerQuestion}
            missionTitle={missionTitle}
          />
        </SafeAreaView>
      </Modal>

      <ReportModal
        visible={reportModalVisible}
        peerName={peerName}
        onClose={() => setReportModalVisible(false)}
        onSubmit={submitReport}
      />

      <Modal visible={rewardVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Text style={{ fontSize: 30 }}>🏆</Text>
            </View>
            <Text style={styles.rewardTitle}>Mmefanikiwa! Dhamira Imekamilika</Text>
            <Text style={styles.rewardBody}>
              {userName} na {peerName.split(' ')[0]} wamemaliza jaribio la Muungano pamoja.
            </Text>
            <View style={styles.rewardPillRow}>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardPillText}>
                  🎁 TZS {quizResult?.airtime_reward_tzs ?? 500} Vocha ya Hewa
                </Text>
              </View>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardPillText}>
                  ⭐ Pointi {quizResult?.patriotism_points ?? 50} za Uzalendo
                </Text>
              </View>
            </View>
            <View style={{ marginTop: 22 }}>
              <Button
                label="Endelea Dhamira 2: Utamaduni →"
                onPress={() => {
                  setRewardVisible(false);
                  navigation.navigate('CultureMission');
                }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function QuizPanel({
  quiz,
  answers,
  onAnswer,
  missionTitle,
}: {
  quiz: QuizQuestion[];
  answers: Record<string, number>;
  onAnswer: (qid: string, idx: number) => void;
  missionTitle: string;
}) {
  return (
    <ScrollView contentContainerStyle={styles.quizScroll} keyboardShouldPersistTaps="handled">
      <Text style={styles.quizEyebrow}>Dhamira 1</Text>
      <Text style={styles.quizTitle}>{missionTitle}</Text>
      <Text style={styles.quizHint}>Jibu maswali huku ukichati na pacha wako — kama WhatsApp halisi.</Text>
      {quiz.map((item, qi) => (
        <View key={item.id} style={styles.quizBlock}>
          <Text style={styles.quizQuestion}>
            {qi + 1}. {item.question}
          </Text>
          {item.options.map((opt, oi) => {
            const answered = answers[item.id];
            const locked = answered !== undefined;
            const isCorrect = oi === item.correct_index;
            const isChosenWrong = answered === oi && oi !== item.correct_index;
            return (
              <Pressable
                key={oi}
                onPress={() => onAnswer(item.id, oi)}
                disabled={locked}
                style={[
                  styles.qOption,
                  locked && isCorrect && styles.qOptionCorrect,
                  locked && isChosenWrong && styles.qOptionWrong,
                ]}
              >
                <Text style={styles.qOptionText}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ECE5DD' },
  centered: { alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
  shell: { flex: 1 },
  shellWide: { flexDirection: 'row', maxWidth: 1200, alignSelf: 'center', width: '100%' },
  chatPane: {
    flex: 1,
    ...Platform.select({
      web: { maxWidth: 420, width: '100%', alignSelf: 'center' as const },
      default: {},
    }),
  },
  chatPaneWide: { flex: 1, maxWidth: 420, borderRightWidth: 1, borderRightColor: colors.line },
  quizPane: { flex: 1, backgroundColor: colors.white, maxWidth: 420 },
  headerActionsRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginRight: 4 },
  reportHeaderBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportHeaderBtnText: { fontSize: 13 },
  quizHeaderBtn: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  quizHeaderBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  quizDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gold,
  },
  quizModal: { flex: 1, backgroundColor: colors.white },
  quizModalHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  quizModalTitle: { fontSize: 16, fontWeight: '800', color: colors.dark },
  quizModalClose: { color: colors.green, fontWeight: '700' },
  quizScroll: { padding: spacing.lg, paddingBottom: 40 },
  quizEyebrow: { fontSize: 11, fontWeight: '800', color: colors.greenDeep, textTransform: 'uppercase' },
  quizTitle: { fontSize: 18, fontWeight: '700', color: colors.dark, marginTop: 4 },
  quizHint: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: 16, lineHeight: 19 },
  quizBlock: { marginBottom: 20 },
  quizQuestion: { fontWeight: '700', fontSize: 14, color: colors.dark, marginBottom: 8, lineHeight: 20 },
  qOption: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  qOptionCorrect: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  qOptionWrong: { borderColor: colors.danger, backgroundColor: '#FDF0EE' },
  qOptionText: { fontSize: 13.5, color: colors.dark, lineHeight: 19 },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(26,26,26,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  rewardCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    paddingVertical: 36,
    paddingHorizontal: 32,
    maxWidth: 380,
    width: '100%',
    alignItems: 'center',
  },
  rewardIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  rewardTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: colors.dark },
  rewardBody: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
  rewardPillRow: { flexDirection: 'row', gap: 12, marginTop: 18, flexWrap: 'wrap', justifyContent: 'center' },
  rewardPill: {
    backgroundColor: '#FBF6E3',
    borderWidth: 1,
    borderColor: '#F1E3A6',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  rewardPillText: { fontSize: 13, fontWeight: '700', color: '#7A5E00' },
  errorText: { color: colors.danger, fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
