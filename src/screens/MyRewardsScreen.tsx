// MyRewardsScreen — youth micro-rewards ledger (airtime / M-Pesa)
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import { api, type MyRewardsSummary } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { markVisited } from '../utils/visitTracking';

type Props = NativeStackScreenProps<RootStackParamList, 'MyRewards'>;

const STATUS_COLOR: Record<string, string> = {
  pending: '#D97706',
  processing: '#2563EB',
  sent: colors.green,
  failed: '#DC2626',
};

export default function MyRewardsScreen({ navigation }: Props) {
  const { participant } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [data, setData] = useState<MyRewardsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    markVisited('rewards');
    if (!participant?.session_token) return;
    api.getMyRewards(participant.session_token).then(setData).finally(() => setLoading(false));
  }, [participant?.session_token]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.badge}>{t('rewards.badge')}</Text>
        <Text style={styles.title}>{t('rewards.title')}</Text>
        <Text style={styles.sub}>{t('rewards.sub')}</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : !data ? (
          <Text style={styles.empty}>{t('rewards.empty')}</Text>
        ) : (
          <>
            <View style={styles.summaryRow}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('rewards.pending')}</Text>
                <Text style={styles.summaryValue}>TZS {data.pending_total_tzs.toLocaleString()}</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>{t('rewards.sent')}</Text>
                <Text style={[styles.summaryValue, { color: colors.green }]}>
                  TZS {data.sent_total_tzs.toLocaleString()}
                </Text>
              </View>
            </View>

            {data.rewards.length === 0 ? (
              <Text style={styles.empty}>{t('rewards.noItems')}</Text>
            ) : (
              data.rewards.map((r) => (
                <View key={r.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Text style={styles.amount}>TZS {r.amount_tzs.toLocaleString()}</Text>
                    <Text style={[styles.status, { color: STATUS_COLOR[r.status] ?? colors.textMuted }]}>
                      {t(`rewards.status.${r.status}`)}
                    </Text>
                  </View>
                  <Text style={styles.source}>{r.source}</Text>
                  <Text style={styles.meta}>
                    {r.reward_type === 'airtime' ? '📱 Airtime' : '💳 M-Pesa'} · {r.created_at_label}
                  </Text>
                </View>
              ))
            )}
            <Text style={styles.note}>{t('rewards.sandboxNote')}</Text>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 40 },
  badge: { fontSize: 9, fontWeight: '800', color: colors.gold, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: 16 },
  summaryRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  summaryCard: { flex: 1, backgroundColor: colors.white, borderRadius: radius.md, padding: 14, borderWidth: 1, borderColor: colors.line },
  summaryLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase' },
  summaryValue: { fontSize: 18, fontWeight: '800', color: colors.dark, marginTop: 6 },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.line },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  amount: { fontSize: 16, fontWeight: '800', color: colors.dark },
  status: { fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  source: { fontSize: 12, color: colors.dark, marginTop: 6 },
  meta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: 24 },
  note: { fontSize: 10, color: colors.textMuted, marginTop: 16, lineHeight: 15, fontStyle: 'italic' },
});
