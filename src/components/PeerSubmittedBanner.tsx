import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

export default function PeerSubmittedBanner({ peerName }: { peerName: string }) {
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const firstName = peerName.split(' ')[0];

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 1400);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>✓</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('peerBanner.submitted')}</Text>
        <Text style={styles.body}>{t('peerBanner.body', { name: firstName })}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EAF2F7',
    borderWidth: 1,
    borderColor: colors.blue,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: spacing.md,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.blue,
    color: colors.white,
    textAlign: 'center',
    lineHeight: 28,
    fontWeight: '800',
    overflow: 'hidden',
  },
  title: { fontSize: 13, fontWeight: '800', color: colors.blueDeep },
  body: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
});
