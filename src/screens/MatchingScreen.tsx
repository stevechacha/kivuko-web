// screens/MatchingScreen.tsx
// Step 2 of 5 — Automated Peer Matching ("The Bridge Engine")
import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, SafeAreaView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import CelebrationOverlay from '../components/CelebrationOverlay';
import { api, type MatchResponse } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useCleanWebUrl } from '../navigation/useCleanWebUrl';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'Matching'>;

const FALLBACK_STATUS_KEYS = ['matching.status1', 'matching.status2', 'matching.status3'] as const;

export default function MatchingScreen({ navigation }: Props) {
  useCleanWebUrl();
  const { participant, setMission } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const name = participant?.name || 'Mzalendo';
  const userRegion = participant?.region || 'bara';
  const [matched, setMatched] = useState(false);
  const [statusIndex, setStatusIndex] = useState(0);
  const [matchResult, setMatchResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.out(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 900, easing: Easing.in(Easing.ease), useNativeDriver: true }),
      ])
    );
    loop.start();

    const stepTimer = setInterval(() => {
      setStatusIndex((i) => i + 1);
    }, 700);

    const runMatch = async () => {
      if (!participant?.session_token) {
        setError(t('matching.errSession'));
        return;
      }
      try {
        const result = await api.match(participant.session_token);
        setMatchResult(result);
        setMission(result.mission_id, result.match_id, result.peer);
        setTimeout(() => {
          clearInterval(stepTimer);
          loop.stop();
          setMatched(true);
          setCelebrate(true);
        }, 2400);
      } catch (e) {
        setError(e instanceof Error ? e.message : t('matching.errMatch'));
        clearInterval(stepTimer);
        loop.stop();
      }
    };

    runMatch();

    return () => {
      clearInterval(stepTimer);
      loop.stop();
    };
  }, [participant?.session_token]);

  const peer = matchResult?.peer;
  const fallbackStatus = FALLBACK_STATUS_KEYS.map((k) => t(k));
  const statusMessages = matchResult?.status_messages ?? fallbackStatus;
  const userRegionLabel = userRegion === 'visiwani' ? t('common.visiwani') : t('common.bara');

  return (
    <SafeAreaView style={styles.safe}>
      <CelebrationOverlay
        visible={celebrate}
        title={t('matching.celebrateTitle')}
        subtitle={
          peer
            ? t('matching.celebrateSub', {
                name: peer.name.split(' ')[0],
                region: peer.region_label,
              })
            : undefined
        }
        onDone={() => setCelebrate(false)}
      />
      <TopNav currentStep={2} showBack onBack={goBack} />
      <View style={styles.content}>
        <Text style={styles.eyebrow}>{t('matching.eyebrow')}</Text>

        {error ? (
          <View style={styles.errorWrap}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={() => navigation.navigate('Onboarding')}>
              <Text style={styles.errorLink}>{t('matching.backRegister')}</Text>
            </Pressable>
          </View>
        ) : !matched ? (
          <View style={styles.loadingWrap}>
            <Animated.View style={[styles.radarCore, { opacity: pulse, transform: [{ scale: pulse }] }]}>
              <Text style={{ fontSize: 26 }}>🧭</Text>
            </Animated.View>
            <Text style={styles.loadingTitle}>{t('matching.loadingTitle')}</Text>
            <Text style={styles.statusText}>
              {statusMessages[Math.min(statusIndex, statusMessages.length - 1)]}
            </Text>
          </View>
        ) : peer ? (
          <View style={styles.resultWrap}>
            <Text style={styles.resultTitle}>
              {t('matching.matched', { peer: peer.name, region: peer.region_label })}
            </Text>

            <View style={styles.pairRow}>
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.avatar, { backgroundColor: colors.green }]}>
                  <Text style={styles.avatarText}>{name.split(' ').map((w) => w[0]).join('').slice(0, 2)}</Text>
                </View>
                <Text style={[styles.avatarTag, { color: colors.greenDeep }]}>{name.split(' ')[0]} · {userRegionLabel}</Text>
              </View>
              <View style={styles.bridgeMini} />
              <View style={{ alignItems: 'center' }}>
                <View style={[styles.avatar, { backgroundColor: colors.blue }]}>
                  <Text style={styles.avatarText}>{peer.initials}</Text>
                </View>
                <Text style={[styles.avatarTag, { color: colors.blueDeep }]}>
                  {peer.name.split(' ')[0]} · {peer.region_label}
                </Text>
              </View>
            </View>

            <Text style={styles.muted}>{t('matching.matchedNote')}</Text>

            <View style={{ marginTop: spacing.lg }}>
              <Button
                label={t('matching.enterMission')}
                variant="secondary"
                onPress={() => navigation.navigate('MissionChat')}
              />
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg, justifyContent: 'center', maxWidth: 720, width: '100%', alignSelf: 'center' },
  eyebrow: { fontSize: 12.5, letterSpacing: 1.8, textTransform: 'uppercase', fontWeight: '700', color: colors.greenDeep, marginBottom: spacing.md },
  loadingWrap: { alignItems: 'center' },
  radarCore: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  loadingTitle: { fontSize: 18, fontWeight: '700', textAlign: 'center', color: colors.dark },
  statusText: { fontSize: 14, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
  resultWrap: { alignItems: 'center' },
  resultTitle: { fontSize: 20, fontWeight: '700', textAlign: 'center', color: colors.dark },
  pairRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg, gap: 18 },
  avatar: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontWeight: '700', fontSize: 22 },
  avatarTag: { fontSize: 11, fontWeight: '700', marginTop: 8, textTransform: 'uppercase' },
  bridgeMini: { width: 48, height: 2, backgroundColor: colors.gold, opacity: 0.7 },
  muted: { fontSize: 13.5, color: colors.textMuted, textAlign: 'center', maxWidth: 300 },
  errorWrap: { alignItems: 'center', gap: 12 },
  errorText: { color: colors.danger, textAlign: 'center', fontSize: 14 },
  errorLink: { color: colors.blue, fontWeight: '700', fontSize: 14 },
});
