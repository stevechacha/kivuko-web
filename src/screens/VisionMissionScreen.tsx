// VisionMissionScreen — Step 3: Future vision with peer
import React, { useState } from 'react';
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

type Props = NativeStackScreenProps<RootStackParamList, 'VisionMission'>;

export default function VisionMissionScreen({ navigation }: Props) {
  const { participant, peer, updateParticipant } = useSession();
  const { t } = useLocale();
  const [vision, setVision] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!participant?.session_token || vision.trim().length < 30) return;
    setSubmitting(true);
    try {
      await api.completeMissionStep(3, participant.session_token);
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
      <TopNav currentStep={3} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>{t('vision.eyebrow')}</Text>
        <Text style={styles.title}>{t('vision.title')}</Text>
        <Text style={styles.sub}>{t('vision.sub')}</Text>

        {peer ? <PeerSubmittedBanner peerName={peer.name} /> : null}

        <TextInput
          style={styles.input}
          multiline
          value={vision}
          onChangeText={setVision}
          placeholder={t('vision.placeholder')}
          placeholderTextColor="#9AA5A3"
        />
        <Text style={styles.hint}>{t('vision.hint', { count: vision.length })}</Text>

        {done ? (
          <View style={styles.success}>
            <Text style={styles.successTitle}>{t('vision.successTitle')}</Text>
            <Text style={styles.successBody}>{t('vision.successBody')}</Text>
            <View style={{ marginTop: 16 }}>
              <Button label={t('vision.getCert')} onPress={() => navigation.navigate('Certificate')} />
            </View>
          </View>
        ) : (
          <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
            {submitting ? (
              <ActivityIndicator color={colors.green} />
            ) : (
              <Button label={t('vision.submit')} onPress={submit} disabled={vision.trim().length < 30} />
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
  input: { borderWidth: 1.5, borderColor: colors.line, borderRadius: radius.lg, padding: 16, minHeight: 160, fontSize: 15, backgroundColor: colors.white, textAlignVertical: 'top', color: colors.dark, lineHeight: 22 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: 6, textAlign: 'right' },
  success: { marginTop: spacing.lg, backgroundColor: '#F0FAF8', borderRadius: radius.lg, padding: spacing.lg, borderWidth: 2, borderColor: colors.green, alignItems: 'center' },
  successTitle: { fontSize: 18, fontWeight: '800', color: colors.greenDeep },
  successBody: { fontSize: 13, color: colors.textMuted, marginTop: 6, textAlign: 'center' },
});
