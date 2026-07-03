// VerifyCertificateScreen — QR scan destination / public certificate verification
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import { api } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyCertificate'>;

export default function VerifyCertificateScreen({ route, navigation }: Props) {
  const { certCode } = route.params;
  const { t } = useLocale();
  const goBack = useAppBack(navigation, 'landing');
  const [loading, setLoading] = useState(true);
  const [valid, setValid] = useState(false);
  const [userName, setUserName] = useState('');
  const [issuedDate, setIssuedDate] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .verifyCertificate(certCode)
      .then((res) => {
        if (res.valid && res.certificate) {
          setValid(true);
          setUserName(res.certificate.user_name);
          setIssuedDate(res.certificate.issued_date);
          setQrDataUrl(res.qr_data_url ?? res.certificate.qr_data_url ?? null);
        } else {
          setError(res.detail || 'Cheti hakijapatikana.');
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Uthibitishaji umeshindwa.'))
      .finally(() => setLoading(false));
  }, [certCode]);

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>Uthibitishaji wa Cheti</Text>
        <Text style={styles.title}>Kivuko la Muungano Hub</Text>
        <Text style={styles.code}>Nambari: {certCode}</Text>

        {loading ? (
          <ActivityIndicator color={colors.green} size="large" style={{ marginTop: 40 }} />
        ) : valid ? (
          <View style={styles.validCard}>
            <Text style={styles.validIcon}>✓</Text>
            <Text style={styles.validTitle}>Cheti Halali — Imethibitishwa</Text>
            <Text style={styles.validName}>{userName}</Text>
            <Text style={styles.validSub}>Balozi wa Muungano · Tarehe {issuedDate}</Text>
            {qrDataUrl && PlatformImage(qrDataUrl)}
            <Text style={styles.validNote}>
              Cheti hiki kinaweza kuwekwa kwenye CV au wasifu wa kitaalamu.
            </Text>
          </View>
        ) : (
          <View style={styles.invalidCard}>
            <Text style={styles.invalidTitle}>Cheti Hakipatikani</Text>
            <Text style={styles.invalidBody}>{error}</Text>
          </View>
        )}

        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <Button label={t('common.home')} onPress={goBack} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function PlatformImage(uri: string) {
  if (typeof Image !== 'undefined') {
    return <Image source={{ uri }} style={styles.qrImage} resizeMode="contain" />;
  }
  return null;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 520, width: '100%', alignSelf: 'center', alignItems: 'center' },
  eyebrow: { fontSize: 11, fontWeight: '700', color: colors.greenDeep, textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { fontSize: 22, fontWeight: '700', color: colors.dark, marginTop: 6 },
  code: { fontSize: 12, color: colors.textMuted, marginTop: 4, fontFamily: 'monospace' },
  validCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.green,
    padding: spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  validIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.green,
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 56,
    overflow: 'hidden',
  },
  validTitle: { fontSize: 16, fontWeight: '700', color: colors.greenDeep, marginTop: 14 },
  validName: { fontSize: 24, fontWeight: '800', color: colors.dark, marginTop: 8 },
  validSub: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  qrImage: { width: 120, height: 120, marginTop: 16 },
  validNote: { fontSize: 12, color: colors.textMuted, textAlign: 'center', marginTop: 14, lineHeight: 18 },
  invalidCard: {
    marginTop: spacing.xl,
    backgroundColor: '#FDF0EE',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.danger,
    padding: spacing.lg,
    width: '100%',
    alignItems: 'center',
  },
  invalidTitle: { fontSize: 16, fontWeight: '700', color: colors.danger },
  invalidBody: { fontSize: 13, color: colors.textMuted, marginTop: 8, textAlign: 'center' },
});
