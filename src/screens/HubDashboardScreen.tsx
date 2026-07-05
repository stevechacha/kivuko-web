// HubDashboardScreen — Main portal after registration (4 gateways from improvement designs)
import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
  Animated, // Tumeongeza Animated kwa ajili ya animations
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import MissionJourneyTracker from '../components/MissionJourneyTracker';
import InviteFriendCard from '../components/InviteFriendCard';
import AchievementBadges from '../components/AchievementBadges';
import TwinPeerCard from '../components/TwinPeerCard';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { readVisitState } from '../utils/visitTracking';
import { api } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'HubDashboard'>;

type Portal = {
  id: string;
  icon: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  cta: string;
  accent: string;
  onPress: () => void;
};

export default function HubDashboardScreen({ navigation }: Props) {
  const { participant, missionId, peer } = useSession();
  const { t } = useLocale();
  const points = participant?.patriotism_points ?? 0;
  const firstName = participant?.name?.split(' ')[0] ?? 'Mzalendo';
  const [streakDays, setStreakDays] = useState(1);
  const [visits, setVisits] = useState(() => readVisitState()); 
  const [progressSteps, setProgressSteps] = useState(0);

  // Kianzishi cha Animation ya Kufifia na Kutokea (Fade In Effect)
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      setVisits(readVisitState());
      if (participant?.session_token) {
        api.getMissionProgress(participant.session_token)
          .then((p) => setProgressSteps(p.completed_count))
          .catch(() => {});
      }

      // Kuanzisha animation kila screen inapofunguliwa
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000, // Itachukua sekunde 1 kutokea kikamilifu
        useNativeDriver: true,
      }).start();
    }, [participant?.session_token, fadeAnim]),
  );

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return;
    const today = new Date().toISOString().slice(0, 10);
    const raw = sessionStorage.getItem('kivuko_streak');
    let next = 1;
    if (raw) {
      try {
        const { lastDate, days } = JSON.parse(raw) as { lastDate: string; days: number };
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yKey = yesterday.toISOString().slice(0, 10);
        if (lastDate === today) next = days;
        else if (lastDate === yKey) next = days + 1;
      } catch {
        next = 1;
      }
    }
    sessionStorage.setItem('kivuko_streak', JSON.stringify({ lastDate: today, days: next }));
    setStreakDays(next);
  }, []);

  const portals: Portal[] = [
    {
      id: 'quiz',
      icon: '🎮',
      badge: 'Zawadi 🎁',
      badgeColor: '#FEE2E2',
      title: '1. jifunze kwa kucheza game',
      description: 'Jibu maswali ya haraka kuhusu Muungano, mila na desturi na historia ya Tanganyika na Zanzibar. Kamilisha dhamira upate tuzo point kwaajili ya kuvuna ziwa dakika au internet !',
      cta: 'Anza Kucheza Sasa',
      accent: '#F59E0B',
      onPress: () => {
        if (missionId) {
          navigation.navigate('MissionChat');
        } else {
          navigation.navigate('ChemshaBongo');
        }
      },
    },
    {
      id: 'peer',
      icon: '🤝',
      badge: 'Fursa 💼',
      badgeColor: '#E6F6FC',
      title: '2. Kutana na rafiki kutoka (Bara & Visiwani)',
      description: 'Mfumo unakuunganisha na rafiki yako kutoka upande vya pili ambae mtaweza kubadilishana mawazo na kusaidiana kimasiha. Ingia jifunze kubadilishana uzoefu na pia kujua umuhimu wa muungano stori, kamilisheni dhamira ya pamoja, na jenga daraja la Jamhuri ya mungano wa Tanzania. Tanzania ni moja.',
      cta: ' Ingia mukutanishwe ',
      accent: colors.blue,
      onPress: () => navigation.navigate('Matching'),
    },
    {
      id: 'academy',
      icon: '📚',
      badge: 'jifunze kwa kutzama',
      badgeColor: '#E6F3ED',
      title: '3. Maktaba ya Muungano & Makumbusho',
      description: 'Makumbusho ya Taifa mkononi mwako — sauti, video, na nyaraka za muunganno Mwalimu Nyerere, Abeid Karume, na historia ya JWTZ.',
      cta: 'Ingia ndani ujifunze',
      accent: colors.green,
      onPress: () => navigation.navigate('Academy', { tab: 'union' }),
    },
    {
      id: 'patriot',
      icon: '🛡️',
      badge: 'historia 🛡️',
      badgeColor: '#FEE2E2',
      title: '4. Uzalendo na Historia ya Jeshi la wananchi',
      description: 'Maktaba ya ndani ya Uzalendo, nembo za taifa, na historia ya Jeshi la Wananchi wa Tanzania tangu 1964.',
      cta: 'Ingia Multimedia Academy',
      accent: '#4B5320',
      onPress: () => navigation.navigate('Academy', { tab: 'patriot' }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        
        {/* PANZIA LENYE BACKGROUND YA BENDERA YA TANZANIA 🇹🇿 (LIMEWEKWA ANIMATION YA FADE-IN) */}
        <Animated.View 
          style={[
            styles.heroBanner, 
            { opacity: fadeAnim },
            Platform.OS === 'web' ? { backgroundImage: 'linear-gradient(135deg, #1EB960 0%, #1EB960 35%, #F1C40F 35%, #F1C40F 40%, #111111 40%, #111111 60%, #F1C40F 60%, #F1C40F 65%, #00A3E0 65%, #00A3E0 100%)' } as any : {}
          ]}
        >
          <Text style={styles.heroBadge}>sehemu nne za kujifunzia</Text>
          <Text style={styles.heroTitle}>Karibu, {firstName}! 👋</Text>
          
          {/* BUSARA NA MANENO YA BOLD YALIYOONGEZWA */}
          <Text style={styles.heroSub}>
            Chagua sehemu unayotaka kutumia kujifunza kuhusu muungano na pia Tanzania kiujumla; iwe ni kwa njia ya <Text style={styles.boldHighlight}>kucheza game ya maswali</Text> au kwa kuingia na <Text style={styles.boldHighlight}>kutazama video na kumbukumbu</Text> za Jamhuri ya Muungano wa Tanzania.{'\n'}{'\n'}
            <Text style={styles.wisdomQuote}>"Kumbuka: <Text style={styles.boldHighlight}>Umoja wetu ndio ngao yetu</Text>, na kulinda historia ya nchi yetu ni wajibu wa kila mzalendo. Hakika, <Text style={styles.boldHighlight}>Tanzania ni Moja</Text> — kutoka Bara hadi Visiwani!"</Text>
          </Text>
          
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>{t('hub.points')}</Text>
            <Text style={styles.pointsValue}>{points.toLocaleString()} {t('common.pts')}</Text>
          </View>
          {streakDays >= 2 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{t('hub.streak', { days: streakDays })}</Text>
            </View>
          )}
        </Animated.View>

        <MissionJourneyTracker
          onStepPress={(step, status) => {
            if (status === 'locked') return;
            if (step === 1) {
              if (missionId) navigation.navigate('MissionChat');
              else navigation.navigate('Matching');
            } else if (step === 2) navigation.navigate('CultureMission');
            else if (step === 3) navigation.navigate('VisionMission');
            else if (step === 4) navigation.navigate('Certificate');
            else if (step === 5) navigation.navigate('UnionMap');
          }}
        />

        <InviteFriendCard />
        
        {peer && missionId ? <TwinPeerCard peer={peer} navigation={navigation} /> : null}
        
        <AchievementBadges
          points={points}
          missionSteps={progressSteps}
          hasCertificate={progressSteps >= 4}
        />

        <Text style={styles.sectionLabel}>{t('hub.sectionLabel')}</Text>

        <View style={styles.grid}>
          {portals.map((p) => (
            <Pressable key={p.id} style={styles.portalCard} onPress={p.onPress}>
              <View style={styles.portalHead}>
                <View style={[styles.portalIcon, { backgroundColor: `${p.accent}18` }]}>
                  <Text style={{ fontSize: 22 }}>{p.icon}</Text>
                </View>
                <View style={[styles.portalBadge, { backgroundColor: p.badgeColor }]}>
                  <Text style={styles.portalBadgeText}>{p.badge}</Text>
                </View>
              </View>
              <Text style={styles.portalTitle}>{p.title}</Text>
              <Text style={styles.portalDesc}>{p.description}</Text>
              <View style={[styles.portalCta, { backgroundColor: p.accent }]}>
                <Text style={styles.portalCtaText}>{p.cta}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.quickGrid}>
          <Button label={t('hub.quickArchive')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('OralHistoryArchive')} />
          <Button label={t('hub.quickRewards')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('MyRewards')} />
          <Button label={t('hub.quickImpact')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('NationalImpact')} />
          <Button label={t('hub.quickAiTutor')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('AiTutor')} />
          <Button label={t('hub.quickTimeline')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('UnionTimeline')} />
          <Button label={t('hub.quickGala')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('GalaLeaderboard')} />
          <Button label={t('hub.quickCeremony')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('GalaCeremony')} />
          <Button label={t('hub.quickGallery')} variant="secondary" style={styles.quickBtn} onPress={() => navigation.navigate('CertificateGallery')} />
          <Button label={t('hub.quickElder')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('ElderContribution')} />
          <Button label={t('hub.quickPartner')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('PartnerDashboard')} />
          <Button label={t('hub.quickRadio')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('RadioPartner')} />
          <Button label={visits?.omnichannel ? t('hub.quickOmnichannelResume') : t('hub.quickOmnichannel')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('Omnichannel')} />
          <Button label={t('hub.quickJudgeTour')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('JudgeTour')} />
          <Button label={t('hub.quickMap')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('UnionMap')} />
          <Button label={t('hub.quickAdmin')} variant="ghost" style={styles.quickBtn} onPress={() => navigation.navigate('AdminDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg }, // Imerekebishwa kutoka colors.bg kwenda colors.background
  scroll: {
    padding: spacing.lg,
    paddingBottom: 60,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  heroBanner: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: 5,
    borderBottomColor: '#F1C40F',
    backgroundColor: '#1EB960', 
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#111111',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.pill,
    overflow: 'hidden',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 2 },
    textShadowRadius: 3,
  },
  heroSub: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginTop: 8,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.6)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  boldHighlight: {
    fontWeight: '900',
    color: '#FFD100', // Rangi ya dhahabu inayoangaza
  },
  wisdomQuote: {
    fontStyle: 'italic',
    color: '#E0F2FE', // Rangi ya mwanga wa anga kwa ajili ya busara
    fontSize: 13.5,
    lineHeight: 22,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Imerekebishwa kutoka 'justify' kwenda 'justifyContent'
    marginTop: 16,
    backgroundColor: 'rgba(17, 17, 17, 0.75)',
    borderRadius: radius.md,
    padding: 12,
  },
  pointsLabel: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  pointsValue: { fontSize: 14, color: '#F1C40F', fontWeight: '800' },
  streakBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(17, 17, 17, 0.8)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: { fontSize: 11, fontWeight: '800', color: '#F1C40F' },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  portalCard: {
    flexBasis: Platform.OS === 'web' ? '48%' : '100%',
    flexGrow: 1,
    minWidth: 260,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 18,
  },
  portalHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  portalIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  portalBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  portalBadgeText: { fontSize: 9, fontWeight: '800', color: colors.dark },
  portalTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, marginBottom: 6 },
  portalDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 14 },
  portalCta: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  portalCtaText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  quickGrid: { marginTop: spacing.xl, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
  quickBtn: { width: Platform.OS === 'web' ? '48%' : '100%', maxWidth: 360, flexGrow: 1, marginRight: 0, marginBottom: 0 },
});