// RadioPartnerScreen — Top 10 Elder + youth gala broadcast pack
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import AdminPinGate from '../components/AdminPinGate';
import { api, type RadioPartnerData } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { isAdminUnlocked } from '../utils/adminAccess';

type Props = NativeStackScreenProps<RootStackParamList, 'RadioPartner'>;

export default function RadioPartnerScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [data, setData] = useState<RadioPartnerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unlocked) return;
    api.getRadioPartner().then(setData).finally(() => setLoading(false));
  }, [unlocked]);

  if (!unlocked) {
    return (
      <SafeAreaView style={styles.safe}>
        <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
        <AdminPinGate onUnlocked={() => setUnlocked(true)} onCancel={goBack} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>{t('radio.badge')}</Text>
        <Text style={styles.title}>{data?.segment_title ?? t('radio.title')}</Text>
        <Text style={styles.sub}>{data?.station_name}</Text>

        {loading || !data ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : (
          <>
            <Text style={styles.section}>{t('radio.elderTop10')}</Text>
            {data.elder_nominees.length === 0 ? (
              <Text style={styles.empty}>{t('radio.emptyElders')}</Text>
            ) : (
              data.elder_nominees.map((e) => (
                <View key={e.story_id} style={styles.card}>
                  <Text style={styles.rank}>#{e.rank}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.name}>{e.contributor_name}</Text>
                    <Text style={styles.meta}>{e.title} · {e.home_area}</Text>
                  </View>
                </View>
              ))
            )}

            <Text style={styles.section}>{t('radio.youthGala')}</Text>
            {data.youth_gala_nominees.map((y) => (
              <View key={y.rank} style={styles.card}>
                <Text style={styles.rank}>#{y.rank}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.name}>{y.name}</Text>
                  <Text style={styles.meta}>{y.home_area} · {y.patriotism_points} pts</Text>
                </View>
              </View>
            ))}

            <View style={[styles.ready, data.broadcast_ready ? styles.readyOn : styles.readyOff]}>
              <Text style={styles.readyText}>
                {data.broadcast_ready ? t('radio.ready') : t('radio.notReady')}
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 720, alignSelf: 'center', width: '100%' },
  badge: { fontSize: 10, fontWeight: '800', color: colors.gold, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 8 },
  sub: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.lg },
  section: { fontSize: 13, fontWeight: '800', color: colors.dark, marginTop: spacing.md, marginBottom: 8 },
  empty: { fontSize: 12, color: colors.textMuted, marginBottom: 12 },
  card: { flexDirection: 'row', gap: 10, backgroundColor: colors.white, borderRadius: radius.md, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  rank: { fontSize: 16, fontWeight: '800', color: colors.gold, width: 36 },
  name: { fontSize: 13, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  ready: { marginTop: spacing.lg, padding: 14, borderRadius: radius.md, alignItems: 'center' },
  readyOn: { backgroundColor: '#E6F3ED' },
  readyOff: { backgroundColor: '#FEE2E2' },
  readyText: { fontSize: 12, fontWeight: '800', color: colors.dark },
});
