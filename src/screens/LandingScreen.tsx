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
import JudgeDemoBanner from '../components/JudgeDemoBanner';
import LiveImpactTicker from '../components/LiveImpactTicker';
import LiveActivityFeed from '../components/LiveActivityFeed';
import PlatformStatusChip from '../components/PlatformStatusChip';
import MarketTrustBar from '../components/MarketTrustBar';
import WinningPitchPillars from '../components/WinningPitchPillars';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { api, type ElderAudio, type LiveImpact } from '../api/client';
import { API_BASE_URL } from '../config/api';
import { playAudioUrl, stopActiveAudio } from '../utils/audio';

type Props = NativeStackScreenProps<RootStackParamList, 'Landing'>;

export default function LandingScreen({ navigation }: Props) {
  const { participant } = useSession();
  const { t } = useLocale();
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [featuredAudio, setFeaturedAudio] = useState<ElderAudio | null>(null);
  const [apiOnline, setApiOnline] = useState<boolean | null>(null);
  const [impact, setImpact] = useState<LiveImpact | null>(null);
  const { width } = useWindowDimensions();
  const isWide = width >= 820;

  useEffect(() => {
    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    api.getLiveImpact().then(setImpact).catch(() => {});
    const poll = setInterval(() => {
      api.getLiveImpact().then(setImpact).catch(() => {});
    }, 15000);
    api.getAudioArchive()
      .then((items) => {
        if (items[0]) setFeaturedAudio(items[0]);
      })
      .catch(() => {
        // keep default featured clip label
      });
    return () => clearInterval(poll);
  }, []);

  const toggleAudio = () => {
    if (audioPlaying) {
      stopActiveAudio();
      setAudioPlaying(false);
      return;
    }

    const started = featuredAudio?.audio_url ? playAudioUrl(featuredAudio.audio_url) : false;
    setAudioPlaying(started);
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
            <Text style={styles.eyebrow}>{t('landing.eyebrow')}</Text>
            <Text style={styles.h1}>
              {t('landing.h1Line1')}{'\n'}
              <Text style={styles.accent}>{t('landing.h1Accent')}</Text>
            </Text>
            <Text style={styles.lead}>{t('landing.lead')}</Text>
            <View style={styles.ctaRow}>
              {participant ? (
                <Button label={t('common.openDashboard')} onPress={() => navigation.navigate('HubDashboard')} />
              ) : (
                <>
                  <Button label={t('landing.startJourney')} onPress={() => navigation.navigate('Onboarding')} />
                  <Button label={t('landing.login')} variant="ghost" onPress={() => navigation.navigate('Login')} />
                </>
              )}
              <Button
                label={t('landing.viewMap')}
                variant="ghost"
                onPress={() => navigation.navigate('UnionMap')}
              />
            </View>
            <ContinueSessionBanner navigation={navigation} />
            <LiveImpactTicker data={impact} />
            <PlatformStatusChip />
            {impact?.activity?.length ? <LiveActivityFeed items={impact.activity} /> : null}
            <MarketTrustBar />
            <WinningPitchPillars navigation={navigation} />
            <JudgeDemoBanner navigation={navigation} />
            <Pressable
              style={styles.audioWidget}
              onPress={toggleAudio}
              disabled={!featuredAudio?.audio_url}
            >
              <View style={styles.audioPlay}>
                <Text style={{ color: colors.white, fontSize: 14 }}>
                  {audioPlaying ? '⏸' : '▶'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.audioTitle}>
                  {featuredAudio
                    ? t('landing.voiceTitle', { name: featuredAudio.name })
                    : t('landing.voiceLoading')}
                </Text>
                <Text style={styles.audioSub}>
                  {featuredAudio?.duration_label ?? t('landing.voiceSubEmpty')}
                </Text>
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
          {t('landing.footer')}
          {apiOnline === false ? `\n${t('common.apiOffline')} (${API_BASE_URL})` : ''}
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
