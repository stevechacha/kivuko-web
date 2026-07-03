// PartnerDashboardScreen — government verification + reach dashboard
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import AdminPinGate from '../components/AdminPinGate';
import { api, type CertificateVerifyResponse, type PartnerDashboard } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { isAdminUnlocked } from '../utils/adminAccess';
import { markVisited } from '../utils/visitTracking';

type Props = NativeStackScreenProps<RootStackParamList, 'PartnerDashboard'>;

export default function PartnerDashboardScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [unlocked, setUnlocked] = useState(isAdminUnlocked());
  const [data, setData] = useState<PartnerDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [certCode, setCertCode] = useState('');
  const [verifyResult, setVerifyResult] = useState<CertificateVerifyResponse | null>(null);
  const [verifying, setVerifying] = useState(false);

  useEffect(() => {
    if (!unlocked) return;
    markVisited('partner');
    api.getPartnerDashboard().then(setData).finally(() => setLoading(false));
  }, [unlocked]);

  const verifyCert = async () => {
    const code = certCode.trim().toUpperCase();
    if (!code) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const res = await api.verifyCertificate(code);
      setVerifyResult(res);
    } catch {
      setVerifyResult({ valid: false, detail: t('partner.verifyInvalid') });
    } finally {
      setVerifying(false);
    }
  };

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
        <Text style={styles.sub}>{t('partner.verifySub')}</Text>

        <View style={styles.verifyCard}>
          <Text style={styles.section}>{t('partner.verifyTitle')}</Text>
          <TextInput
            style={styles.input}
            value={certCode}
            onChangeText={setCertCode}
            placeholder="KMH-123456"
            autoCapitalize="characters"
          />
          <Button
            label={verifying ? t('common.loading') : t('partner.verifyBtn')}
            onPress={verifyCert}
            disabled={verifying}
          />
          {verifyResult ? (
            <View style={[styles.result, verifyResult.valid ? styles.resultOk : styles.resultBad]}>
              <Text style={styles.resultTitle}>
                {verifyResult.valid ? t('partner.verifyOk') : t('partner.verifyFail')}
              </Text>
              {verifyResult.valid && verifyResult.certificate ? (
                <Text style={styles.resultMeta}>
                  {verifyResult.certificate.user_name} · {verifyResult.certificate.issued_date}
                </Text>
              ) : (
                <Text style={styles.resultMeta}>{verifyResult.detail}</Text>
              )}
            </View>
          ) : null}
          {data?.recent_certificates?.length ? (
            <View style={styles.recent}>
              <Text style={styles.recentLabel}>{t('partner.recentCerts')}</Text>
              {data.recent_certificates.map((c) => (
                <Pressable key={c.cert_code} onPress={() => setCertCode(c.cert_code)} style={styles.recentRow}>
                  <Text style={styles.recentCode}>{c.cert_code}</Text>
                  <Text style={styles.recentName}>{c.user_name}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>

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
              <Stat label={t('partner.elderRadio')} value={data.elder_radio_nominees} accent="#7C3AED" />
              <Stat label={t('partner.autoFlags')} value={data.auto_flagged_pending} accent="#DC2626" />
            </View>
            <Text style={styles.section}>{t('partner.institutions')}</Text>
            {data.institutions.map((inst) => (
              <View key={inst.code} style={styles.row}>
                <Text style={styles.rowTitle}>{inst.name}</Text>
                <Text style={styles.rowMeta}>
                  {inst.code} · {inst.home_area} · {inst.youth_count} {t('partner.youthShort')}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <View style={[styles.stat, accent ? { borderLeftColor: accent, borderLeftWidth: 3 } : null]}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 900, alignSelf: 'center', width: '100%' },
  badge: { fontSize: 10, fontWeight: '800', color: colors.blue, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark, marginTop: 4 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 6, marginBottom: spacing.md, lineHeight: 20 },
  verifyCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  section: { fontSize: 13, fontWeight: '800', color: colors.dark, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  result: { marginTop: 12, padding: 12, borderRadius: radius.md },
  resultOk: { backgroundColor: '#E6F3ED' },
  resultBad: { backgroundColor: '#FEE2E2' },
  resultTitle: { fontSize: 13, fontWeight: '800', color: colors.dark },
  resultMeta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  recent: { marginTop: 14 },
  recentLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, marginBottom: 6 },
  recentRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  recentCode: { fontSize: 12, fontWeight: '800', color: colors.green },
  recentName: { fontSize: 12, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stat: {
    flexBasis: '30%',
    flexGrow: 1,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontSize: 20, fontWeight: '800', color: colors.green },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  row: { backgroundColor: colors.white, borderRadius: radius.md, padding: 12, marginTop: 8, borderWidth: 1, borderColor: colors.line },
  rowTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  rowMeta: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
});
