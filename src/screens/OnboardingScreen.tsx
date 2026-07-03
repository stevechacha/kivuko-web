// screens/OnboardingScreen.tsx
// Registration (usajili) and login (ingia) — live API, no pre-filled demo data
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
import { api, ApiError } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding' | 'Login'>;

export default function OnboardingScreen({ navigation, route }: Props) {
  const initialMode = route.name === 'Login' ? 'login' : 'register';
  const { applySession } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation, 'landing');
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [college, setCollege] = useState('');
  const [institutionCode, setInstitutionCode] = useState('');
  const [region, setRegion] = useState('');
  const [side, setSide] = useState<'bara' | 'visiwani'>('bara');
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const finishSession = (message?: string) => {
    setSuccessMessage(message ?? (mode === 'login' ? t('onboarding.loginSuccess') : t('onboarding.welcome')));
    setSubmitted(true);
    setTimeout(() => {
      navigation.navigate('HubDashboard');
    }, 1200);
  };

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !region.trim()) {
      setError(t('onboarding.errRequired'));
      return;
    }
    if (!acceptedTerms) {
      setError(t('onboarding.errConsent'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name: name.trim(),
        phone: phone.trim(),
        college: college.trim(),
        home_area: region.trim(),
        region: side,
        institution_code: institutionCode.trim() || undefined,
        accepted_terms: acceptedTerms,
      });
      applySession(res);
      finishSession(res.message);
    } catch (e) {
      if (e instanceof ApiError && e.loginRequired) {
        setError(e.message);
        setMode('login');
      } else {
        setError(e instanceof Error ? e.message : t('onboarding.errRegister'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      setError(t('onboarding.errPhone'));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(phone.trim());
      applySession(res);
      finishSession(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('onboarding.errLogin'));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'login') {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={1} showBack onBack={goBack} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <Text style={styles.eyebrow}>
            {mode === 'login' ? t('onboarding.eyebrowLogin') : t('onboarding.eyebrowRegister')}
          </Text>
          <Text style={styles.title}>
            {mode === 'login' ? t('onboarding.titleLogin') : t('onboarding.titleRegister')}
          </Text>
          <Text style={styles.subtitle}>
            {mode === 'login' ? t('onboarding.subLogin') : t('onboarding.subRegister')}
          </Text>

          <View style={styles.modeRow}>
            <ModeTab
              label={t('onboarding.tabRegister')}
              active={mode === 'register'}
              onPress={() => {
                setMode('register');
                setError(null);
              }}
            />
            <ModeTab
              label={t('onboarding.tabLogin')}
              active={mode === 'login'}
              onPress={() => {
                setMode('login');
                setError(null);
              }}
            />
          </View>

          <View style={styles.formBody}>
            {mode === 'register' && (
              <>
                <Field label={t('onboarding.fullName')} value={name} onChangeText={setName} placeholder={t('onboarding.phName')} />
                <Field
                  label={t('onboarding.college')}
                  value={college}
                  onChangeText={setCollege}
                  placeholder={t('onboarding.phCollege')}
                />
                <Field
                  label={t('onboarding.institutionCode')}
                  value={institutionCode}
                  onChangeText={setInstitutionCode}
                  placeholder="UDSM2026"
                />
                <Text style={styles.hint}>{t('onboarding.institutionHint')}</Text>
              </>
            )}
            <Field
              label={t('onboarding.phone')}
              value={phone}
              onChangeText={setPhone}
              placeholder={t('onboarding.phPhone')}
              keyboardType="phone-pad"
            />
            {mode === 'register' && (
              <>
                <Field label={t('onboarding.region')} value={region} onChangeText={setRegion} placeholder={t('onboarding.phRegion')} />
                <Text style={styles.fieldLabel}>{t('onboarding.chooseRegion')}</Text>
                <View style={styles.regionRow}>
                  <RegionOption
                    title={t('onboarding.baraTitle')}
                    subtitle={t('onboarding.baraSub')}
                    selected={side === 'bara'}
                    accent={colors.green}
                    selectedBg="#F0FAF8"
                    onPress={() => setSide('bara')}
                  />
                  <RegionOption
                    title={t('onboarding.visiwaniTitle')}
                    subtitle={t('onboarding.visiwaniSub')}
                    selected={side === 'visiwani'}
                    accent={colors.blue}
                    selectedBg="#F0F7FC"
                    onPress={() => setSide('visiwani')}
                  />
                </View>
                <Pressable style={styles.consentRow} onPress={() => setAcceptedTerms((v) => !v)}>
                  <View style={[styles.consentBox, acceptedTerms && styles.consentBoxChecked]}>
                    {acceptedTerms && <Text style={styles.consentTick}>✓</Text>}
                  </View>
                  <Text style={styles.consentText}>{t('onboarding.consent')}</Text>
                </Pressable>
              </>
            )}
          </View>

          {submitted && successMessage && (
            <View style={styles.welcomeBanner}>
              <Text style={{ fontSize: 26 }}>🎉</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.welcomeTitle}>{successMessage}</Text>
                <Text style={styles.welcomeBody}>{t('onboarding.redirecting')}</Text>
              </View>
            </View>
          )}

          {error && <Text style={styles.errorText}>{error}</Text>}

          <View style={styles.ctaRow}>
            {loading ? (
              <ActivityIndicator color={colors.green} />
            ) : (
              <Button
                label={submitted ? t('common.success') : mode === 'login' ? t('onboarding.loginCta') : t('onboarding.registerCta')}
                onPress={handleSubmit}
                disabled={submitted}
              />
            )}
            <Button label={t('common.home')} variant="ghost" onPress={() => navigation.navigate('Landing')} />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ModeTab(props: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[styles.modeTab, props.active && styles.modeTabActive]}
    >
      <Text style={[styles.modeTabText, props.active && styles.modeTabTextActive]}>{props.label}</Text>
    </Pressable>
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
        autoComplete="off"
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
  subtitle: { fontSize: 14, color: colors.textMuted, marginTop: 6, lineHeight: 20 },
  modeRow: {
    flexDirection: 'row',
    marginTop: 20,
    backgroundColor: '#F4F7F6',
    borderRadius: 10,
    padding: 4,
    gap: 4,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  modeTabActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  modeTabText: { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  modeTabTextActive: { color: colors.greenDeep },
  formBody: { marginTop: 24 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '700', color: '#2C3E50', marginBottom: 7 },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: -6, marginBottom: 10 },
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
  consentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 4 },
  consentBox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  consentBoxChecked: { backgroundColor: colors.green, borderColor: colors.green },
  consentTick: { color: colors.white, fontSize: 12, fontWeight: '800' },
  consentText: { flex: 1, fontSize: 12, color: colors.textMuted, lineHeight: 18 },
});
