// OmnichannelScreen — WhatsApp + USSD vision (proposal omnichannel layer)
import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';

type Props = NativeStackScreenProps<RootStackParamList, 'Omnichannel'>;

const CHANNELS = [
  {
    icon: '📱',
    title: 'Programu ya Wavuti (PWA)',
    desc: 'Uzoefu kamili: uoanishaji, dhamira, cheti, na ramani — kwenye kivinjari cha simu yoyote.',
    status: 'Hai Sasa',
    color: colors.green,
  },
  {
    icon: '💬',
    title: 'WhatsApp Learning Bot',
    desc: 'Maswali ya haraka, masomo mafupi, na arifa za tuzo — bila kupakua programu.',
    status: 'Inakuja Hivi Karibuni',
    color: colors.blue,
    demo: [
      { from: 'bot', text: 'Habari Mzalendo! 🌊 Jaribu la leo: Muungano ulianzishwa tarehe gani?' },
      { from: 'user', text: '26 Aprili 1964' },
      { from: 'bot', text: 'Sahihi! 🎉 +10 Pointi za Uzalendo. Endelea kujibu maswali 3 zaidi upate vocha.' },
    ],
  },
  {
    icon: '📞',
    title: 'USSD *150*64#',
    desc: 'Vijana wenye simu za kawaida wanapata maswali ya uzalendo bila intaneti.',
    status: 'Inakuja Hivi Karibuni',
    color: colors.gold,
    ussd: [
      'Karibu Kivuko la Muungano',
      '1. Chemsha Bongo',
      '2. Sauti za Wazee',
      '3. Pointi zangu',
    ],
  },
];

export default function OmnichannelScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>Omnichannel Access</Text>
        <Text style={styles.title}>Kila Kijana, Kila Kifaa</Text>
        <Text style={styles.sub}>
          Hakuna kijana atacheleweke — mfumo mmoja, njia tatu za kufikia: Wavuti, WhatsApp, na USSD.
        </Text>

        {CHANNELS.map((ch) => (
          <View key={ch.title} style={styles.card}>
            <View style={styles.cardHead}>
              <Text style={{ fontSize: 28 }}>{ch.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{ch.title}</Text>
                <View style={[styles.statusPill, { backgroundColor: `${ch.color}22` }]}>
                  <Text style={[styles.statusText, { color: ch.color }]}>{ch.status}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cardDesc}>{ch.desc}</Text>

            {ch.demo?.map((m, i) => (
              <View key={i} style={[styles.bubble, m.from === 'user' ? styles.bubbleUser : styles.bubbleBot]}>
                <Text style={styles.bubbleText}>{m.text}</Text>
              </View>
            ))}

            {ch.ussd?.map((line, i) => (
              <Text key={i} style={styles.ussdLine}>{line}</Text>
            ))}
          </View>
        ))}

        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Button label="Rudi Dashibodi" variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 720, alignSelf: 'center', width: '100%' },
  eyebrow: { fontSize: 11, fontWeight: '800', color: colors.greenDeep, textTransform: 'uppercase', letterSpacing: 1.5 },
  title: { fontSize: 24, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: spacing.lg },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, padding: spacing.lg, marginBottom: 14, borderWidth: 1, borderColor: colors.line },
  cardHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.dark },
  statusPill: { alignSelf: 'flex-start', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 10 },
  bubble: { borderRadius: 12, padding: 10, marginTop: 6, maxWidth: '90%' },
  bubbleBot: { alignSelf: 'flex-start', backgroundColor: '#EAF2F7' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.green },
  bubbleText: { fontSize: 12, color: colors.dark },
  ussdLine: { fontFamily: 'monospace', fontSize: 12, color: colors.dark, backgroundColor: '#F4F4F4', padding: 6, marginTop: 4, borderRadius: 4 },
});
