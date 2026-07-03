// HubDashboardScreen — Main portal after registration (4 gateways from improvement designs)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import MissionJourneyTracker from '../components/MissionJourneyTracker';
import { useSession } from '../context/SessionContext';

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
  const { participant, missionId } = useSession();
  const points = participant?.patriotism_points ?? 0;
  const firstName = participant?.name?.split(' ')[0] ?? 'Mzalendo';
  const [streakDays, setStreakDays] = useState(1);

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
      title: '1. Chemsha Bongo ya Muungano',
      description:
        'Jibu maswali ya haraka kuhusu jiografia, mila na historia ya Tanganyika na Zanzibar. Kamilisha dhamira upate vocha ya hewa na pointi za Uzalendo!',
      cta: missionId ? 'Endelea Dhamira →' : 'Anza Kucheza Sasa',
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
      title: '2. Kutana na Pacha (Bara & Visiwani)',
      description:
        'Mfumo unakuunganisha na pacha wako kutoka upande wa pili. Pigeni stori, kamilisheni dhamira ya pamoja, na jenga kivuko cha kweli cha umoja.',
      cta: 'Fungua Twin Portal',
      accent: colors.blue,
      onPress: () => navigation.navigate('Matching'),
    },
    {
      id: 'academy',
      icon: '📚',
      badge: 'Academy',
      badgeColor: '#E6F3ED',
      title: '3. Maktuba ya Muungano & Makumbusho',
      description:
        'Makumbusho ya Taifa mkononi mwako — sauti, video, na nyaraka za Mwalimu Nyerere, Abeid Karume, na historia ya JWTZ.',
      cta: 'Ingia Multimedia Academy',
      accent: colors.green,
      onPress: () => navigation.navigate('Academy', { tab: 'union' }),
    },
    {
      id: 'patriot',
      icon: '🛡️',
      badge: 'Ulinzi 🛡️',
      badgeColor: '#FEE2E2',
      title: '4. Uzalendo na Historia ya Jeshi',
      description:
        'Maktaba ya ndani ya Uzalendo, nembo za taifa, na historia ya Jeshi la Wananchi wa Tanzania tangu 1964.',
      cta: 'Fungua Maktaba ya Uzalendo',
      accent: '#4B5320',
      onPress: () => navigation.navigate('Academy', { tab: 'patriot' }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBanner}>
          <Text style={styles.heroBadge}>Lango Kuu la Kitaifa 🇹🇿</Text>
          <Text style={styles.heroTitle}>Karibu, {firstName}! 👋</Text>
          <Text style={styles.heroSub}>
            Mifumo minne, jukwaa moja la kidijitali. Jipime akili, vuna maokoto, ungana na pacha wako,
            na tembelea makumbusho ya kihistoria sasa hivi!
          </Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>Pointi za Uzalendo</Text>
            <Text style={styles.pointsValue}>{points.toLocaleString()} Pts</Text>
          </View>
          {streakDays >= 2 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>🔥 Siku {streakDays} mfululizo — Endelea hivyo!</Text>
            </View>
          )}
        </View>

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

        <Text style={styles.sectionLabel}>Gusa Mlango Kupenya</Text>

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

        <View style={styles.quickRow}>
          <Button label="Mstari wa Historia 1961—2026" variant="secondary" onPress={() => navigation.navigate('UnionTimeline')} />
          <Button label="Gala ya Top 10 Vijana" variant="secondary" onPress={() => navigation.navigate('GalaLeaderboard')} />
          <Button label="WhatsApp & USSD" variant="ghost" onPress={() => navigation.navigate('Omnichannel')} />
          <Button label="🎬 Onyesho la Waamuzi" variant="ghost" onPress={() => navigation.navigate('JudgeTour')} />
          <Button label="Ramani Hai ya Muungano" variant="ghost" onPress={() => navigation.navigate('UnionMap')} />
          <Button label="Paneli ya Usimamizi" variant="ghost" onPress={() => navigation.navigate('AdminDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 60,
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  heroBanner: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderBottomWidth: 4,
    borderBottomColor: colors.gold,
    marginBottom: spacing.lg,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    color: colors.dark,
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  heroTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '800',
    color: colors.white,
    marginTop: 10,
  },
  heroSub: {
    fontSize: 13,
    color: '#CBD5E1',
    marginTop: 8,
    lineHeight: 20,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    backgroundColor: 'rgba(17,122,101,0.35)',
    borderRadius: radius.md,
    padding: 12,
  },
  pointsLabel: { fontSize: 12, color: colors.white, fontWeight: '600' },
  pointsValue: { fontSize: 14, color: colors.gold, fontWeight: '800' },
  streakBadge: {
    marginTop: 10,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(241,196,15,0.2)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  streakText: { fontSize: 11, fontWeight: '800', color: colors.gold },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
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
  portalIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalBadge: { borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3, alignSelf: 'flex-start' },
  portalBadgeText: { fontSize: 9, fontWeight: '800', color: colors.dark },
  portalTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, marginBottom: 6 },
  portalDesc: { fontSize: 12, color: colors.textMuted, lineHeight: 18, marginBottom: 14 },
  portalCta: { borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  portalCtaText: { color: colors.white, fontSize: 12, fontWeight: '700' },
  quickRow: { marginTop: spacing.xl, gap: 8, alignItems: 'center' },
});
