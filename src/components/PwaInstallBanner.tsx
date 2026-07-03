import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import { registerServiceWorker } from '../utils/pwa';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
};

export default function PwaInstallBanner() {
  const { t } = useLocale();
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    registerServiceWorker();
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
    }
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
    setInstalled(true);
  };

  if (Platform.OS !== 'web' || installed || !deferred) return null;

  return (
    <Pressable style={styles.wrap} onPress={install}>
      <Text style={styles.icon}>📲</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{t('pwa.installTitle')}</Text>
        <Text style={styles.sub}>{t('pwa.installSub')}</Text>
      </View>
      <Text style={styles.cta}>{t('pwa.installCta')} →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#EFF6FF',
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  icon: { fontSize: 22 },
  title: { fontSize: 12, fontWeight: '800', color: colors.dark },
  sub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  cta: { fontSize: 11, fontWeight: '800', color: colors.blue },
});
