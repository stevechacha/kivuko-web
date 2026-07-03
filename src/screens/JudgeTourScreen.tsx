// JudgeTourScreen — guided 3-minute judge walkthrough with progress tracking
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { api } from '../api/client';
import { useAppBack } from '../navigation/useAppBack';
import { hasVisited } from '../utils/visitTracking';

type Props = NativeStackScreenProps<RootStackParamList, 'JudgeTour'>;

type TourStep = {
  id: number;
  title: string;
  desc: string;
  route: keyof RootStackParamList;
  time: string;
  done: boolean;
};

export default function JudgeTourScreen({ navigation }: Props) {
  const { participant, missionId } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation, 'landing');
  const [progressStep, setProgressStep] = useState(0);

  useEffect(() => {
    if (!participant?.session_token) return;
    api
      .getMissionProgress(participant.session_token)
      .then((p) => setProgressStep(p.completed_count))
      .catch(() => {});
  }, [participant?.session_token]);

  const steps: TourStep[] = [
    {
      id: 1,
      title: t('judgeTour.s1Title'),
      desc: t('judgeTour.s1Desc'),
      route: 'Onboarding',
      time: '0:20',
      done: !!participant,
    },
    {
      id: 2,
      title: t('judgeTour.s2Title'),
      desc: t('judgeTour.s2Desc'),
      route: 'HubDashboard',
      time: '0:40',
      done: !!participant,
    },
    {
      id: 3,
      title: t('judgeTour.s3Title'),
      desc: t('judgeTour.s3Desc'),
      route: 'Matching',
      time: '1:00',
      done: !!missionId,
    },
    {
      id: 4,
      title: t('judgeTour.s4Title'),
      desc: t('judgeTour.s4Desc'),
      route: 'MissionChat',
      time: '1:25',
      done: progressStep >= 1,
    },
    {
      id: 5,
      title: t('judgeTour.s5bTitle'),
      desc: t('judgeTour.s5bDesc'),
      route: 'ModeratorFlaggedContent',
      time: '1:45',
      done: hasVisited('moderator'),
    },
    {
      id: 6,
      title: t('judgeTour.s5Title'),
      desc: t('judgeTour.s5Desc'),
      route: 'CultureMission',
      time: '2:05',
      done: progressStep >= 3,
    },
    {
      id: 7,
      title: t('judgeTour.s6Title'),
      desc: t('judgeTour.s6Desc'),
      route: 'Certificate',
      time: '2:25',
      done: progressStep >= 4,
    },
    {
      id: 8,
      title: t('judgeTour.s7Title'),
      desc: t('judgeTour.s7Desc'),
      route: 'UnionMap',
      time: '2:50',
      done: progressStep >= 5,
    },
    {
      id: 9,
      title: t('judgeTour.s9Title'),
      desc: t('judgeTour.s9Desc'),
      route: 'ElderRadio',
      time: '3:10',
      done: hasVisited('elder'),
    },
    {
      id: 10,
      title: t('judgeTour.s10Title'),
      desc: t('judgeTour.s10Desc'),
      route: 'CertificateGallery',
      time: '3:25',
      done: hasVisited('gallery'),
    },
    {
      id: 11,
      title: t('judgeTour.s11Title'),
      desc: t('judgeTour.s11Desc'),
      route: 'PartnerDashboard',
      time: '3:40',
      done: hasVisited('partner'),
    },
    {
      id: 12,
      title: t('judgeTour.s8Title'),
      desc: t('judgeTour.s8Desc'),
      route: 'GalaLeaderboard',
      time: '3:55',
      done: hasVisited('gala'),
    },
  ];

  const nextStep = steps.find((s) => !s.done) ?? steps[steps.length - 1];
  const completedCount = steps.filter((s) => s.done).length;
  const tourComplete = completedCount === steps.length;

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.hero}>
          <Text style={styles.badge}>{t('judgeTour.badge')}</Text>
          <Text style={styles.title}>{t('judgeTour.title')}</Text>
          <Text style={styles.sub}>{t('judgeTour.sub')}</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${(completedCount / steps.length) * 100}%` }]} />
          </View>
          <Text style={styles.progressText}>
            {t('judgeTour.progress', { done: completedCount, total: steps.length })}
          </Text>
        </View>

        {steps.map((step) => (
          <Pressable
            key={step.id}
            style={[styles.stepCard, step.done && styles.stepDone, step.id === nextStep.id && !step.done && styles.stepNext]}
            onPress={() => navigation.navigate(step.route as never)}
          >
            <View style={styles.stepLeft}>
              <Text style={styles.stepNum}>{step.done ? '✓' : step.id}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.stepHead}>
                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepTime}>{step.time}</Text>
              </View>
              <Text style={styles.stepDesc}>{step.desc}</Text>
            </View>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}

        <View style={styles.ctaBlock}>
          {tourComplete ? (
            <View style={styles.completeBox}>
              <Text style={styles.completeTitle}>{t('judgeTour.completeTitle')}</Text>
              <Text style={styles.completeBody}>{t('judgeTour.completeBody')}</Text>
            </View>
          ) : null}
          <Button
            label={tourComplete ? t('judgeTour.replay') : t('judgeTour.continue', { step: nextStep.title })}
            onPress={() => navigation.navigate((tourComplete ? 'Landing' : nextStep.route) as never)}
          />
          <Button label={t('common.home')} variant="ghost" onPress={() => navigation.navigate('Landing')} />
        </View>

        <View style={styles.pitchBox}>
          <Text style={styles.pitchLabel}>{t('judgeTour.pitchLabel')}</Text>
          <Text style={styles.pitchText}>{t('judgeTour.pitch')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 640, alignSelf: 'center', width: '100%' },
  hero: {
    backgroundColor: colors.dark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    marginBottom: spacing.lg,
  },
  badge: { fontSize: 10, fontWeight: '800', color: colors.gold, letterSpacing: 1.2 },
  title: { fontSize: 22, fontWeight: '800', color: colors.white, marginTop: 8 },
  sub: { fontSize: 13, color: '#CBD5E1', marginTop: 8, lineHeight: 20 },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', backgroundColor: colors.gold, borderRadius: 3 },
  progressText: { fontSize: 11, color: colors.gold, marginTop: 6, fontWeight: '700' },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: 14,
    marginBottom: 8,
  },
  stepDone: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  stepNext: { borderColor: colors.gold, borderWidth: 2 },
  stepLeft: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: { color: colors.white, fontWeight: '800', fontSize: 14 },
  stepHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stepTitle: { fontSize: 14, fontWeight: '800', color: colors.dark, flex: 1 },
  stepTime: { fontSize: 10, color: colors.textMuted, fontWeight: '700' },
  stepDesc: { fontSize: 12, color: colors.textMuted, marginTop: 3, lineHeight: 17 },
  chevron: { fontSize: 22, color: colors.textMuted, fontWeight: '300' },
  ctaBlock: { marginTop: spacing.lg, gap: 4 },
  completeBox: {
    backgroundColor: '#E6F6ED',
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.green,
    marginBottom: 8,
  },
  completeTitle: { fontSize: 16, fontWeight: '800', color: colors.greenDeep, textAlign: 'center' },
  completeBody: { fontSize: 12, color: colors.textMuted, marginTop: 6, textAlign: 'center', lineHeight: 18 },
  pitchBox: {
    marginTop: spacing.xl,
    backgroundColor: '#FBF6E3',
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.gold,
  },
  pitchLabel: { fontSize: 9, fontWeight: '800', color: '#7A5E00', letterSpacing: 1 },
  pitchText: { fontSize: 12, color: colors.dark, marginTop: 8, lineHeight: 19, fontStyle: 'italic' },
});
