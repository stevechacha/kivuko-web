// screens/LandingScreen.tsx
// Screen 0 — Hero landing (design: screen-landing)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, spacing, radius } from '../theme/colors';
import TopNav from '../components/TopNav';
import BridgeIllustration from '../components/BridgeIllustration';
import PatrioticHeroPanel from '../components/PatrioticHeroPanel';
import Button from '../components/Button';
import ContinueSessionBanner from '../components/ContinueSessionBanner';
import { useSession } from '../context/SessionContext';
import { api, type ElderAudio } from '../api/client';
import { API_BASE_URL } from '../config/api';
import { playAudioUrl, stopActiveAudio } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

const FEATURED_AUDIO: ElderAudio = {
  id: 'featured',
  name: 'Mwalimu Nyerere',
  area: 'Taifa',
  duration_label: 'Klipu ya kihistoria, sekunde 10',
};

export default function LandingScreen({ navigation }: Props) {
  const { participant } = useSession();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [featuredAudio, setFeaturedAudio] = useState<ElderAudio>(FEATURED_AUDIO);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  useEffect(() => {
    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    api.getAudioArchive()
      .then((items) => {
        if (items[0]) setFeaturedAudio(items[0]);
      })
      .catch(() => {
        // keep default featured clip label
      });
  }, []);

  const toggleAudio = () => {
    if (audioPlaying) {
      stopActiveAudio();
      setAudioPlaying(false);
      return;
    }

    const started = featuredAudio.audio_url ? playAudioUrl(featuredAudio.audio_url) : false;
    setAudioPlaying(true);
    if (!started) {
      setTimeout(() => setAudioPlaying(false), 2600);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={[styles.heroGrid, isWide && styles.heroGridWide]}>
          <View style={[styles.heroCopy, isWide && { flex: 1.1 }]}>
            <Text style={styles.eyebrow}>Elimu ya Muungano Ubunifu — MVP Demo</Text>
            <Text style={styles.h1}>
              Bara na Visiwani,{'\n'}
              <Text style={styles.accent}>Kizazi Kimoja.</Text>
            </Text>
            <Text style={styles.lead}>
              Kivuko la Muungano Hub inaoanisha kijana mmoja Bara na kijana mmoja Visiwani,
              na kuwapeleka pamoja kwenye Dhamira za Pamoja kuhusu historia, utamaduni, na maono
              ya taifa — huku kila hatua ikijengeka kuwa uzoefu wa kweli, si somo la kukariri.
            </Text>
            <View style={styles.ctaRow}>
              {participant ? (
                <Button label="Fungua Dashibodi →" onPress={() => navigation.navigate('HubDashboard')} />
              ) : (
                <Button label="Anza Safari →" onPress={() => navigation.navigate('Onboarding')} />
              )}
              <Button
                label="Angalia Ramani ya Muungano"
                variant="ghost"
                onPress={() => navigation.navigate('UnionMap')}
              />
            </View>
            <ContinueSessionBanner navigation={navigation} />
            <Pressable style={styles.audioWidget} onPress={toggleAudio}>
              <View style={styles.audioPlay}>
                <Text style={{ color: colors.white, fontSize: 14 }}>
                  {audioPlaying ? '⏸' : '▶'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.audioTitle}>
                  Sauti ya Umoja — {featuredAudio.name}
                </Text>
                <Text style={styles.audioSub}>{featuredAudio.duration_label}</Text>
              </View>
              <View style={styles.audioBars}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.bar, audioPlaying && styles.barActive]} />
                ))}
              </View>
            </Pressable>
          </View>
          <View style={[styles.bridgeWrap, isWide && { flex: 0.9 }]}>
            {isWide ? (
              <PatrioticHeroPanel />
            ) : (
              <BridgeIllustration width={Math.min(width - 48, 420)} height={340} />
            )}
          </View>
        </View>
        <Text style={styles.footer}>
          Kivuko la Muungano Hub — Onyesho la MVP · Elimu ya Muungano Ubunifu Challenge 2026
          {apiOnline === false ? `\nAPI haipatikani (${API_BASE_URL})` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  heroGrid: { paddingTop: spacing.xl, gap: spacing.xl },
  heroGridWide: { flexDirection: 'row', alignItems: 'center', paddingTop: 48 },
  heroCopy: { gap: 0 },
  eyebrow: {
    fontSize: 12.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: colors.greenDeep,
  },
  h1: {
    fontSize: Platform.OS === 'web' ? 48 : 34,
    lineHeight: Platform.OS === 'web' ? 52 : 38,
    fontWeight: '600',
    color: colors.dark,
    marginTop: 10,
    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : undefined,
  },
  accent: { color: colors.green },
  lead: {
    fontSize: 17,
    lineHeight: 27,
    color: '#454F4D',
    marginTop: 18,
    maxWidth: 520,
  },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 30, gap: 4 },
  audioWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 18,
    marginTop: 26,
    maxWidth: 420,
  },
  audioPlay: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  audioSub: { fontSize: 12.5, color: colors.textMuted, marginTop: 2 },
  audioBars: { flexDirection: 'row', gap: 2, alignItems: 'flex-end', height: 16 },
  bar: { width: 3, height: 4, backgroundColor: colors.blue, borderRadius: 2, opacity: 0.4 },
  barActive: { height: 14, opacity: 1 },
  bridgeWrap: { alignItems: 'center' },
  footer: {
    textAlign: 'center',
    color: '#8b9492',
    fontSize: 12.5,
    marginTop: 40,
    paddingBottom: 20,
  },
});
