// CertificateGalleryScreen — list + PDF download
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Platform,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type Certificate } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';
import { markVisited } from '../utils/visitTracking';

type Props = NativeStackScreenProps<RootStackParamList, 'CertificateGallery'>;

export default function CertificateGalleryScreen({ navigation }: Props) {
  const { participant } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [certs, setCerts] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    markVisited('gallery');
    if (!participant?.session_token) {
      setLoading(false);
      return;
    }
    api.getMyCertificates(participant.session_token).then(setCerts).finally(() => setLoading(false));
  }, [participant?.session_token]);

  const downloadPdf = async (certCode: string) => {
    if (!participant?.session_token) return;
    setDownloading(certCode);
    try {
      const blob = await api.downloadCertificatePdf(certCode, participant.session_token);
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${certCode}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>{t('gallery.title')}</Text>
        <Text style={styles.sub}>{t('gallery.sub')}</Text>

        {loading ? (
          <ActivityIndicator color={colors.gold} style={{ marginTop: 30 }} />
        ) : certs.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>{t('gallery.empty')}</Text>
            <Button label={t('gallery.getCert')} onPress={() => navigation.navigate('Certificate')} />
          </View>
        ) : (
          certs.map((cert) => (
            <View key={cert.cert_code} style={styles.card}>
              <Text style={styles.code}>{cert.cert_code}</Text>
              <Text style={styles.meta}>{cert.user_name} · {cert.issued_date}</Text>
              <View style={styles.row}>
                <Pressable style={styles.linkBtn} onPress={() => navigation.navigate('VerifyCertificate', { certCode: cert.cert_code })}>
                  <Text style={styles.linkText}>{t('gallery.verify')}</Text>
                </Pressable>
                <Pressable style={styles.pdfBtn} onPress={() => downloadPdf(cert.cert_code)}>
                  <Text style={styles.pdfText}>
                    {downloading === cert.cert_code ? t('common.loading') : t('gallery.downloadPdf')}
                  </Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, maxWidth: 720, alignSelf: 'center', width: '100%' },
  title: { fontSize: 22, fontWeight: '800', color: colors.dark },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, marginBottom: spacing.lg },
  empty: { padding: spacing.lg, backgroundColor: colors.white, borderRadius: radius.lg, alignItems: 'center' },
  emptyText: { color: colors.textMuted, marginBottom: 12 },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: colors.line },
  code: { fontSize: 16, fontWeight: '800', color: colors.green },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  row: { flexDirection: 'row', gap: 10, marginTop: 12 },
  linkBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#E6F3ED', alignItems: 'center' },
  linkText: { fontSize: 12, fontWeight: '700', color: colors.green },
  pdfBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: colors.dark, alignItems: 'center' },
  pdfText: { fontSize: 12, fontWeight: '700', color: colors.gold },
});
