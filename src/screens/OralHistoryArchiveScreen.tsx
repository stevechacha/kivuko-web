// OralHistoryArchiveScreen — elder stories + patriotism archive (proposal Ch.1)
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
import { api, type ElderAudio, type ElderStory, type OralStory } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { markVisited } from '../utils/visitTracking';
import { playAudioUrl, stopActiveAudio } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'OralHistoryArchive'>;

export default function OralHistoryArchiveScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [elders, setElders] = useState<ElderStory[]>([]);
  const [oral, setOral] = useState<OralStory[]>([]);
  const [audio, setAudio] = useState<ElderAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [tab, setTab] = useState<'elders' | 'youth' | 'audio'>('elders');

  useEffect(() => {
    markVisited('archive');
    Promise.all([
      api.getElderStories().catch(() => [] as ElderStory[]),
      api.getOralStoriesArchive().catch(() => [] as OralStory[]),
      api.getAudioArchive().catch(() => [] as ElderAudio[]),
    ])
      .then(([e, o, a]) => {
        setElders(e);
        setOral(o);
        setAudio(a);
      })
      .finally(() => setLoading(false));
  }, []);

  const playClip = (id: string, url?: string) => {
    if (!url) return;
    if (playingId === id) {
      stopActiveAudio();
      setPlayingId(null);
      return;
    }
    if (playAudioUrl(url)) setPlayingId(id);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>{t('archive.badge')}</Text>
        <Text style={styles.title}>{t('archive.title')}</Text>
        <Text style={styles.sub}>{t('archive.sub')}</Text>

        <View style={styles.tabs}>
          {(['elders', 'youth', 'audio'] as const).map((key) => (
            <Pressable
              key={key}
              style={[styles.tab, tab === key && styles.tabActive]}
              onPress={() => setTab(key)}
            >
              <Text style={[styles.tabText, tab === key && styles.tabTextActive]}>{t(`archive.tab${key}`)}</Text>
            </Pressable>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 24 }} />
        ) : tab === 'elders' ? (
          elders.length === 0 ? (
            <Text style={styles.empty}>{t('archive.emptyElders')}</Text>
          ) : (
            elders.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.meta}>{s.contributor_name} · {s.home_area} · {s.region_label}</Text>
                <Text style={styles.body} numberOfLines={4}>{s.body}</Text>
                {s.audio_url ? (
                  <Pressable onPress={() => playClip(s.id, s.audio_url)} style={styles.playBtn}>
                    <Text style={styles.playText}>
                      {playingId === s.id ? '⏸' : '▶'} {t('pitch.playClip')}
                    </Text>
                  </Pressable>
                ) : null}
              </View>
            ))
          )
        ) : tab === 'youth' ? (
          oral.length === 0 ? (
            <Text style={styles.empty}>{t('archive.emptyYouth')}</Text>
          ) : (
            oral.map((s) => (
              <View key={s.id} style={styles.card}>
                <Text style={styles.cardTitle}>{s.title}</Text>
                <Text style={styles.meta}>{s.author_name} · {s.created_at_label}</Text>
                <Text style={styles.body} numberOfLines={5}>{s.body}</Text>
              </View>
            ))
          )
        ) : audio.length === 0 ? (
          <Text style={styles.empty}>{t('archive.emptyAudio')}</Text>
        ) : (
          audio.map((a) => (
            <View key={a.id} style={styles.card}>
              <Text style={styles.cardTitle}>{a.name}</Text>
              <Text style={styles.meta}>{a.area} · {a.duration_label}</Text>
              <Pressable onPress={() => playClip(a.id, a.audio_url)} style={styles.playBtn}>
                <Text style={styles.playText}>
                  {playingId === a.id ? '⏸' : '▶'} {t('pitch.playClip')}
                </Text>
              </Pressable>
            </View>
          ))
        )}

        <Button
          label={t('archive.contribute')}
          variant="ghost"
          onPress={() => navigation.navigate('ElderContribution')}
        />
        <Button
          label={t('archive.radioTop10')}
          onPress={() => navigation.navigate('ElderRadio')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  badge: { fontSize: 9, fontWeight: '800', color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: 16 },
  tabs: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tab: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: radius.pill, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.line },
  tabActive: { backgroundColor: colors.dark, borderColor: colors.dark },
  tabText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.line },
  cardTitle: { fontSize: 14, fontWeight: '800', color: colors.dark },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  body: { fontSize: 12, color: colors.dark, marginTop: 8, lineHeight: 18 },
  playBtn: { marginTop: 10, alignSelf: 'flex-start' },
  playText: { fontSize: 12, fontWeight: '800', color: colors.blue },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
});
