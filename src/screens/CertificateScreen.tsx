// screens/CertificateScreen.tsx
// Step 4 of 5 — The Verifiable CV Certificate (QR Code)
import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useCleanWebUrl } from '../navigation/useCleanWebUrl';

type Props = NativeStackScreenProps<RootStackParamList, 'Certificate'>;

export default function CertificateScreen({ navigation }: Props) {
  useCleanWebUrl();
  const { participant, missionId } = useSession();
  const userName = participant?.name || 'Mzalendo';
  const [generated, setGenerated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [certCode, setCertCode] = useState('');
  const [certDate, setCertDate] = useState('');
  const [verifyUrl, setVerifyUrl] = useState('');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!missionId) {
      setError('Hakuna dhamira iliyopatikana. Kamilisha dhamira kwanza.');
      return;
    }
    if (!participant?.session_token) {
      setError('Kipindi kimeisha. Tafadhali jisajili tena.');
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Imeshindwa kutengeneza cheti.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ScreenHeader stepLabel="Hatua 4 ya 5 — Cheti Kinachothibitishwa" title="" />

        {!generated ? (
          <View style={{ alignItems: 'center', marginTop: spacing.lg }}>
            <Text style={styles.promptText}>
              Umepata sifa za kutosha kupata Cheti chako rasmi cha Balozi wa Muungano — chenye QR
              Code inayoweza kuwekwa kwenye CV yako.
            </Text>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <View style={{ marginTop: spacing.lg }}>
              {loading ? (
                <ActivityIndicator color={colors.green} />
              ) : (
                <Button label="Tengeneza Cheti →" onPress={handleGenerate} />
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
              <Text style={[styles.eyebrowCentered]}>Jamhuri ya Muungano wa Tanzania</Text>
              <Text style={styles.certHeading}>Cheti cha Ubalozi wa Muungano</Text>
              <Text style={styles.certName}>{userName}</Text>
              <Text style={styles.certSub}>
                Ametambuliwa rasmi kama Balozi wa Muungano kwa kukamilisha Dhamira ya Pamoja ya
                kwanza akiwa ameoanishwa na kijana kutoka Visiwani, akijenga kivuko la kweli la
                umoja wa kitaifa.
              </Text>

              <View style={styles.certFooter}>
                <View>
                  <Text style={styles.certSignName}>Kivuko la Muungano Hub</Text>
                  <Text style={styles.certSignMeta}>Tarehe: {certDate}</Text>
                  <Text style={styles.certSignMeta}>Nambari ya Cheti: {certCode}</Text>
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

            <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
              <Button
                label="Angalia Ramani Hai ya Muungano →"
                variant="secondary"
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
