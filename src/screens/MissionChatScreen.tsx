// screens/MissionChatScreen.tsx
// Step 3 of 5 — Joint Mission & Live Chat (design: screen-mission)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  ScrollView,
  Modal,
  SafeAreaView,
  Platform,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import { api, type ChatMessage, type QuizQuestion, type QuizSubmitResponse } from '../api/client';
import { useSession } from '../context/SessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MissionChat'>;

export default function MissionChatScreen({ route, navigation }: Props) {
  const { userName: routeUserName, missionId: routeMissionId } = route.params ?? {};
  const { participant, missionId: sessionMissionId, updateParticipant } = useSession();
  const missionId = routeMissionId || sessionMissionId;
  const userName = routeUserName || participant?.name || 'Mzalendo';
  const { width } = useWindowDimensions();
  const isWide = width >= 760;
  const chatScrollRef = useRef<ScrollView>(null);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [rewardVisible, setRewardVisible] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);

  useEffect(() => {
    if (!missionId) {
      setLoadError('Hakuna dhamira iliyopatikana. Tafadhali fanya uoanishaji kwanza.');
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoadError(null);
      try {
        const [chat, questions] = await Promise.all([
          participant?.session_token
            ? api.getChat(missionId, participant.session_token)
            : Promise.resolve([]),
          api.getQuizQuestions(),
        ]);
        setMessages(chat);
        setQuiz(questions);
        if (!participant?.session_token) {
          setLoadError('Kipindi kimeisha. Tafadhali jisajili tena ili kuendelea.');
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Imeshindwa kupakia dhamira.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [missionId, participant?.session_token]);

  useEffect(() => {
    chatScrollRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async () => {
    if (!missionId || !draft.trim() || !participant?.session_token || sending) return;
    setSending(true);
    try {
      const res = await api.sendMessage(missionId, draft, participant.session_token);
      setMessages((prev) => [...prev, res.sent, res.reply]);
      setDraft('');
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
          setTimeout(() => setRewardVisible(true), 500);
        }
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : 'Imeshindwa kuwasilisha majibu.');
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <ActivityIndicator color={colors.green} size="large" />
      </SafeAreaView>
    );
  }

  if (!missionId || loadError) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopNav currentStep={3} />
        <View style={[styles.page, styles.centered, { flex: 1, paddingTop: 40 }]}>
          <Text style={styles.errorText}>{loadError || 'Dhamira haipatikani.'}</Text>
          <View style={{ marginTop: 16 }}>
            <Button label="Rudi kwenye Usajili" onPress={() => navigation.navigate('Onboarding')} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={3} />
      <ScrollView contentContainerStyle={styles.page}>
        <Text style={styles.stepEyebrow}>Hatua 3 ya 5 — Dhamira ya Pamoja</Text>

        <View style={styles.card}>
          <View style={styles.missionHead}>
            <View>
              <Text style={styles.missionEyebrow}>Dhamira 1</Text>
              <Text style={styles.missionTitle}>Jaribio la Historia ya Muungano</Text>
            </View>
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsBadgeText}>Pointi 50 zinasubiri</Text>
            </View>
          </View>

          <View style={[styles.chatLayout, isWide && styles.chatLayoutWide]}>
            {/* Chat column — messages + input stay together */}
            <View style={[styles.chatCol, isWide && styles.chatColWide]}>
              <ScrollView
                ref={chatScrollRef}
                style={[styles.chatMsgs, isWide ? styles.chatMsgsWide : styles.chatMsgsNarrow]}
                contentContainerStyle={styles.chatMsgsContent}
                keyboardShouldPersistTaps="handled"
              >
                {messages.map((item) => (
                  <ChatBubble key={item.id} message={item} />
                ))}
              </ScrollView>
              <View style={styles.inputRow}>
                <TextInput
                  value={draft}
                  onChangeText={setDraft}
                  placeholder="Andika ujumbe…"
                  placeholderTextColor="#9AA5A3"
                  style={styles.input}
                  onSubmitEditing={sendMessage}
                />
                <Pressable style={styles.sendBtn} onPress={sendMessage} disabled={sending}>
                  <Text style={{ color: colors.white, fontSize: 16 }}>➤</Text>
                </Pressable>
              </View>
            </View>

            {/* Quiz column — scrolls independently */}
            <ScrollView
              style={[
                styles.quizCol,
                isWide ? styles.quizColWide : styles.quizColNarrow,
              ]}
              contentContainerStyle={styles.quizColContent}
              keyboardShouldPersistTaps="handled"
            >
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
                    const showState = locked;
                    return (
                      <Pressable
                        key={oi}
                        onPress={() => answerQuestion(item.id, oi)}
                        disabled={locked}
                        style={[
                          styles.qOption,
                          showState && isCorrect && styles.qOptionCorrect,
                          showState && isChosenWrong && styles.qOptionWrong,
                          locked && styles.qOptionLocked,
                        ]}
                      >
                        <View
                          style={[
                            styles.qMark,
                            showState && isCorrect && styles.qMarkCorrect,
                            showState && isChosenWrong && styles.qMarkWrong,
                          ]}
                        >
                          {showState && isCorrect && <Text style={styles.qMarkText}>✓</Text>}
                          {showState && isChosenWrong && <Text style={styles.qMarkText}>✕</Text>}
                        </View>
                        <Text style={styles.qOptionText}>{opt}</Text>
                      </Pressable>
                    );
                  })}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>

        <View style={styles.footerRow}>
          <Button label="Rudi Nyuma" variant="ghost" onPress={() => navigation.goBack()} />
        </View>
      </ScrollView>

      <Modal visible={rewardVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Text style={{ fontSize: 30 }}>🏆</Text>
            </View>
            <Text style={styles.rewardTitle}>Mmefanikiwa! Dhamira Imekamilika</Text>
            <Text style={styles.rewardBody}>
              {userName} na rafiki yake wamemaliza Jaribio la Historia ya Muungano pamoja.
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

function ChatBubble({ message }: { message: ChatMessage }) {
  if (message.from_role === 'system') {
    return (
      <View style={styles.systemBubbleWrap}>
        <Text style={styles.systemBubbleText}>{message.text}</Text>
      </View>
    );
  }
  const mine = message.from_role === 'me';
  return (
    <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubblePeer]}>
      <Text style={[styles.bubbleText, mine && styles.bubbleTextMe]}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  page: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  stepEyebrow: {
    fontSize: 12.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: colors.greenDeep,
    marginTop: 20,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  missionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 22,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  missionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.greenDeep,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  missionTitle: { fontSize: 18, fontWeight: '700', color: colors.dark },
  pointsBadge: {
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  pointsBadgeText: { fontSize: 11, fontWeight: '800', color: '#5C4400' },
  chatLayout: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: radius.lg,
    borderBottomRightRadius: radius.lg,
  },
  chatLayoutWide: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  chatCol: {
    backgroundColor: colors.white,
  },
  chatColWide: {
    flex: 1.2,
    borderRightWidth: 1,
    borderRightColor: colors.line,
  },
  chatMsgs: {
    backgroundColor: colors.white,
  },
  chatMsgsWide: {
    height: 440,
  },
  chatMsgsNarrow: {
    maxHeight: 300,
  },
  chatMsgsContent: {
    padding: 20,
    gap: 10,
    flexGrow: 1,
  },
  inputRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    backgroundColor: colors.white,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: colors.white,
    color: colors.dark,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: {
    maxWidth: '76%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
  },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: colors.green,
    borderBottomRightRadius: 4,
  },
  bubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF2F7',
    borderWidth: 1,
    borderColor: '#D6E6EE',
    borderBottomLeftRadius: 4,
  },
  bubbleText: { fontSize: 14, lineHeight: 20, color: colors.dark },
  bubbleTextMe: { color: colors.white },
  systemBubbleWrap: {
    alignSelf: 'center',
    backgroundColor: '#FBF6E3',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  systemBubbleText: { fontSize: 12, color: '#7A5E00' },
  quizCol: {
    backgroundColor: colors.white,
  },
  quizColWide: {
    flex: 1,
    maxHeight: 440,
  },
  quizColNarrow: {
    borderTopWidth: 1,
    borderTopColor: colors.line,
    maxHeight: undefined,
  },
  quizColContent: {
    padding: 20,
  },
  quizBlock: { marginBottom: 22 },
  quizQuestion: {
    fontWeight: '700',
    fontSize: 14.5,
    color: colors.dark,
    marginBottom: 10,
    lineHeight: 20,
  },
  qOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  qOptionCorrect: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  qOptionWrong: { borderColor: colors.danger, backgroundColor: '#FDF0EE' },
  qOptionLocked: { opacity: 1 },
  qMark: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qMarkCorrect: { backgroundColor: colors.green, borderColor: colors.green },
  qMarkWrong: { backgroundColor: colors.danger, borderColor: colors.danger },
  qMarkText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  qOptionText: { fontSize: 13.5, color: colors.dark, flex: 1, lineHeight: 19 },
  footerRow: { marginTop: 22, flexDirection: 'row' },
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
  rewardBody: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  rewardPillRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 18,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
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
