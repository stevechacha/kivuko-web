// screens/OnboardingScreen.tsx
import React, { useState, useRef } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import Button from '../components/Button';
import TopNav from '../components/TopNav';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';
import { useAppBack } from '../navigation/useAppBack';

// Rangi za Uzalendo (Bendera ya Tanzania 🇹🇿)
const tzColors = {
  green: '#1EB960',      // Kijani ya bendera
  gold: '#FCD116',       // Dhahabu/Njano ya bendera
  black: '#000000',      // Nyeusi ya bendera
  blue: '#00A3E0',       // Bluu ya bendera
  bg: '#F9FBF9',         // Background laini
  white: '#FFFFFF',
  line: '#E2E8F0',
  textMuted: '#64748B',
  danger: '#EF4444'
};

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding' | 'Login'>;

export default function OnboardingScreen({ navigation, route }: Props) {
  const initialMode = route.name === 'Login' ? 'login' : 'register';
  const { applySession } = useSession();
  const { t } = useLocale();
  const goBack = useAppBack(navigation, 'landing');
  const [mode, setMode] = useState<'register' | 'login'>(initialMode);

  // Form States mpya za Watu Wote
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [group, setGroup] = useState(''); // Kundi/Shughuli
  const [region, setRegion] = useState(''); // Mkoa uliochaguliwa

  // Modals (kwa ajili ya orodha ya makundi na mikoa)
  const [groupModalVisible, setGroupModalVisible] = useState(false);
  const [regionModalVisible, setRegionModalVisible] = useState(false);
  
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  // Orodha ya Makundi (Shughuli)
  const categories = [
    'Mwanafunzi wa Chuo',
    'Bodaboda',
    'Mjasiriamali',
    'Mama Lishe',
    'Mfanyabiashara',
    'Mwanafunzi wa Sekondari',
    'Winga',
    'Mkulima',
    'Mwalimu'
  ];

  // Orodha ya Mikoa
  const regions = [
    'Arusha',
    'Unguja Kaskazini',
    'Unguja Kusini',
    'Pemba Kaskazini',
    'Pemba Kusini',
    'Morogoro',
    'Dodoma',
    'Dar es Salaam',
    'Arusha',
    'Mwanza'
  ];

  const finishSession = (message?: string) => {
    setSuccessMessage(message ?? (mode === 'login' ? 'Karibu Tena!' : 'Usajili Umekamilika kwa Mafanikio!'));
    setSubmitted(true);
    setTimeout(() => {
      navigation.navigate('HubDashboard');
    }, 1200);
  };

  const handleRegister = async () => {
    if (!name.trim() || !phone.trim() || !group || !region) {
      setError('Tafadhali jaza sehemu zote muhimu.');
      return;
    }
    if (!acceptedTerms) {
      setError('Ni lazima ukubali masharti ili kuendelea.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.register({
        name: name.trim(),
        phone: phone.trim(),
        college: group, // Tunatuma kundi kwenye field ya college ili isivunje API ya nyuma
        home_area: region,
        region: region.toLowerCase().includes('pemba') || region.toLowerCase().includes('unguja') || region.toLowerCase().includes('zanzibar') ? 'visiwani' : 'bara',
        accepted_terms: acceptedTerms,
      });
      applySession(res);
      finishSession(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Itifaki imefeli, jaribu tena.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!phone.trim()) {
      setError('Tafadhali weka namba yako ya simu.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.login(phone.trim());
      applySession(res);
      finishSession(res.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Uingiaji umefeli.');
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
      {/* Utepe wa Uzalendo wa Juu (Bendera) */}
      <View style={styles.flagRibbon}>
        <View style={[styles.flagStrip, { backgroundColor: tzColors.green }]} />
        <View style={[styles.flagStrip, { backgroundColor: tzColors.gold, height: 4 }]} />
        <View style={[styles.flagStrip, { backgroundColor: tzColors.black, height: 8 }]} />
        <View style={[styles.flagStrip, { backgroundColor: tzColors.gold, height: 4 }]} />
        <View style={[styles.flagStrip, { backgroundColor: tzColors.blue }]} />
      </View>

      <TopNav currentStep={1} showBack onBack={goBack} />
      
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          
          {/* Nembo na Kauli Mbiu ya Kizalendo */}
          <View style={styles.patriotHeader}>
            <Text style={styles.flagIcon}>🇹🇿</Text>
            <Text style={styles.patriotTitle}>
              {mode === 'register' ? 'JISAJILI KUWEZA KUINGIA KWENYE MFUMO' : 'INGIA KWENYE MFUMO'}
            </Text>
            <Text style={styles.patriotSub}>
              Fomu Jumuishi ya Watanzania Wote — Muungano Imara wa Bara na Visiwani
            </Text>
          </View>

          {/* Sehemu ya kubadili kati ya Jisajili na Ingia */}
          <View style={styles.modeRow}>
            <Pressable
              onPress={() => { setMode('register'); setError(null); }}
              style={[styles.modeTab, mode === 'register' && styles.modeTabActiveRegister]}
            >
              <Text style={[styles.modeTabText, mode === 'register' && styles.modeTabTextActive]}>Jisajili</Text>
            </Pressable>
            <Pressable
              onPress={() => { setMode('login'); setError(null); }}
              style={[styles.modeTab, mode === 'login' && styles.modeTabActiveLogin]}
            >
              <Text style={[styles.modeTabText, mode === 'login' && styles.modeTabTextActive]}>Ingia</Text>
            </Pressable>
          </View>

          {/* Fomu Yenyewe */}
          <View style={styles.formBody}>
            {mode === 'register' && (
              <>
                {/* Jina Kamili */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Jina Kamili</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Mzalendo Halisi"
                    placeholderTextColor="#9AA5A3"
                  />
                </View>

                {/* Chagua Kundi / Shughuli (Dropdown Button) */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Chagua Kundi au Shughuli Unayoifanya</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setGroupModalVisible(true)}>
                    <Text style={[styles.dropdownText, !group && { color: '#9AA5A3' }]}>
                      {group || 'Gusa hapa kuchagua kundi lako...'}
                    </Text>
                    <Text style={styles.arrowIcon}>▼</Text>
                  </Pressable>
                </View>
              </>
            )}
            
            {/* Namba ya Simu */}
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Namba ya Simu</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Mfano: 07XXXXXXXX"
                placeholderTextColor="#9AA5A3"
                keyboardType="phone-pad"
              />
            </View>
            
            {mode === 'register' && (
              <>
                {/* Chagua Mkoa (Dropdown Button) */}
                <View style={styles.field}>
                  <Text style={styles.fieldLabel}>Mkoa / Eneo Unapoishi</Text>
                  <Pressable style={styles.dropdownInput} onPress={() => setRegionModalVisible(true)}>
                    <Text style={[styles.dropdownText, !region && { color: '#9AA5A3' }]}>
                      {region || 'Gusa hapa kuchagua mkoa wako...'}
                    </Text>
                    <Text style={styles.arrowIcon}>▼</Text>
                  </Pressable>
                </View>

                {/* Ridhaa / Consent */}
                <Pressable style={styles.consentRow} onPress={() => setAcceptedTerms((v) => !v)}>
                  <View style={[styles.consentBox, acceptedTerms && styles.consentBoxChecked]}>
                    {acceptedTerms && <Text style={styles.consentTick}>✓</Text>}
                  </View>
                  <Text style={styles.consentText}>
                    Nakubali kuoanishwa na mzalendo mwenzangu, masharti ya matumizi, na kuwa maudhui yanaweza kukaguliwa kwa usalama (Consent-Based Publishing).
                  </Text>
                </Pressable>
              </>
            )}
          </View>

          {error && <Text style={styles.errorText}>{error}</Text>}

          {/* Vifungo vya Chini */}
          <View style={styles.ctaRow}>
            {loading ? (
              <ActivityIndicator color={tzColors.green} size="large" style={{ marginVertical: 10 }} />
            ) : (
              <Pressable
                style={[styles.submitButton, submitted && { opacity: 0.6 }]}
                onPress={handleSubmit}
                disabled={submitted}
              >
                <Text style={styles.submitButtonText}>
                  {submitted ? 'Imekamilika' : mode === 'login' ? 'Ingia Mzalendo →' : 'Jisajili Sasa 🇹🇿'}
                </Text>
              </Pressable>
            )}
            
            <Pressable style={styles.ghostButton} onPress={() => navigation.navigate('Landing')}>
              <Text style={styles.ghostButtonText}>Rudi Nyumbani</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* MODAL YA KUCHAGUA MAKUNDI */}
      <Modal visible={groupModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chagua Kundi Lako</Text>
            <FlatList
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setGroup(item);
                    setGroupModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.modalCloseButton} onPress={() => setGroupModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Funga</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* MODAL YA KUCHAGUA MIKOA */}
      <Modal visible={regionModalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chagua Mkoa Wako</Text>
            <FlatList
              data={regions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.modalItem}
                  onPress={() => {
                    setRegion(item);
                    setRegionModalVisible(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{item}</Text>
                </Pressable>
              )}
            />
            <Pressable style={styles.modalCloseButton} onPress={() => setRegionModalVisible(false)}>
              <Text style={styles.modalCloseButtonText}>Funga</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: tzColors.bg },
  flagRibbon: { width: '100%', flexDirection: 'column' },
  flagStrip: { height: 6, width: '100%' },
  scroll: {
    padding: 16,
    paddingBottom: 60,
    width: '100%',
    maxWidth: 550,
    alignSelf: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: tzColors.white,
    borderWidth: 2,
    borderColor: tzColors.gold, // Mstari wa dhahabu kuashiria thamani na uzalendo
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
    marginTop: 10,
  },
  patriotHeader: { alignItems: 'center', marginBottom: 20 },
  flagIcon: { fontSize: 36, marginBottom: 5 },
  patriotTitle: { fontSize: 22, fontWeight: '900', color: tzColors.black, textAlign: 'center', letterSpacing: 0.5 },
  patriotSub: { fontSize: 13, color: tzColors.textMuted, textAlign: 'center', marginTop: 6, lineHeight: 18 },
  
  modeRow: {
    flexDirection: 'row',
    backgroundColor: '#e2fdb7',
    borderRadius: 12,
    padding: 4,
    gap: 4,
    marginBottom: 20
  },
  modeTab: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modeTabActiveRegister: { backgroundColor: tzColors.green },
  modeTabActiveLogin: { backgroundColor: tzColors.blue },
  modeTabText: { fontSize: 15, fontWeight: '700', color: tzColors.textMuted },
  modeTabTextActive: { color: tzColors.white },
  
  formBody: { width: '100%' },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 14, fontWeight: '700', color: '#1E293B', marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: tzColors.line,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
    color: tzColors.black,
  },
  dropdownInput: {
    borderWidth: 1.5,
    borderColor: tzColors.line,
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: { fontSize: 15, color: tzColors.black, flex: 1 },
  arrowIcon: { fontSize: 12, color: tzColors.textMuted },
  
  consentRow: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginTop: 8 },
  consentBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: tzColors.line,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  consentBoxChecked: { backgroundColor: tzColors.green, borderColor: tzColors.green },
  consentTick: { color: tzColors.white, fontSize: 13, fontWeight: '900' },
  consentText: { flex: 1, fontSize: 12.5, color: tzColors.textMuted, lineHeight: 18 },
  
  errorText: { color: tzColors.danger, fontSize: 13, marginTop: 10, fontWeight: '600', textAlign: 'center' },
  
  ctaRow: { marginTop: 24, gap: 12 },
  submitButton: {
    backgroundColor: tzColors.black, // Kitufe kikuu cheusi chenye maandishi ya dhahabu/kijani mng'ao
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: tzColors.gold,
  },
  submitButtonText: { color: tzColors.gold, fontSize: 16, fontWeight: '800', letterSpacing: 0.5 },
  ghostButton: { paddingVertical: 12, alignItems: 'center' },
  ghostButtonText: { color: tzColors.textMuted, fontSize: 14, fontWeight: '600' },

  // Mfumo wa Modal (Dropdown Custom)
  modalContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: tzColors.white, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, maxHeight: '70%' },
  modalTitle: { fontSize: 18, fontWeight: '800', color: tzColors.black, marginBottom: 15, textAlign: 'center' },
  modalItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: tzColors.line },
  modalItemText: { fontSize: 16, color: tzColors.black, fontWeight: '500' },
  modalCloseButton: { marginTop: 15, backgroundColor: tzColors.danger, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },

  modalCloseButtonText: { color: tzColors.white, fontWeight: '700', fontSize: 16 },

});

