import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform, Alert } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import { PUBLIC_APP_URL } from '../config/api';

export default function InviteFriendCard() {
  const { t } = useLocale();
  const [copied, setCopied] = useState(false);
  const inviteUrl = `${PUBLIC_APP_URL.replace(/\/$/, '')}/usajili`;

  const copy = () => {
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    Alert.alert(t('hub.inviteTitle'), inviteUrl);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.icon}>📨</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('hub.inviteTitle')}</Text>
        <Text style={styles.body}>{t('hub.inviteBody')}</Text>
      </View>
      <Pressable style={styles.btn} onPress={copy}>
        <Text style={styles.btnText}>{copied ? t('hub.inviteCopied') : t('hub.inviteCta')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#EEF6FF',
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: spacing.lg,
  },
  icon: { fontSize: 28 },
  title: { fontSize: 13, fontWeight: '800', color: colors.blueDeep },
  body: { fontSize: 11, color: colors.textMuted, marginTop: 2, lineHeight: 16 },
  btn: {
    backgroundColor: colors.blue,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  btnText: { color: colors.white, fontSize: 10, fontWeight: '800' },
});
