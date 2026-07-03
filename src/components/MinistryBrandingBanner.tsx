import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, radius } from '../theme/colors';
import { api, type PlatformBranding } from '../api/client';
import { useLocale } from '../context/LocaleContext';

export default function MinistryBrandingBanner() {
  const { locale } = useLocale();
  const [brand, setBrand] = useState<PlatformBranding | null>(null);

  useEffect(() => {
    const ministryQuery =
      Platform.OS === 'web' &&
      typeof window !== 'undefined' &&
      /[?&]ministry=1/.test(window.location.search);
    api.getPlatformBranding(ministryQuery).then((b) => {
      if (b.ministry_mode) setBrand(b);
    }).catch(() => {});
  }, []);

  if (!brand?.ministry_mode) return null;

  const title = locale === 'en' ? brand.program_name_en : brand.program_name;
  const tagline = locale === 'en' ? brand.tagline_en : brand.tagline_sw;

  return (
    <View style={styles.wrap}>
      <Text style={styles.flag}>🇹🇿</Text>
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.tagline}>{tagline}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#1B4332',
    borderRadius: radius.md,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.gold,
  },
  flag: { fontSize: 28 },
  title: { fontSize: 13, fontWeight: '800', color: colors.gold },
  tagline: { fontSize: 11, color: '#D1FAE5', marginTop: 4, lineHeight: 16 },
});
