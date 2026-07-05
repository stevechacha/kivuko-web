// screens/LandingScreen.tsx
// Screen 0 — Hero landing (design: screen-landing)
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  useWindowDimensions,
  Animated,
  Easing,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { spacing, radius } from '../theme/colors';
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
import MinistryBrandingBanner from '../components/MinistryBrandingBanner';
import PwaInstallBanner from '../components/PwaInstallBanner';
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
  const isWide = width >= 1024;

  const flagAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(flagAnimation, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();

    api.health().then(() => setApiOnline(true)).catch(() => setApiOnline(false));
    api.getLiveImpact().then(setImpact).catch(() => {});
    
    const poll = setInterval(() => {
      api.getLiveImpact().then(setImpact).catch(() => {});
    }, 15000);

    api.getAudioArchive()
      .then((items) => {
        if (items[0]) setFeaturedAudio(items[0]);
      })
      .catch(() => {});

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

  const flagWaveX = flagAnimation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 8, 0],
  });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topAlertBanner}>
        <Text style={styles.topAlertText}>
          LENGO KUU LA MFUMO HUU NI <Text style={styles.highlightText}>KUJIFUNZA UMUHIMU NA HISTORIA YA MUUNGANO</Text> — KARIBU EWE MTANZANIA WA BARA NA VISIWANI ILI TUJENGE MUUNGANO ULIO BORA.
        </Text>
      </View>

      <TopNav currentStep={0} />
      
      <ScrollView contentContainerStyle={styles.scroll}>
        <Animated.View style={[styles.heroGrid, isWide && styles.heroGridWide, { opacity: fadeAnim }]}>
          
          {/* UPANDE WA KUSHOTO */}
          <View style={[styles.heroCopy, isWide && { flex: 1.1 }]}>
            <Text style={styles.eyebrow}>ELIMU YA MUUNGANO BARA NA VISIWANI </Text>
            
            <Text style={styles.h1}>
              Bara na Visiwani,{'\n'}
              <Text style={styles.accent}>Kizazi Kimoja{'\n'}Humu Humu.</Text>
            </Text>
            
            <MinistryBrandingBanner />
            <PwaInstallBanner />
            
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
                <Text style={{ color: '#ffffff', fontSize: 14 }}>
                  {audioPlaying ? '⏸' : '▶'}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.audioTitle}>
                  {featuredAudio
                    ? t('landing.voiceTitle', { name: featuredAudio.name })
                    : "Audio Widget from user code."}
                </Text>
                <Text style={styles.audioSub}>
                  {featuredAudio?.duration_label ?? "0:00 / 0:00"}
                </Text>
              </View>
              <Animated.View style={[styles.audioBars, { transform: [{ translateX: flagWaveX }] }]}>
                {[0, 1, 2, 3].map((i) => (
                  <View key={i} style={[styles.bar, audioPlaying && styles.barActive]} />
                ))}
              </Animated.View>
            </Pressable>
          </View>
          
          {/* UPANDE WA KULIA: PANELI, WAASISI, NA UJUMBE */}
          <View style={[styles.bridgeWrap, isWide && { flex: 0.9 }]}>
            {isWide ? (
              <PatrioticHeroPanel />
            ) : (
              <BridgeIllustration width={Math.min(width - 48, 420)} height={340} />
            )}

            {/* SEHEMU MPYA: PICHA ZA WAASISI WA JAMHURI YA MUUNGANO 🇹🇿 */}
            <View style={styles.foundersContainer}>
              <Text style={styles.foundersSectionTitle}>Waasisi wa Jamhuri ya Muungano</Text>
              <View style={styles.avatarStack}>
                
                {/* Mwalimu Nyerere - Box la Kushoto la Square */}
                <View style={styles.founderSquareLeft}>
                  <Image 
                    source={{ uri: 'https://thejnlc.org/wp-content/uploads/2023/12/nyerere-more4.png' }} 
                    style={styles.founderImageControlled} 
                    resizeMode="cover"
                  />
                </View>
                
                {/* Sheikh Abeid Karume - Box la Kulia la Square */}
                <View style={styles.founderSquareRight}>
                  <Image 
                    source={{ uri: 'https://www.vpo.go.tz/uploads/vp/1b00287c72391ac4c194b734a554a5d5.jpeg' }} 
                    style={styles.founderImageControlled} 
                    resizeMode="cover"
                  />
                </View>

              </View>
              <Text style={styles.foundersNames}>Mwl. J.K. Nyerere & Sheikh A.A. Karume</Text>
            </View>

            {/* SEHEMU YA UJUMBE MKUU WA CHINI KUTOKA KWENYE PICHA */}
            <View style={styles.patrioticQuoteCard}>
              <View style={styles.badgeRow}>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>👥</Text>
                  <Text style={styles.badgeTitle}>Udugu</Text>
                </View>
                <Text style={styles.centerBadgeTitle}>WAMOJA KATIKA MUUNGANO</Text>
                <View style={styles.badgeItem}>
                  <Text style={styles.badgeIcon}>🤝</Text>
                  <Text style={styles.badgeTitle}>Uzalendo</Text>
                </View>
              </View>
              
              <Text style={styles.quoteText}>
                "Hakuna <Text style={styles.redHighlight}>Udini</Text> wala Upendeleo, Sisi sote ni Ndugu chini ya Kivuli cha Jamhuri ya Muungano."
              </Text>
            </View>
          </View>

        </Animated.View>
        
        <Text style={styles.footer}>
          Footer - 2026 by wesko marwa - Daraja la Muungano Hub - All rights reserved.
          {apiOnline === false ? `\n${t('common.apiOffline')} (${API_BASE_URL})` : ''}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#056e54' },
  
  topAlertBanner: {
    backgroundColor: '#c19e16',
    paddingVertical: 8,
    paddingHorizontal: 16,
    width: '100%',
    alignItems: 'center',
  },
  topAlertText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  highlightText: {
    color: '#FFD100',
    textDecorationLine: 'underline',
  },

  scroll: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 60,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    zIndex: 1,
  },
  heroGrid: { paddingTop: spacing.xl, gap: spacing.xl },
  heroGridWide: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 48 },
  heroCopy: { gap: 12 },
  eyebrow: {
    fontSize: 14,
    letterSpacing: 1,
    fontWeight: '700',
    color: '#FFD100',
    marginTop: 10,
  },
  h1: {
    fontSize: Platform.OS === 'web' ? 52 : 36,
    lineHeight: Platform.OS === 'web' ? 58 : 42,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'web' ? 'system-ui, sans-serif' : undefined,
  },
  accent: { color: '#FFD100' },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 20, gap: 8 },
  
  audioWidget: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#d7eae5',
    borderWidth: 1,
    borderColor: '#1F3430',
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 20,
    maxWidth: 460,
    width: '100%',
  },
  audioPlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1BB954',
    alignItems: 'center',
    justifyContent: 'center',
  },
  audioTitle: { fontSize: 13, fontWeight: '600', color: '#11221e' },
  audioSub: { fontSize: 12, color: '#556260', marginTop: 2 },
  audioBars: { flexDirection: 'row', gap: 3, alignItems: 'flex-end', height: 16 },
  bar: { width: 3, height: 4, backgroundColor: '#FFD100', borderRadius: 2, opacity: 0.4 },
  barActive: { height: 14, opacity: 1 },
  
  bridgeWrap: { alignItems: 'center', width: '100%', marginTop: 20 },
  
  foundersContainer: {
    backgroundColor: 'rgba(17, 34, 30, 0.6)',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 209, 0, 0.2)',
  },
  foundersSectionTitle: {
    color: '#FFD100',
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
 avatarStack: {
    flexDirection: 'row',     // Inaweka mabox pembeni kwa pembeni
    height: 120,             // Urefu wa eneo la picha
    width: '100%',           // Inachukua upana wote unaohitajika
    justifyContent: 'center', // Inayaweka mabox katikati ya screen
    alignItems: 'center',
    gap: 16,                 // HAPA: Hapa ndio umbali (space) kati ya box la kushoto na kulia!
  },
  founderSquareLeft: {
    width: 110,  
    height: 110,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#056e54',
    backgroundColor: '#d7eae5',
    overflow: 'hidden',
  },
  founderSquareRight: {
    width: 110,
    height: 110,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: '#056e54',
    backgroundColor: '#d7eae5',
    overflow: 'hidden',
    // position: 'absolute' IMEONDOLEWA - Ili lisibebe lingine
    // left: 95 IMEONDOLEWA - Ili lisilalie lingine
  
  },
  founderImageControlled: {
    width: '100%',  // Imeongezwa ili picha zijae vizuri ndani ya box la square
    height: '100%',
  },
  foundersNames: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },

  patrioticQuoteCard: {
    backgroundColor: 'rgba(11, 19, 17, 0.85)',
    borderWidth: 1,
    borderColor: '#1F3430',
    borderRadius: 12,
    padding: 24,
    marginTop: 20,
    width: '100%',
    maxWidth: 500,
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  badgeItem: {
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 24,
  },
  badgeTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  centerBadgeTitle: {
    color: '#FFD100',
    fontWeight: '800',
    fontSize: 14,
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  quoteText: {
    color: '#FFFFFF',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  redHighlight: {
    color: '#FF3B30',
    fontWeight: '800',
  },

  footer: {
    textAlign: 'center',
    color: '#556260',
    fontSize: 12,
    marginTop: 60,
    paddingBottom: 20,
    borderTopWidth: 1,
    borderTopColor: '#121F1C',
    paddingTop: 20,
  },
});