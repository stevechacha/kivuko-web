import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, spacing } from '../theme/colors';

const STEPS = 5;

interface Props {
  /** 0 = landing (no dot active), 1–5 = flow steps */
  currentStep: number;
}

export default function TopNav({ currentStep }: Props) {
  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <View style={styles.logoRow}>
          <Svg width={30} height={30} viewBox="0 0 40 40">
            <Circle cx={20} cy={20} r={19} fill={colors.bg} stroke={colors.green} strokeWidth={1.5} />
            <Path
              d="M6 24 C 12 14, 18 14, 20 20 C 22 26, 28 26, 34 16"
              stroke={colors.gold}
              strokeWidth={2.4}
              strokeLinecap="round"
              fill="none"
            />
            <Circle cx={7} cy={24} r={2.6} fill={colors.green} />
            <Circle cx={33} cy={16} r={2.6} fill={colors.blue} />
          </Svg>
          <Text style={styles.logoText}>Kivuko la Muungano</Text>
        </View>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }, (_, i) => {
            const stepNum = i + 1;
            const active = currentStep === stepNum;
            const done = currentStep > stepNum;
            return (
              <View
                key={stepNum}
                style={[
                  styles.dot,
                  active && styles.dotActive,
                  done && styles.dotDone,
                ]}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: Platform.OS === 'web' ? 'rgba(248,249,249,0.92)' : colors.bg,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  inner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    maxWidth: 1080,
    width: '100%',
    alignSelf: 'center',
  },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoText: {
    fontSize: 19,
    fontWeight: '700',
    color: colors.dark,
    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : undefined,
  },
  dots: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.line,
  },
  dotActive: {
    width: 22,
    backgroundColor: colors.green,
  },
  dotDone: {
    backgroundColor: colors.gold,
  },
});
