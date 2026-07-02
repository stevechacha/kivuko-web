// screens/MissionChatScreen.tsx
// Step 3 of 5 — Joint Mission & Live Chat Interface
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import { api, type ChatMessage, type QuizQuestion } from '../api/client';
import { useSession } from '../context/SessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MissionChat'>;

export default function MissionChatScreen({ route, navigation }: Props) {
  const { userName, missionId } = route.params;
  const { participant } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [rewardVisible, setRewardVisible] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [chat, questions] = await Promise.all([
          participant?.session_token
            ? api.getChat(missionId, participant.session_token)
            : Promise.resolve([]),
          api.getQuizQuestions(),
        ]);
        setMessages(chat);
        setQuiz(questions);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [missionId, participant?.session_token]);

  const sendMessage = async () => {
    if (!draft.trim() || !participant?.session_token || sending) return;
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
    if (answers[questionId] !== undefined || !participant?.session_token) return;
    const updated = { ...answers, [questionId]: optionIndex };
    setAnswers(updated);

    if (Object.keys(updated).length === quiz.length) {
      try {
        const result = await api.submitQuiz(missionId, updated, participant.session_token);
        if (result.completed) {
          setTimeout(() => setRewardVisible(true), 400);
        }
      } catch {
        // Keep local UI state even if submit fails
        setTimeout(() => setRewardVisible(true), 400);
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

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.missionHead}>
        <View>
          <Text style={styles.eyebrow}>Dhamira 1</Text>
          <Text style={styles.missionTitle}>Jaribio la Historia ya Muungano</Text>
        </View>
        <View style={styles.pointsBadge}>
          <Text style={styles.pointsBadgeText}>Pointi 50 zinasubiri</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.chatArea}>
          <FlatList
            data={messages}
            keyExtractor={(m) => m.id}
            contentContainerStyle={{ padding: spacing.md, gap: 8 }}
            renderItem={({ item }) => <ChatBubble message={item} />}
          />
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

        <View style={styles.quizArea}>
          {quiz.map((item, qi) => (
            <View key={item.id} style={{ marginBottom: spacing.lg }}>
              <Text style={styles.quizQuestion}>
                {qi + 1}. {item.question}
              </Text>
              {item.options.map((opt, oi) => {
                const answered = answers[item.id];
                const isCorrect = oi === item.correct_index;
                const isChosenWrong = answered === oi && oi !== item.correct_index;
                const showState = answered !== undefined;
                return (
                  <Pressable
                    key={oi}
                    onPress={() => answerQuestion(item.id, oi)}
                    style={[
                      styles.qOption,
                      showState && isCorrect && styles.qOptionCorrect,
                      showState && isChosenWrong && styles.qOptionWrong,
                    ]}
                  >
                    <View
                      style={[
                        styles.qMark,
                        showState && isCorrect && { backgroundColor: colors.green, borderColor: colors.green },
                        showState && isChosenWrong && { backgroundColor: colors.danger, borderColor: colors.danger },
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
        </View>
      </KeyboardAvoidingView>

      <Modal visible={rewardVisible} transparent animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.rewardCard}>
            <View style={styles.rewardIcon}>
              <Text style={{ fontSize: 28 }}>🏆</Text>
            </View>
            <Text style={styles.rewardTitle}>Mmefanikiwa! Dhamira Imekamilika</Text>
            <Text style={styles.rewardBody}>
              {userName} amemaliza Jaribio la Historia ya Muungano pamoja na rafiki yake.
            </Text>
            <View style={styles.rewardPillRow}>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardPillText}>🎁 TZS 500 Vocha ya Hewa</Text>
              </View>
              <View style={styles.rewardPill}>
                <Text style={styles.rewardPillText}>⭐ Pointi 50 za Uzalendo</Text>
              </View>
            </View>
            <View style={{ marginTop: spacing.lg }}>
              <Button
                label="Pata Cheti Chako →"
                onPress={() => {
                  setRewardVisible(false);
                  navigation.navigate('Certificate', { userName, missionId });
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
      <Text style={{ color: mine ? colors.white : colors.dark, fontSize: 14 }}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  centered: { alignItems: 'center', justifyContent: 'center' },
  missionHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.greenDeep, textTransform: 'uppercase' },
  missionTitle: { fontSize: 17, fontWeight: '700', color: colors.dark, marginTop: 2 },
  pointsBadge: { backgroundColor: colors.gold, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 },
  pointsBadgeText: { fontSize: 11, fontWeight: '800', color: '#5C4400' },
  chatArea: { height: 260, borderBottomWidth: 1, borderBottomColor: colors.line, backgroundColor: colors.white },
  inputRow: { flexDirection: 'row', padding: spacing.md, gap: 8, borderTopWidth: 1, borderTopColor: colors.line },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 9,
    fontSize: 14,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubble: { maxWidth: '76%', paddingVertical: 9, paddingHorizontal: 13, borderRadius: 16 },
  bubbleMe: { alignSelf: 'flex-end', backgroundColor: colors.green, borderBottomRightRadius: 4 },
  bubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: '#EAF2F7',
    borderWidth: 1,
    borderColor: '#D6E6EE',
    borderBottomLeftRadius: 4,
  },
  systemBubbleWrap: { alignSelf: 'center', backgroundColor: '#FBF6E3', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 5 },
  systemBubbleText: { fontSize: 11.5, color: '#7A5E00' },
  quizArea: { flex: 1, padding: spacing.lg },
  quizQuestion: { fontWeight: '700', fontSize: 14.5, color: colors.dark, marginBottom: 10 },
  qOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: colors.white,
  },
  qOptionCorrect: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  qOptionWrong: { borderColor: colors.danger, backgroundColor: '#FDF0EE' },
  qMark: { width: 18, height: 18, borderRadius: 9, borderWidth: 1.5, borderColor: colors.line, alignItems: 'center', justifyContent: 'center' },
  qMarkText: { color: colors.white, fontSize: 10, fontWeight: '700' },
  qOptionText: { fontSize: 13.5, color: colors.dark, flexShrink: 1 },
  overlay: { flex: 1, backgroundColor: 'rgba(26,26,26,0.55)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  rewardCard: { backgroundColor: colors.white, borderRadius: 20, padding: 30, maxWidth: 360, alignItems: 'center' },
  rewardIcon: { width: 60, height: 60, borderRadius: 30, backgroundColor: colors.gold, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  rewardTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: colors.dark },
  rewardBody: { fontSize: 13.5, color: colors.textMuted, textAlign: 'center', marginTop: 8 },
  rewardPillRow: { flexDirection: 'row', gap: 10, marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' },
  rewardPill: { backgroundColor: '#FBF6E3', borderWidth: 1, borderColor: '#F1E3A6', borderRadius: 12, paddingVertical: 8, paddingHorizontal: 12 },
  rewardPillText: { fontSize: 12.5, fontWeight: '700', color: '#7A5E00' },
});
