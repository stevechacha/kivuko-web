// CultureMissionScreen — Step 2: Culture exchange with peer
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TextInput, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import PeerSubmittedBanner from '../components/PeerSubmittedBanner';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'CultureMission'>;

export default function CultureMissionScreen({ navigation }: Props) {
  const { participant, peer, updateParticipant } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const prompts = useMemo(
    () => [t('culture.p1'), t('culture.p2'), t('culture.p3')],
    [t],
  );
  const [responses, setResponses] = useState<string[]>(['', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const canSubmit = responses.every((r) => r.trim().length >= 10);

  const submit = async () => {
    if (!participant?.session_token || !canSubmit) return;
    setSubmitting(true);
    try {
      await api.submitOralStory(responses, participant.session_token);
      await api.completeMissionStep(2, participant.session_token);
      const me = await api.getMe(participant.session_token);
      updateParticipant({ patriotism_points: me.participant.patriotism_points });
      setDone(true);
    } catch {
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={2} showPoints showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>{t('culture.eyebrow')}</Text>
        <Text style={styles.title}>{t('culture.title')}</Text>
        <Text style={styles.sub}>{t('culture.sub')}</Text>

        {peer ? <PeerSubmittedBanner peerName={peer.name} /> : null}

        {prompts.map((prompt, i) => (
          <View key={i} style={styles.block}>
            <Text style={styles.prompt}>{i + 1}. {prompt}</Text>
            <TextInput
              style={styles.input}
              multiline
              value={responses[i]}
              onChangeText={(text) => {
                const next = [...responses];
                next[i] = text;
                setResponses(next);
              }}
              placeholder={t('culture.placeholder')}
              placeholderTextColor="#9AA5A3"
            />
          </View>
        ))}

        {done ? (
          <View style={styles.success}>
            <Text style={styles.successTitle}>{t('culture.successTitle')}</Text>
            <Text style={styles.successBody}>{t('culture.successBody')}</Text>
            <View style={{ marginTop: 16 }}>
              <Button label={t('culture.continue')} onPress={() => navigation.navigate('VisionMission')} />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            {submitting ? (
              <ActivityIndicator color={colors.green} />
            ) : (
              <Button label={t('culture.submit')} onPress={submit} disabled={!canSubmit} />
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 640, alignSelf: 'center', width: '100%' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.greenDeep, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: spacing.lg },
  block: { marginBottom: 16 },
  prompt: { fontSize: 13, fontWeight: '700', color: colors.dark, marginBottom: 8 },
  input: { borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.md, padding: 14, minHeight: 80, fontSize: 14, backgroundColor: colors.white, textAlignVertical: 'top', color: colors.dark },
  success: { backgroundColor: '#F0FAF8', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: colors.green, alignItems: 'center' },
  successTitle: { fontSize: 18, fontWeight: '800', color: colors.greenDeep },
  successBody: { fontSize: 13, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
