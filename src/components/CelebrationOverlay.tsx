import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, StyleSheet, Animated } from 'react-native';
import { colors } from '../theme/colors';

const EMOJIS = ['🎉', '🇹🇿', '⭐', '🏆', '💛', '💚', '🌊', '🏔️'];

export default function CelebrationOverlay({
  visible,
  title,
  subtitle,
  onDone,
}: {
  visible: boolean;
  title: string;
  subtitle?: string;
  onDone?: () => void;
}) {
  const scale = useRef(new Animated.Value(0.6)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    const t = setTimeout(() => onDone?.(), 2800);
    return () => clearTimeout(t);
  }, [visible, scale, opacity, onDone]);

  if (!visible) return null;

  return (
    <Modal transparent visible animationType="none">
      <View style={styles.overlay}>
        {EMOJIS.map((e, i) => (
          <Text
            key={i}
            style={[
              styles.emoji,
              {
                top: `${10 + (i * 11) % 70}%`,
                left: `${5 + (i * 13) % 85}%`,
                fontSize: 18 + (i % 3) * 8,
                opacity: 0.7 + (i % 3) * 0.1,
              },
            ]}
          >
            {e}
          </Text>
        ))}
        <Animated.View style={[styles.card, { transform: [{ scale }], opacity }]}>
          <Text style={styles.flag}>🇹🇿</Text>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(17,122,101,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emoji: { position: 'absolute' },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    maxWidth: 340,
    width: '100%',
    borderWidth: 3,
    borderColor: colors.gold,
  },
  flag: { fontSize: 48, marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, textAlign: 'center' },
  sub: { fontSize: 14, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },
});
