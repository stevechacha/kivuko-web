// ElderContributionScreen — elder oral history upload + radio pipeline
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'ElderContribution'>;

export default function ElderContributionScreen({ navigation }: Props) {
  const { participant } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!participant?.session_token || !title.trim() || body.trim().length < 30) {
      setError(t('elder.errMin'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await api.submitElderStory(
        {
          title: title.trim(),
          body: body.trim(),
          audio_url: audioUrl.trim(),
          video_url: videoUrl.trim(),
        },
        participant.session_token,
      );
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('elder.errSubmit'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>{t('elder.badge')}</Text>
        <Text style={styles.title}>{t('elder.title')}</Text>
        <Text style={styles.sub}>{t('elder.sub')}</Text>

        {done ? (
          <View style={styles.success}>
            <Text style={styles.successTitle}>{t('elder.successTitle')}</Text>
            <Text style={styles.successBody}>{t('elder.successBody')}</Text>
            <Button label={t('elder.viewRadio')} onPress={() => navigation.navigate('ElderRadio')} />
          </View>
        ) : (
          <>
            <Text style={styles.label}>{t('elder.fieldTitle')}</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder={t('elder.phTitle')} />
            <Text style={styles.label}>{t('elder.fieldStory')}</Text>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={body}
              onChangeText={setBody}
              multiline
              placeholder={t('elder.phStory')}
            />
            <Text style={styles.label}>{t('elder.fieldAudio')}</Text>
            <TextInput style={styles.input} value={audioUrl} onChangeText={setAudioUrl} placeholder="https://..." />
            <Text style={styles.label}>{t('elder.fieldVideo')}</Text>
            <TextInput style={styles.input} value={videoUrl} onChangeText={setVideoUrl} placeholder="https://youtube.com/..." />
            {error ? <Text style={styles.error}>{error}</Text> : null}
            <Button label={loading ? t('common.loading') : t('elder.submit')} onPress={submit} disabled={loading} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 720, alignSelf: 'center', width: '100%' },
  badge: { fontSize: 10, fontWeight: '800', color: colors.gold, textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { fontSize: 24, fontWeight: '800', color: colors.dark, marginTop: 8 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: spacing.lg },
  label: { fontSize: 12, fontWeight: '700', color: colors.dark, marginBottom: 6, marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    backgroundColor: colors.white,
    fontSize: 14,
  },
  textarea: { minHeight: 140, textAlignVertical: 'top' },
  error: { color: '#B91C1C', marginTop: 10, fontSize: 12 },
  success: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, borderWidth: 1, borderColor: colors.line },
  successTitle: { fontSize: 18, fontWeight: '800', color: colors.green },
  successBody: { fontSize: 13, color: colors.textMuted, marginVertical: 12, lineHeight: 20 },
});
