// components/ScreenHeader.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../theme/colors';

interface Props {
  stepLabel: string; // e.g. "Hatua 1 ya 5 — Usajili"
  title: string;
  subtitle?: string;
}

export default function ScreenHeader({ stepLabel, title, subtitle }: Props) {
  return (
    <View style={styles.wrap}>
      <Text style={typography.eyebrow}>{stepLabel}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg },
  title: { fontSize: 24, fontWeight: '700', color: colors.dark, marginTop: 6 },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
});
