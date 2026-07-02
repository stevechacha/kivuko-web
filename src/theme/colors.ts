// theme/colors.ts
// Kivuko la Muungano Hub — shared design tokens
// Palette follows the brief's Tanzanian-flag-inspired identity.

export const colors = {
  green: '#117A65',
  greenDeep: '#0B5C4C',
  blue: '#1F618D',
  blueDeep: '#154866',
  gold: '#F1C40F',
  dark: '#1A1A1A',
  bg: '#F8F9F9',
  white: '#FFFFFF',
  line: '#E4E7E6',
  textMuted: '#5B6664',
  danger: '#C0392B',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 14,
  lg: 20,
  xl: 28,
  xxl: 40,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const typography = {
  display: {
    // Pair with a serif such as 'Newsreader' or 'PlayfairDisplay' if you add
    // custom fonts via expo-font; falls back to system serif otherwise.
    fontFamily: undefined as string | undefined,
    fontWeight: '700' as const,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700' as const,
    letterSpacing: 1.2,
    textTransform: 'uppercase' as const,
    color: colors.greenDeep,
  },
};

export default colors;
