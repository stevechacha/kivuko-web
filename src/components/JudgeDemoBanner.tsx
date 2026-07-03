import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from './Button';

type Nav = Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;

export default function JudgeDemoBanner({ navigation }: { navigation: Nav }) {
  return (
    <View style={styles.banner}>
      <Text style={styles.badge}>🎬 ONYESHO LA WAAMUZI</Text>
      <Text style={styles.title}>Anza Safari ya Mwanzo hadi Mwisho</Text>
      <Text style={styles.body}>
        Bonyeza hapa kuanza mtiririko kamili wa dakika 3: Usajili → Uoanishaji → Dhamira → Cheti → Ramani.
        Imewekwa tayari kwa video ya mashindano.
      </Text>
      <Button
        label="▶ Anza Onyesho la Waamuzi"
        onPress={() => navigation.navigate('Onboarding')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: radius.lg,
    padding: 18,
    borderWidth: 2,
    borderColor: colors.gold,
    maxWidth: 520,
  },
  badge: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.gold,
    letterSpacing: 1.2,
  },
  title: { fontSize: 16, fontWeight: '800', color: colors.white, marginTop: 8 },
  body: { fontSize: 12, color: '#CBD5E1', marginTop: 6, lineHeight: 18 },
});
