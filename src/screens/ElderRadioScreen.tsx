// ElderRadioScreen — public Top 10 Elder Contributors (second recognition pillar)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type ElderRadioEntry } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { markVisited } from '../utils/visitTracking';
import { playAudioUrl, stopActiveAudio } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'ElderRadio'>;

export default function ElderRadioScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [nominees, setNominees] = useState<ElderRadioEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);

  useEffect(() => {
    markVisited('elder');
    api.getElderRadioTop10().then(setNominees).finally(() => setLoading(false));
  }, []);

  const playClip = (entry: ElderRadioEntry) => {
    if (!entry.audio_url) return;
    if (playingId === entry.story_id) {
      stopActiveAudio();
      setPlayingId(null);
      return;
    }
    if (playAudioUrl(entry.audio_url)) {
      setPlayingId(entry.story_id);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.badge}>{t('pitch.elderTitle')}</Text>
          <Text style={styles.title}>{t('radio.elderTop10')}</Text>
          <Text style={styles.sub}>{t('pitch.elderDesc')}</Text>
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : nominees.length === 0 ? (
          <Text style={styles.empty}>{t('radio.emptyElders')}</Text>
        ) : (
          nominees.map((e) => (
            <View key={e.story_id} style={styles.card}>
              <Text style={styles.rank}>#{e.rank}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{e.contributor_name}</Text>
                <Text style={styles.meta}>{e.title}</Text>
                <Text style={styles.area}>{e.home_area} · {e.region_label}</Text>
                {e.audio_url ? (
                  <Pressable onPress={() => playClip(e)} style={styles.playBtn}>
                    <Text style={styles.playText}>
                      {playingId === e.story_id ? '⏸ ' : '▶ '}{t('pitch.playClip')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))
        )}

        <View style={styles.actions}>
          <Button label={t('elder.submit')} onPress={() => navigation.navigate('ElderContribution')} />
          <Button label={t('pitch.partnerTitle')} variant="ghost" onPress={() => navigation.navigate('PartnerDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 720, alignSelf: 'center', width: '100%' },
  hero: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderBottomWidth: 4,
    borderBottomColor: '#7C3AED',
    marginBottom: spacing.lg,
  },
  badge: { fontSize: 10, fontWeight: '800', color: '#C4B5FD', letterSpacing: 1 },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, marginTop: 8 },
  sub: { fontSize: 13, color: '#CBD5E1', marginTop: 8, lineHeight: 20 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 20 },
  card: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.line,
  },
  rank: { fontSize: 18, fontWeight: '800', color: '#7C3AED', width: 36 },
  name: { fontSize: 14, fontWeight: '800', color: colors.dark },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4, lineHeight: 18 },
  area: { fontSize: 11, color: colors.green, marginTop: 4, fontWeight: '600' },
  playBtn: { marginTop: 8, alignSelf: 'flex-start' },
  playText: { fontSize: 11, fontWeight: '700', color: colors.blue },
  actions: { marginTop: spacing.lg, gap: 8 },
});
