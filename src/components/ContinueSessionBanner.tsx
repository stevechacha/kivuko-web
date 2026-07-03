import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { useSession } from '../context/SessionContext';
import { colors, radius } from '../theme/colors';
import Button from './Button';

export default function ContinueSessionBanner({
  navigation,
}: {
  navigation: Pick<NativeStackNavigationProp<RootStackParamList>, 'navigate'>;
}) {
  const { participant, missionId } = useSession();

  if (!participant) return null;

  const firstName = participant.name.split(' ')[0];

  return (
    <View style={styles.banner}>
      <Text style={styles.title}>Karibu tena, {firstName}!</Text>
      <Text style={styles.body}>
        Kipindi chako kimehifadhiwa. Endelea safari yako ya Kivuko.
      </Text>
      <View style={styles.actions}>
        {missionId ? (
          <Button
            label="Endelea Dhamira →"
            onPress={() => navigation.navigate('MissionChat')}
          />
        ) : (
          <Button
            label="Fungua Dashibodi →"
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
