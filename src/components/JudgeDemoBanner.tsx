import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius } from '../theme/colors';
import Button from './Button';
import { useLocale } from '../context/LocaleContext';

type Nav = Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;

export default function JudgeDemoBanner({ navigation }: { navigation: Nav }) {
  const { t } = useLocale();

  return (
    <View style={styles.banner}>
      <Text style={styles.badge}>{t('judgeBanner.badge')}</Text>
      <Text style={styles.title}>{t('judgeBanner.title')}</Text>
      <Text style={styles.body}>{t('judgeBanner.body')}</Text>
      <View style={styles.actions}>
        <Button label={t('judgeBanner.cta')} onPress={() => navigation.navigate('JudgeTour')} />
        <Button
          label={t('judgeBanner.admin')}
          variant="ghost"
          onPress={() => navigation.navigate('AdminDashboard')}
        />
      </View>
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
  actions: { marginTop: 12, gap: 8 },
});
