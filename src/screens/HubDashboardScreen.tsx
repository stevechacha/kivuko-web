// HubDashboardScreen — Main portal after registration (4 gateways from improvement designs)
import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import MissionJourneyTracker from '../components/MissionJourneyTracker';
import InviteFriendCard from '../components/InviteFriendCard';
import WinningPitchPillars from '../components/WinningPitchPillars';
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
  const [visits, setVisits] = useState(readVisitState);
  const [progressSteps, setProgressSteps] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setVisits(readVisitState());
      if (participant?.session_token) {
        api.getMissionProgress(participant.session_token)
          .then((p) => setProgressSteps(p.completed_count))
          .catch(() => {});
      }
    }, [participant?.session_token]),
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
      badge: t('hub.portal1Badge'),
      badgeColor: '#FEE2E2',
      title: t('hub.portal1Title'),
      description: t('hub.portal1Desc'),
      cta: missionId ? t('hub.portal1CtaResume') : t('hub.portal1CtaPlay'),
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
      badge: t('hub.portal2Badge'),
      badgeColor: '#E6F6FC',
      title: t('hub.portal2Title'),
      description: t('hub.portal2Desc'),
      cta: t('hub.portal2Cta'),
      accent: colors.blue,
      onPress: () => navigation.navigate('Matching'),
    },
    {
      id: 'academy',
      icon: '📚',
      badge: t('hub.portal3Badge'),
      badgeColor: '#E6F3ED',
      title: t('hub.portal3Title'),
      description: t('hub.portal3Desc'),
      cta: visits.academy ? t('hub.portal3CtaResume') : t('hub.portal3Cta'),
      accent: colors.green,
      onPress: () => navigation.navigate('Academy', { tab: 'union' }),
    },
    {
      id: 'patriot',
      icon: '🛡️',
      badge: t('hub.portal4Badge'),
      badgeColor: '#FEE2E2',
      title: t('hub.portal4Title'),
      description: t('hub.portal4Desc'),
      cta: visits.patriot ? t('hub.portal4CtaResume') : t('hub.portal4Cta'),
      accent: '#4B5320',
      onPress: () => navigation.navigate('Academy', { tab: 'patriot' }),
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroBanner}>
          <Text style={styles.heroBadge}>{t('hub.heroBadge')}</Text>
          <Text style={styles.heroTitle}>{t('hub.greeting', { name: firstName })}</Text>
          <Text style={styles.heroSub}>{t('hub.sub')}</Text>
          <View style={styles.pointsRow}>
            <Text style={styles.pointsLabel}>{t('hub.points')}</Text>
            <Text style={styles.pointsValue}>{points.toLocaleString()} {t('common.pts')}</Text>
          </View>
          {streakDays >= 2 && (
            <View style={styles.streakBadge}>
              <Text style={styles.streakText}>{t('hub.streak', { days: streakDays })}</Text>
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

        <InviteFriendCard />
        {peer && missionId ? <TwinPeerCard peer={peer} navigation={navigation} /> : null}
        <WinningPitchPillars navigation={navigation} />
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
          <Button
            label={t('hub.quickArchive')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('OralHistoryArchive')}
          />
          <Button
            label={t('hub.quickRewards')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('MyRewards')}
          />
          <Button
            label={t('hub.quickImpact')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('NationalImpact')}
          />
          <Button
            label={t('hub.quickTimeline')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('UnionTimeline')}
          />
          <Button
            label={t('hub.quickGala')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('GalaLeaderboard')}
          />
          <Button
            label={t('hub.quickCeremony')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('GalaCeremony')}
          />
          <Button
            label={t('hub.quickGallery')}
            variant="secondary"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('CertificateGallery')}
          />
          <Button
            label={t('hub.quickElder')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('ElderContribution')}
          />
          <Button
            label={t('hub.quickPartner')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('PartnerDashboard')}
          />
          <Button
            label={t('hub.quickRadio')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('RadioPartner')}
          />
          <Button
            label={visits.omnichannel ? t('hub.quickOmnichannelResume') : t('hub.quickOmnichannel')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('Omnichannel')}
          />
          <Button
            label={t('hub.quickJudgeTour')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('JudgeTour')}
          />
          <Button
            label={t('hub.quickMap')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('UnionMap')}
          />
          <Button
            label={t('hub.quickAdmin')}
            variant="ghost"
            style={styles.quickBtn}
            onPress={() => navigation.navigate('AdminDashboard')}
          />
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
  quickGrid: {
    marginTop: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    width: '100%',
  },
  quickBtn: {
    width: Platform.OS === 'web' ? '48%' : '100%',
    maxWidth: 360,
    flexGrow: 1,
    marginRight: 0,
    marginBottom: 0,
  },
});
