// screens/OnboardingScreen.tsx
// Step 1 of 5 — User Registration (design: screen-register)
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
  Platform,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
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
      }, 1400);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Usajili umeshindwa. Jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={1} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>Hatua 1 ya 5 — Usajili</Text>
          <Text style={styles.title}>Jisajili kuwa Mzalendo</Text>
          <Text style={styles.subtitle}>
            Taarifa hizi zitatumika kukuoanisha na rafiki wa Kivuko.
          </Text>

          <View style={styles.formBody}>
            <Field label="Jina Kamili" value={name} onChangeText={setName} placeholder="mfano: Amina Juma" />
            <Field label="Namba ya Simu" value={phone} onChangeText={setPhone} placeholder="07xx xxx xxx" keyboardType="phone-pad" />
            <Field label="Chuo / Chuo Kikuu" value={college} onChangeText={setCollege} placeholder="mfano: Chuo Kikuu cha Dar es Salaam" />
            <Field label="Mkoa / Eneo" value={region} onChangeText={setRegion} placeholder="mfano: Dodoma" />

            <Text style={styles.fieldLabel}>Chagua Eneo Lako</Text>
            <View style={styles.regionRow}>
              <RegionOption
                title="🏔️ Bara"
                subtitle="Tanzania Mainland"
                selected={side === 'bara'}
                accent={colors.green}
                selectedBg="#F0FAF8"
                onPress={() => setSide('bara')}
              />
              <RegionOption
                title="🌊 Visiwani"
                subtitle="Zanzibar Isles"
                selected={side === 'visiwani'}
                accent={colors.blue}
                selectedBg="#F0F7FC"
                onPress={() => setSide('visiwani')}
              />
            </View>
          </View>

          {submitted && (
            <View style={styles.welcomeBanner}>
              <Text style={{ fontSize: 26 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeTitle}>Karibu, Mzalendo!</Text>
                <Text style={styles.welcomeBody}>
                  Usajili wako umefanikiwa. Tuko tayari kukutafutia rafiki wa Kivuko.
                </Text>
              </View>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.ctaRow}>
            {loading ? (
              <ActivityIndicator color={colors.green} />
            ) : (
              <Button
                label={submitted ? 'Umesajiliwa ✓' : 'Jisajili →'}
                onPress={handleSubmit}
                disabled={submitted}
              />
            )}
            <Button label="Rudi Nyuma" variant="ghost" onPress={() => navigation.navigate('Landing')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field(props: {
  label: string;
  value: string;
  placeholder?: string;
  onChangeText: (t: string) => void;
  keyboardType?: 'default' | 'phone-pad';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        style={styles.input}
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor="#9AA5A3"
        keyboardType={props.keyboardType ?? 'default'}
      />
    </View>
  );
}

function RegionOption(props: {
  title: string;
  subtitle: string;
  selected: boolean;
  accent: string;
  selectedBg: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.regionOpt,
        props.selected && {
          borderColor: props.accent,
          backgroundColor: props.selectedBg,
        },
      ]}
    >
      <Text style={styles.regionTitle}>{props.title}</Text>
      <Text style={styles.regionSubtitle}>{props.subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: {
    padding: spacing.lg,
    paddingBottom: 60,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 560,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.lg,
    padding: Platform.OS === 'web' ? 34 : 22,
    marginTop: spacing.lg,
  },
  eyebrow: {
    fontSize: 12.5,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
    fontWeight: '700',
    color: colors.greenDeep,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: colors.dark,
    marginTop: 8,
    fontFamily: Platform.OS === 'web' ? 'Georgia, serif' : undefined,
  },
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6 },
  formBody: { marginTop: 24 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#2C3E50', marginBottom: 7 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.line,
    borderRadius: 10,
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
    gap: 6,
  },
  regionTitle: { fontWeight: '700', fontSize: 14.5, color: colors.dark },
  regionSubtitle: { fontSize: 12, color: colors.textMuted },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 20,
    backgroundColor: colors.green,
    borderRadius: radius.md,
    padding: 18,
  },
  welcomeTitle: { color: colors.white, fontWeight: '800', fontSize: 15 },
  welcomeBody: { color: colors.white, fontSize: 13, opacity: 0.92, marginTop: 2 },
  errorText: { color: colors.danger, fontSize: 13, marginTop: spacing.md },
  ctaRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 24, gap: 4 },
});
