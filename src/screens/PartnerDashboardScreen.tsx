// PartnerDashboardScreen — government / NGO impact dashboard
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import AdminPinGate from '../components/AdminPinGate';
import { api, type PartnerDashboard } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { isAdminUnlocked } from '../utils/adminAccess';

type Props = NativeStackScreenProps<RootStackParamList, 'PartnerDashboard'>;

export default function PartnerDashboardScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [data, setData] = useState<PartnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!unlocked) return;
    api.getPartnerDashboard().then(setData).finally(() => setLoading(false));
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
        <Text style={styles.badge}>{t('partner.badge')}</Text>
        <Text style={styles.title}>{t('partner.title')}</Text>
        {loading || !data ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : (
          <>
            <View style={styles.grid}>
              <Stat label={t('partner.youth')} value={data.youth_registered} />
              <Stat label={t('partner.pairs')} value={data.pairs_today} />
              <Stat label={t('partner.certs')} value={data.certificates_issued} />
              <Stat label={t('partner.missions')} value={data.completed_missions} />
              <Stat label={t('partner.bara')} value={data.bara_youth} />
              <Stat label={t('partner.visiwani')} value={data.visiwani_youth} />
            </View>
            <Text style={styles.section}>{t('partner.institutions')}</Text>
            {data.institutions.map((inst) => (
              <View key={inst.code} style={styles.row}>
                <Text style={styles.rowTitle}>{inst.name}</Text>
                <Text style={styles.rowMeta}>{inst.code} · {inst.home_area} · {inst.youth_count} {t('partner.youthShort')}</Text>
              </View>
            ))}
            <Text style={styles.footer}>
              {t('partner.rewardsPending', { amount: data.rewards_pending_tzs.toLocaleString() })}
            </Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 900, alignSelf: 'center', width: '100%' },
  badge: { fontSize: 10, fontWeight: '800', color: colors.blue, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginVertical: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: { flexBasis: '30%', flexGrow: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.green },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  section: { marginTop: spacing.lg, fontSize: 13, fontWeight: '800', color: colors.dark },
  row: { backgroundColor: colors.white, borderRadius: radius.md, padding: 12, marginTop: 8, borderWidth: 1, borderColor: colors.line },
  rowTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  rowMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  footer: { marginTop: spacing.lg, fontSize: 12, color: colors.textMuted },
});
