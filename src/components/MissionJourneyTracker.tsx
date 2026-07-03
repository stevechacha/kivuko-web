import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { api, type MissionProgress } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';

export default function MissionJourneyTracker({
  onStepPress,
}: {
  onStepPress?: (step: number, status: string) => void;
}) {
  const { participant } = useSession();
  const { t } = useLocale();
  const [progress, setProgress] = useState<MissionProgress | null>(null);

  useEffect(() => {
    if (!participant?.session_token) return;
    api.getMissionProgress(participant.session_token).then(setProgress).catch(() => {});
  }, [participant?.session_token, participant?.patriotism_points]);

  if (!progress) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <Text style={styles.title}>{t('missionJourney.title')}</Text>
        <Text style={styles.sub}>
          {t('missionJourney.progress', {
            done: progress.completed_count,
            total: progress.total_steps,
            badge: progress.grade.badge,
            label: progress.grade.label,
          })}
        </Text>
      </View>
      <View style={styles.track}>
        {progress.steps.map((step) => (
          <Pressable
            key={step.number}
            style={[
              styles.step,
              step.status === 'completed' && styles.stepDone,
              step.status === 'active' && styles.stepActive,
              step.status === 'locked' && styles.stepLocked,
            ]}
            onPress={() => onStepPress?.(step.number, step.status)}
            disabled={step.status === 'locked'}
          >
            <Text style={styles.stepIcon}>{step.icon}</Text>
            <Text style={styles.stepNum}>{step.number}</Text>
            <Text style={styles.stepTitle} numberOfLines={2}>{step.title}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  head: { marginBottom: 12 },
  title: { fontSize: 13, fontWeight: '800', color: colors.dark },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  track: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  step: {
    width: '18%',
    minWidth: 58,
    flexGrow: 1,
    alignItems: 'center',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: colors.line,
    backgroundColor: colors.bg,
  },
  stepDone: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  stepActive: { borderColor: colors.gold, backgroundColor: '#FBF6E3' },
  stepLocked: { opacity: 0.45 },
  stepIcon: { fontSize: 16 },
  stepNum: { fontSize: 9, fontWeight: '800', color: colors.greenDeep, marginTop: 2 },
  stepTitle: { fontSize: 8, textAlign: 'center', color: colors.dark, marginTop: 2, fontWeight: '600' },
});
