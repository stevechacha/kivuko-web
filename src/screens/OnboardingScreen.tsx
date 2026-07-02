// screens/OnboardingScreen.tsx
// Step 1 of 5 — User Registration & Onboarding
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import ScreenHeader from '../components/ScreenHeader';
import BridgeIllustration from '../components/BridgeIllustration';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export default function OnboardingScreen({ navigation }: Props) {
  const { setParticipant } = useSession();
  const [name, setName] = useState('Amina Juma');
  const [phone, setPhone] = useState('0755 123 456');
  const [college, setCollege] = useState('Chuo Kikuu cha Dodoma');
  const [region, setRegion] = useState('Dodoma');
  const [side, setSide] = useState<'bara' | 'visiwani'>('bara');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name,
        phone,
        college,
        home_area: region,
        region: side,
      });
      setParticipant(res.participant);
      setSubmitted(true);
      setTimeout(() => {
        navigation.navigate('Matching', { name, region: side });
      }, 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Usajili umeshindwa. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.heroWrap}>
          <BridgeIllustration width={320} height={200} />
        </View>

        <ScreenHeader
          stepLabel="Hatua 1 ya 5 — Usajili"
          title="Jisajili kuwa Mzalendo"
          subtitle="Taarifa hizi zitatumika kukuoanisha na rafiki wa Kivuko kutoka upande mwingine."
        />

        <Field label="Jina Kamili" value={name} onChangeText={setName} />
        <Field label="Namba ya Simu" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <Field label="Chuo / Chuo Kikuu" value={college} onChangeText={setCollege} />
        <Field label="Mkoa / Eneo" value={region} onChangeText={setRegion} />

        <Text style={styles.fieldLabel}>Chagua Eneo Lako</Text>
        <View style={styles.regionRow}>
          <RegionOption
            title="🏔️ Bara"
            subtitle="Tanzania Mainland"
            selected={side === 'bara'}
            accent={colors.green}
            onPress={() => setSide('bara')}
          />
          <RegionOption
            title="🌊 Visiwani"
            subtitle="Zanzibar Isles"
            selected={side === 'visiwani'}
            accent={colors.blue}
            onPress={() => setSide('visiwani')}
          />
        </View>

        {submitted && (
          <View style={styles.welcomeBanner}>
            <Text style={{ fontSize: 24 }}>🎉</Text>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.welcomeTitle}>Karibu, Mzalendo!</Text>
              <Text style={styles.welcomeBody}>
                Usajili wako umefanikiwa. Tunakutafutia rafiki wa Kivuko…
              </Text>
            </View>
          </View>
        )}

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <View style={{ marginTop: spacing.lg, flexDirection: 'row', flexWrap: 'wrap' }}>
          {loading ? (
            <ActivityIndicator color={colors.green} />
          ) : (
            <Button label={submitted ? 'Umesajiliwa ✓' : 'Jisajili →'} onPress={handleSubmit} disabled={submitted} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={{ marginBottom: spacing.md }}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType ?? 'default'}
        placeholderTextColor="#9AA5A3"
      />
    </View>
  );
}

function RegionOption(props: {
  title: string;
  subtitle: string;
  selected: boolean;
  accent: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.regionOpt,
        props.selected && { borderColor: props.accent, backgroundColor: '#F0FAF8' },
      ]}
    >
      <Text style={styles.regionTitle}>{props.title}</Text>
      <Text style={styles.regionSubtitle}>{props.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60 },
  heroWrap: { alignItems: 'center', marginBottom: spacing.md },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#2C3E50', marginBottom: 7 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    backgroundColor: '#FBFCFC',
    color: colors.dark,
  },
  regionRow: { flexDirection: 'row', gap: 12 },
  regionOpt: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: 16,
  },
  regionTitle: { fontWeight: '700', fontSize: 14.5, color: colors.dark },
  regionSubtitle: { fontSize: 12, color: colors.textMuted, marginTop: 4 },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    borderRadius: radius.md,
    padding: 16,
    marginTop: spacing.lg,
  },
  welcomeTitle: { color: colors.white, fontWeight: '800', fontSize: 15 },
  welcomeBody: { color: colors.white, fontSize: 12.5, opacity: 0.92, marginTop: 2 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
});
