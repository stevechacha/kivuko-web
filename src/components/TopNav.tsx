import React from 'react';
import { View, Text, StyleSheet, Platform, Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { colors, spacing } from '../theme/colors';
import { useSession } from '../context/SessionContext';

const STEPS = 5;

interface Props {
  /** 0 = landing/hub (no dot active), 1–5 = flow steps */
  currentStep: number;
  showPoints?: boolean;
  onLogoPress?: () => void;
}

export default function TopNav({ currentStep, showPoints, onLogoPress }: Props) {
  const { participant } = useSession();
  const points = participant?.patriotism_points ?? 0;

  return (
    <View style={styles.bar}>
      <View style={styles.inner}>
        <Pressable style={styles.logoRow} onPress={onLogoPress} disabled={!onLogoPress}>
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
        </Pressable>
        <View style={styles.right}>
          {showPoints && participant ? (
            <View style={styles.pointsBadge}>
              <Text style={styles.pointsText}>⭐ {points.toLocaleString()} Pts</Text>
            </View>
          ) : null}
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
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pointsBadge: {
    backgroundColor: '#F0FAF8',
    borderWidth: 1,
    borderColor: '#C5E8E0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pointsText: { fontSize: 11, fontWeight: '800', color: colors.greenDeep },
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
