import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import type { Peer } from '../api/client';
import { colors, radius, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

type Nav = Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;

type Props = {
  peer: Peer;
  navigation: Nav;
  onOpenChat?: () => void;
};

export default function TwinPeerCard({ peer, navigation, onOpenChat }: Props) {
  const { t } = useLocale();
  const regionEmoji = peer.region === 'visiwani' ? '🌊' : '🏔️';

  return (
    <View style={styles.card}>
      <Text style={styles.eyebrow}>{t('twin.badge')}</Text>
      <View style={styles.row}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{peer.initials || peer.name.slice(0, 2).toUpperCase()}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{peer.name}</Text>
          <Text style={styles.meta}>
            {regionEmoji} {peer.region_label} · {peer.home_area}
          </Text>
        </View>
      </View>
      <Text style={styles.privacy}>{t('twin.privacy')}</Text>
      <Pressable
        style={styles.cta}
        onPress={() => (onOpenChat ? onOpenChat() : navigation.navigate('MissionChat'))}
      >
        <Text style={styles.ctaText}>{t('twin.openChat')} →</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    borderLeftColor: colors.blue,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  eyebrow: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.blue,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  row: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: { fontSize: 16, fontWeight: '800', color: colors.blue },
  name: { fontSize: 16, fontWeight: '800', color: colors.dark },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  privacy: { fontSize: 10, color: colors.textMuted, marginTop: 10, lineHeight: 15 },
  cta: { marginTop: 10, alignSelf: 'flex-start' },
  ctaText: { fontSize: 12, fontWeight: '800', color: colors.blue },
});
