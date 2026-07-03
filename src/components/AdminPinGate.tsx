import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Platform, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import Button from './Button';
import { useLocale } from '../context/LocaleContext';

const DEFAULT_PIN = 'MUUNGANO2026';

function getAdminPin(): string {
  const fromEnv = process.env.EXPO_PUBLIC_ADMIN_PIN?.trim();
  return fromEnv || DEFAULT_PIN;
}

export function isAdminUnlocked(): boolean {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return true;
  return sessionStorage.getItem('kivuko_admin_unlock') === '1';
}

export function setAdminUnlocked(): void {
  if (Platform.OS === 'web' && typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem('kivuko_admin_unlock', '1');
  }
}

interface Props {
  onUnlocked: () => void;
  onCancel: () => void;
}

export default function AdminPinGate({ onUnlocked, onCancel }: Props) {
  const { t } = useLocale();
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  const tryUnlock = () => {
    if (pin.trim().toUpperCase() === getAdminPin().toUpperCase()) {
      setAdminUnlocked();
      setError(null);
      onUnlocked();
      return;
    }
    setError(t('admin.pinWrong'));
  };

  return (
    <View style={styles.wrap}>
      <Text style={styles.eyebrow}>{t('admin.pinEyebrow')}</Text>
      <Text style={styles.title}>{t('admin.pinTitle')}</Text>
      <Text style={styles.sub}>{t('admin.pinSub')}</Text>

      <TextInput
        value={pin}
        onChangeText={(v) => {
          setPin(v);
          setError(null);
        }}
        placeholder={t('admin.pinPlaceholder')}
        placeholderTextColor={colors.textMuted}
        secureTextEntry
        autoCapitalize="characters"
        style={styles.input}
        onSubmitEditing={tryUnlock}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        <Button label={t('admin.pinEnter')} onPress={tryUnlock} />
        <Pressable onPress={onCancel} style={styles.cancel}>
          <Text style={styles.cancelText}>{t('common.back')}</Text>
        </Pressable>
      </View>

      <Text style={styles.hint}>{t('admin.pinHint', { pin: DEFAULT_PIN })}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.greenDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 8 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20 },
  input: {
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: colors.white,
    ...Platform.select({ web: { outlineStyle: 'none' as const } }),
  },
  error: { color: colors.danger, fontSize: 13, marginTop: 8 },
  actions: { marginTop: spacing.lg, gap: 12, alignItems: 'center' },
  cancel: { padding: 8 },
  cancelText: { color: colors.greenDeep, fontWeight: '700', fontSize: 14 },
  hint: {
    marginTop: spacing.xl,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 16,
  },
});
