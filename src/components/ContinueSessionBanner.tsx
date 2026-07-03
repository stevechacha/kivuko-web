import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { colors, radius } from '../theme/colors';
import Button from './Button';

export default function ContinueSessionBanner({
  navigation,
}: {
  navigation: Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;
}) {
  const { participant, missionId } = useSession();
  const { t } = useLocale();

  if (!participant) return null;

  const firstName = participant.name.split(' ')[0];

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>{t('continueBanner.title', { name: firstName })}</Text>
      <Text style={styles.body}>{t('continueBanner.body')}</Text>
      <View style={styles.actions}>
        {missionId ? (
          <Button
            label={t('continueBanner.resumeMission')}
            onPress={() => navigation.navigate('MissionChat')}
          />
        ) : (
          <Button
            label={t('common.openDashboard')}
            onPress={() => navigation.navigate('HubDashboard')}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    marginTop: 20,
    backgroundColor: '#F0FAF8',
    borderWidth: 1,
    borderColor: '#C8E8E0',
    borderRadius: radius.md,
    padding: 18,
    maxWidth: 520,
  },
  title: { fontSize: 15, fontWeight: '800', color: colors.greenDeep },
  body: { fontSize: 13, color: colors.textMuted, marginTop: 4, lineHeight: 19 },
  actions: { marginTop: 14 },
});
