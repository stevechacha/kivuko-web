import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import { api, type PlatformStatus } from '../api/client';

export default function PlatformStatusChip() {
  const { t } = useLocale();
  const [status, setStatus] = useState<PlatformStatus | null>(null);

  useEffect(() => {
    api.getPlatformStatus().then(setStatus).catch(() => setStatus(null));
  }, []);

  if (!status) return null;

  const ready = status.demo_ready;

  return (
    <View style={[styles.chip, ready ? styles.chipReady : styles.chipWait]}>
      <View style={[styles.dot, ready ? styles.dotReady : styles.dotWait]} />
      <Text style={[styles.text, ready ? styles.textReady : styles.textWait]}>
        {ready ? t('platform.ready') : t('platform.syncing')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
    marginTop: 10,
  },
  chipReady: { backgroundColor: '#E6F6ED', borderWidth: 1, borderColor: colors.green },
  chipWait: { backgroundColor: '#FEF3C7', borderWidth: 1, borderColor: colors.gold },
  dot: { width: 7, height: 7, borderRadius: 4 },
  dotReady: { backgroundColor: colors.green },
  dotWait: { backgroundColor: colors.gold },
  text: { fontSize: 10, fontWeight: '800' },
  textReady: { color: colors.greenDeep },
  textWait: { color: '#7A5E00' },
});
