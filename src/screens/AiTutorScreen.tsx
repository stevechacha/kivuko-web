// AiTutorScreen — Kiswahili Union history tutor (Tier 3 light)
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type AiTutorReply } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'AiTutor'>;

type Msg = { from: 'me' | 'tutor'; text: string };

export default function AiTutorScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [messages, setMessages] = useState<Msg[]>([
    { from: 'tutor', text: t('tutor.welcome') },
  ]);
  const [input, setInput] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>(['Muungano 1964', 'Nyerere', 'Uzalendo']);
  const [loading, setLoading] = useState(false);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setInput('');
    setMessages((m) => [...m, { from: 'me', text: q }]);
    setLoading(true);
    try {
      const res: AiTutorReply = await api.askAiTutor(q);
      setMessages((m) => [...m, { from: 'tutor', text: res.reply }]);
      if (res.suggestions?.length) setSuggestions(res.suggestions);
    } catch {
      setMessages((m) => [...m, { from: 'tutor', text: t('tutor.error') }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>{t('tutor.badge')}</Text>
        <Text style={styles.title}>{t('tutor.title')}</Text>

        {messages.map((m, i) => (
          <View key={i} style={[styles.bubble, m.from === 'me' ? styles.me : styles.tutor]}>
            <Text style={[styles.bubbleText, m.from === 'me' && styles.meText]}>{m.text}</Text>
          </View>
        ))}
        {loading ? <ActivityIndicator color={colors.gold} style={{ marginVertical: 8 }} /> : null}

        <View style={styles.chips}>
          {suggestions.map((s) => (
            <Pressable key={s} style={styles.chip} onPress={() => send(s)}>
              <Text style={styles.chipText}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder={t('tutor.placeholder')}
          onSubmitEditing={() => send(input)}
        />
        <Button label={t('tutor.send')} onPress={() => send(input)} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  badge: { fontSize: 9, fontWeight: '800', color: colors.gold, letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: '800', color: colors.dark, marginBottom: 16 },
  bubble: { maxWidth: '88%', padding: 12, borderRadius: radius.md, marginBottom: 8 },
  me: { alignSelf: 'flex-end', backgroundColor: colors.green },
  tutor: { alignSelf: 'flex-start', backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  bubbleText: { fontSize: 13, lineHeight: 19, color: colors.dark },
  meText: { color: colors.white },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginVertical: 12 },
  chip: { backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 6, borderRadius: radius.pill },
  chipText: { fontSize: 11, fontWeight: '700', color: colors.blue },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    backgroundColor: colors.white,
  },
});
