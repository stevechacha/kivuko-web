import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

function useCountUp(target: number, duration = 1400) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    if (target <= 0) {
      setDisplay(0);
      return;
    }
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(Math.round(target * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, [target, duration]);
  return display;
}

function StatBlock({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const animated = useCountUp(value);
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>
        {animated.toLocaleString()}
        {suffix}
      </Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export interface LiveImpactData {
  youth_connected: number;
  pairs_today: number;
  certificates_issued: number;
  regions_active: number;
  live_connections: number;
  bara_youth: number;
  visiwani_youth: number;
}

export default function LiveImpactTicker({ data }: { data: LiveImpactData | null }) {
  const { t } = useLocale();
  const pulse = React.useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.04, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 900, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  if (!data) return null;

  return (
    <Animated.View style={[styles.wrap, { transform: [{ scale: pulse }] }]}>
      <View style={styles.liveRow}>
        <View style={styles.liveDot} />
        <Text style={styles.liveLabel}>{t('liveImpact.liveLabel')}</Text>
      </View>
      <View style={styles.grid}>
        <StatBlock label={t('liveImpact.youthConnected')} value={data.youth_connected} />
        <StatBlock label={t('liveImpact.pairsToday')} value={data.pairs_today} />
        <StatBlock label={t('liveImpact.regionsActive')} value={data.regions_active} />
        <StatBlock label={t('liveImpact.certificates')} value={data.certificates_issued} />
      </View>
      <Text style={styles.bridgeLine}>
        {t('liveImpact.bridgeLine', {
          bara: data.bara_youth.toLocaleString(),
          visiwani: data.visiwani_youth.toLocaleString(),
          connections: data.live_connections,
        })}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 22,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.gold,
    padding: 16,
    maxWidth: 520,
  },
  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#E74C3C',
  },
  liveLabel: { fontSize: 9, fontWeight: '800', color: colors.greenDeep, letterSpacing: 1.2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stat: {
    flexBasis: '47%',
    flexGrow: 1,
    backgroundColor: '#F0FAF8',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.greenDeep },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 2, textAlign: 'center', fontWeight: '600' },
  bridgeLine: { fontSize: 11, color: colors.textMuted, marginTop: 12, textAlign: 'center', lineHeight: 16 },
});
