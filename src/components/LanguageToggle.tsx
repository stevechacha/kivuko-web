import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import type { Locale } from '../i18n/strings';

const OPTIONS: { id: Locale; label: string }[] = [
  { id: 'sw', label: 'SW' },
  { id: 'en', label: 'EN' },
];

export default function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <View style={styles.wrap} accessibilityRole="tablist">
      {OPTIONS.map((opt) => {
        const active = locale === opt.id;
        return (
          <Pressable
            key={opt.id}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => setLocale(opt.id)}
            style={[styles.pill, active && styles.pillActive]}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    backgroundColor: '#EEF2F1',
    borderRadius: 999,
    padding: 2,
    gap: 2,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    minWidth: 36,
    alignItems: 'center',
  },
  pillActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  label: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  labelActive: { color: colors.greenDeep },
});
