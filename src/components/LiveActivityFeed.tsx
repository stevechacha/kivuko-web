import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { colors, radius } from '../theme/colors';

export interface ActivityItem {
  id: string;
  icon: string;
  text: string;
  subtitle?: string;
}

export default function LiveActivityFeed({ items }: { items: ActivityItem[] }) {
  const scrollY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (items.length < 2) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scrollY, { toValue: -1, duration: 12000, useNativeDriver: true }),
        Animated.timing(scrollY, { toValue: 0, duration: 0, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [items.length, scrollY]);

  if (!items.length) return null;

  const doubled = [...items, ...items];

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View style={styles.pulseDot} />
        <Text style={styles.headText}>Shughuli Hai za Muungano</Text>
      </View>
      <View style={styles.clip}>
        <Animated.View
          style={{
            transform: [
              {
                translateY: scrollY.interpolate({
                  inputRange: [-1, 0],
                  outputRange: [-items.length * 52, 0],
                }),
              },
            ],
          }}
        >
          {doubled.map((item, i) => (
            <View key={`${item.id}-${i}`} style={styles.row}>
              <Text style={styles.icon}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.text} numberOfLines={1}>
                  {item.text}
                </Text>
                {item.subtitle ? (
                  <Text style={styles.sub} numberOfLines={1}>
                    {item.subtitle}
                  </Text>
                ) : null}
              </View>
            </View>
          ))}
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    overflow: 'hidden',
    marginTop: 14,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.dark,
  },
  pulseDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#25D366' },
  headText: { color: colors.white, fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  clip: { height: 104, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
    height: 52,
  },
  icon: { fontSize: 18 },
  text: { fontSize: 12.5, fontWeight: '700', color: colors.dark },
  sub: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
});
