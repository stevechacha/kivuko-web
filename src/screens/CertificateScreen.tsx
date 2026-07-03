// screens/CertificateScreen.tsx
// Step 4 of 5 — The Verifiable CV Certificate (QR Code)
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image, Platform, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import ScreenHeader from '../components/ScreenHeader';
import CelebrationOverlay from '../components/CelebrationOverlay';
import PeerRatingCard from '../components/PeerRatingCard';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useCleanWebUrl } from '../navigation/useCleanWebUrl';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'Certificate'>;

export default function CertificateScreen({ navigation }: Props) {
  useCleanWebUrl();
  const goBack = useAppBack(navigation);
  const { participant, missionId } = useSession();
  const { t } = useLocale();
  const userName = participant?.name || 'Mzalendo';
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certCode, setCertCode] = useState('');
  const [certDate, setCertDate] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const downloadPdf = async () => {
    if (!certCode || !participant?.session_token) return;
    setPdfLoading(true);
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
    } catch (e) {
      setError(e instanceof Error ? e.message : t('gallery.downloadPdf'));
    } finally {
      setPdfLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!missionId) {
      setError(t('certificate.errMission'));
      return;
    }
    if (!participant?.session_token) {
      setError(t('certificate.errSession'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const cert = await api.generateCertificate(missionId, participant.session_token);
      setCertCode(cert.cert_code);
      setCertDate(cert.issued_date);
      setVerifyUrl(cert.verify_url);
      setQrDataUrl(cert.qr_data_url ?? '');
      setGenerated(true);
      setCelebrate(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('certificate.errGenerate'));
    } finally {
      setLoading(false);
    }
  };

  const copyVerifyLink = () => {
    if (!verifyUrl) return;
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(verifyUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }
    Alert.alert(t('certificate.alertTitle'), verifyUrl);
  };

  const openVerify = () => {
    if (verifyUrl && Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(verifyUrl, '_blank');
    }
  };

  const shareCertificate = async () => {
    if (!verifyUrl) return;
    const text = t('certificate.shareText', { url: verifyUrl });
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: t('certificate.shareTitle'),
          text,
          url: verifyUrl,
        });
        return;
      } catch {
        // fall through to copy
      }
    }
    copyVerifyLink();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={4} showPoints showBack onBack={goBack} />
      <CelebrationOverlay
        visible={celebrate}
        title={t('certificate.celebrateTitle')}
        subtitle={t('certificate.celebrateSub', { name: userName })}
        onDone={() => setCelebrate(false)}
      />
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader stepLabel={t('certificate.stepLabel')} title="" />

        {!generated ? (
          <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
            <Text style={styles.promptText}>{t('certificate.prompt')}</Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={{ marginTop: spacing.lg }}>
              {loading ? (
                <ActivityIndicator color={colors.green} />
              ) : (
                <Button label={t('certificate.generate')} onPress={handleGenerate} />
              )}
            </View>
          </View>
        ) : (
          <>
            <View style={styles.certFrame}>
              <View style={styles.certInnerBorder} pointerEvents="none" />
              <View style={styles.crest}>
                <Text style={{ color: colors.white, fontWeight: '700' }}>KV</Text>
              </View>
              <Text style={[styles.eyebrowCentered]}>{t('certificate.republic')}</Text>
              <Text style={styles.certHeading}>{t('certificate.heading')}</Text>
              <Text style={styles.certName}>{userName}</Text>
              <Text style={styles.certSub}>{t('certificate.body')}</Text>

              <View style={styles.certFooter}>
                <View>
                  <Text style={styles.certSignName}>{t('certificate.issuer')}</Text>
                  <Text style={styles.certSignMeta}>{t('certificate.dateLabel', { date: certDate })}</Text>
                  <Text style={styles.certSignMeta}>{t('certificate.codeLabel', { code: certCode })}</Text>
                  {verifyUrl ? (
                    <Text style={styles.verifyLink} numberOfLines={2}>{verifyUrl}</Text>
                  ) : null}
                </View>
                <View style={styles.qrBox}>
                  {qrDataUrl ? (
                    <Image source={{ uri: qrDataUrl }} style={styles.qrImage} resizeMode="contain" />
                  ) : (
                    <Text style={styles.qrPlaceholder}>QR</Text>
                  )}
                </View>
              </View>
            </View>

            <PeerRatingCard />

            <View style={{ marginTop: spacing.md, alignItems: 'center', gap: 8 }}>
              <Button label={t('certificate.verify')} onPress={openVerify} />
              <Button
                label={copied ? t('certificate.copied') : t('certificate.copy')}
                variant="secondary"
                onPress={copyVerifyLink}
              />
              <Button label={t('certificate.share')} onPress={shareCertificate} />
              <Button
                label={pdfLoading ? t('common.loading') : t('gallery.downloadPdf')}
                variant="secondary"
                onPress={downloadPdf}
              />
              <Button
                label={t('pitch.certTitle')}
                variant="secondary"
                onPress={() => navigation.navigate('CertificateGallery')}
              />
              <Button
                label={t('certificate.viewMap')}
                variant="ghost"
                onPress={() => navigation.navigate('UnionMap')}
              />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  promptText: { fontSize: 14, color: colors.textMuted, textAlign: 'center', maxWidth: 320, lineHeight: 20 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: spacing.md, textAlign: 'center' },
  certFrame: {
    borderWidth: 2,
    borderColor: colors.green,
    borderRadius: radius.lg,
    padding: 26,
    backgroundColor: colors.white,
    marginTop: spacing.lg,
  },
  certInnerBorder: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderColor: colors.gold,
    borderRadius: 10,
  },
  crest: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.blue,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  eyebrowCentered: { fontSize: 11, fontWeight: '700', color: colors.greenDeep, textAlign: 'center', textTransform: 'uppercase' },
  certHeading: { fontSize: 20, fontWeight: '700', color: colors.dark, textAlign: 'center', marginTop: 6 },
  certName: { fontSize: 28, fontWeight: '700', color: colors.greenDeep, textAlign: 'center', marginTop: 16 },
  certSub: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 10, lineHeight: 19 },
  certFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 28 },
  certSignName: { fontSize: 14, fontWeight: '700', color: colors.dark },
  certSignMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  verifyLink: { fontSize: 9, color: colors.blue, marginTop: 4, maxWidth: 180 },
  qrBox: {
    width: 76,
    height: 76,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    padding: 4,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  qrImage: { width: 68, height: 68 },
  qrPlaceholder: { fontSize: 12, color: colors.textMuted },
});
