// PatrioticHeroPanel — Bara ↔ Visiwani bridge visual (improvement/first.html)
import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { colors, radius } from '../theme/colors';

export default function PatrioticHeroPanel() {
  return (
    <View style={styles.panel}>
      <View style={styles.flagStripe} pointerEvents="none" />
      <Text style={styles.badgeText}>Sisi ni Wamoja</Text>
      <Text style={styles.title}>Muungano Imara, Kidijitali</Text>
      <Text style={styles.sub}>Kuunganisha Bara na Visiwani bila ubaguzi wa aina yoyote.</Text>

      <View style={styles.bridgeRow}>
        <View style={[styles.regionCard, styles.baraCard]}>
          <Text style={styles.regionBadgeText}>BARA</Text>
          <Text style={styles.regionIcon}>🏔️</Text>
          <Text style={styles.regionLabel}>TANZANIA BARA</Text>
        </View>

        <View style={styles.bridgeMid}>
          <View style={styles.bridgeArcTop} />
          <View style={styles.bridgeArcBottom} />
          <Text style={styles.bridgeTag}>🌉 KIVUKO LA DATA</Text>
        </View>

        <View style={[styles.regionCard, styles.znzCard]}>
          <Text style={styles.regionBadgeText}>VISIWANI</Text>
          <Text style={styles.regionIcon}>⛵</Text>
          <Text style={styles.regionLabel}>ZANZIBAR</Text>
        </View>
      </View>

      <View style={styles.unityBox}>
        <Text style={styles.unityEyebrow}>❤️ Hatubaguani kwa Dini wala Kabila</Text>
        <View style={styles.unityRow}>
          <View style={styles.unityAvatar}><Text>🤝</Text></View>
          <Text style={styles.unityHands}>🫱🏿‍🫲🏽</Text>
          <View style={[styles.unityAvatar, styles.unityAvatarBlue]}><Text>🎓</Text></View>
        </View>
        <Text style={styles.unityQuote}>
          "Hakuna Udini wala Upendeleo — sisi sote ni ndugu chini ya Kivuli cha Jamhuri ya Muungano."
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: 'rgba(26,26,26,0.88)',
    borderRadius: radius.lg,
    padding: 22,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    minHeight: 340,
  },
  flagStripe: {
    ...Platform.select({
      web: {
        backgroundImage:
          'linear-gradient(135deg, rgba(0,135,81,0.35) 0%, rgba(255,209,0,0.25) 28%, rgba(26,26,26,0.5) 38%, rgba(0,163,224,0.35) 100%)',
      },
      default: { backgroundColor: 'rgba(0,135,81,0.15)' },
    }),
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  badgeText: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold,
    fontSize: 10,
    fontWeight: '800',
    color: colors.dark,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  title: { fontSize: 22, fontWeight: '900', color: colors.white, marginTop: 10 },
  sub: { fontSize: 12, color: '#CBD5E1', marginTop: 4 },
  bridgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    paddingHorizontal: 4,
  },
  regionCard: {
    width: 100,
    alignItems: 'center',
    borderRadius: 14,
    padding: 12,
    borderWidth: 2,
  },
  baraCard: { backgroundColor: 'rgba(17,122,101,0.35)', borderColor: colors.green },
  znzCard: { backgroundColor: 'rgba(31,97,141,0.35)', borderColor: colors.blue },
  regionBadgeText: {
    position: 'absolute',
    top: -8,
    right: -4,
    backgroundColor: colors.gold,
    fontSize: 8,
    fontWeight: '800',
    color: colors.dark,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    overflow: 'hidden',
  },
  regionIcon: { fontSize: 28, marginTop: 6 },
  regionLabel: { fontSize: 9, fontWeight: '800', color: colors.white, marginTop: 6, letterSpacing: 0.5 },
  bridgeMid: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 60 },
  bridgeArcTop: {
    width: 56,
    height: 2,
    backgroundColor: colors.gold,
    borderRadius: 2,
    transform: [{ rotate: '-8deg' }],
    marginBottom: 6,
  },
  bridgeArcBottom: {
    width: 56,
    height: 2,
    backgroundColor: colors.blue,
    borderRadius: 2,
    transform: [{ rotate: '8deg' }],
  },
  bridgeTag: {
    marginTop: 8,
    fontSize: 8,
    fontWeight: '800',
    color: colors.dark,
    backgroundColor: colors.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: 'hidden',
  },
  unityBox: {
    marginTop: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  unityEyebrow: { fontSize: 11, fontWeight: '700', color: colors.gold, textAlign: 'center' },
  unityRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 16, marginVertical: 12 },
  unityAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(17,122,101,0.5)',
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unityAvatarBlue: { backgroundColor: 'rgba(31,97,141,0.5)' },
  unityHands: { fontSize: 22 },
  unityQuote: { fontSize: 12, color: colors.white, textAlign: 'center', lineHeight: 18 },
});
