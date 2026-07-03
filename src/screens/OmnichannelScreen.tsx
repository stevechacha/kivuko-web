// OmnichannelScreen — live WhatsApp bot demo + USSD vision
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import UssdSimulator from '../components/UssdSimulator';
import WhatsAppChat from '../components/WhatsAppChat';
import { api, type ChatMessage } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Omnichannel'>;

const BOT_PEER = {
  name: 'Kivuko Bot',
  initials: 'KB',
  region_label: 'Muungano Hub',
  home_area: 'Tanzania',
};

function toMessage(from: 'me' | 'peer', text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    from_role: from,
    text,
    created_at: new Date().toISOString(),
  };
}

export default function OmnichannelScreen({ navigation }: Props) {
  const [waMessages, setWaMessages] = useState<ChatMessage[]>([]);
  const [waSending, setWaSending] = useState(false);
  const [waTyping, setWaTyping] = useState(false);
  const [showWaChat, setShowWaChat] = useState(false);

  useEffect(() => {
    if (!showWaChat || waMessages.length > 0) return;
    setWaTyping(true);
    api
      .whatsappBot('')
      .then((res) => {
        setWaMessages([toMessage('peer', res.reply)]);
      })
      .catch(() => {
        setWaMessages([
          toMessage(
            'peer',
            'Habari Mzalendo! 🌊 Andika *MUUNGANO* kuanza jaribio la historia ya taifa.',
          ),
        ]);
      })
      .finally(() => setWaTyping(false));
  }, [showWaChat, waMessages.length]);

  const sendWhatsApp = async (text: string) => {
    setWaSending(true);
    setWaMessages((prev) => [...prev, toMessage('me', text)]);
    setWaTyping(true);
    try {
      const res = await api.whatsappBot(text);
      setTimeout(() => {
        setWaMessages((prev) => [...prev, toMessage('peer', res.reply)]);
        setWaTyping(false);
      }, 900);
    } catch {
      setWaTyping(false);
    } finally {
      setWaSending(false);
    }
  };

  if (showWaChat) {
    return (
      <SafeAreaView style={styles.safeWa}>
        <WhatsAppChat
          messages={waMessages}
          peerName={BOT_PEER.name}
          peerInitials={BOT_PEER.initials}
          peerRegionLabel={BOT_PEER.region_label}
          peerHomeArea={BOT_PEER.home_area}
          headerSubtitle="WhatsApp Business · hai sasa"
          placeholder="Andika ujumbe…"
          sending={waSending}
          peerTyping={waTyping}
          onSend={sendWhatsApp}
          onBack={() => setShowWaChat(false)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>Omnichannel Access</Text>
        <Text style={styles.title}>Kila Kijana, Kila Kifaa</Text>
        <Text style={styles.sub}>
          Hakuna kijana atacheleweke — mfumo mmoja, njia tatu za kufikia: Wavuti, WhatsApp, na USSD.
        </Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={{ fontSize: 28 }}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Programu ya Wavuti (PWA)</Text>
              <View style={[styles.statusPill, { backgroundColor: `${colors.green}22` }]}>
                <Text style={[styles.statusText, { color: colors.green }]}>Hai Sasa</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Uzoefu kamili: uoanishaji, dhamira, cheti, na ramani — kwenye kivinjari cha simu yoyote.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={{ fontSize: 28 }}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>WhatsApp Learning Bot</Text>
              <View style={[styles.statusPill, { backgroundColor: `${colors.blue}22` }]}>
                <Text style={[styles.statusText, { color: colors.blue }]}>Demo Hai — Jaribu Sasa</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Mazungumzo ya kweli na bot ya Kivuko kupitia API — sawa na WhatsApp Business. Andika MUUNGANO au
            JARIBIO kuanza.
          </Text>
          <Pressable style={styles.waPreview} onPress={() => setShowWaChat(true)}>
            <View style={styles.waPreviewBar}>
              <View style={styles.waAvatar}>
                <Text style={styles.waAvatarText}>KB</Text>
              </View>
              <Text style={styles.waPreviewTitle}>Kivuko Bot</Text>
            </View>
            <View style={styles.waPreviewBody}>
              <View style={styles.waPreviewBubble}>
                <Text style={styles.waPreviewText}>
                  Habari Mzalendo! 🌊 Andika MUUNGANO kuanza jaribio la historia…
                </Text>
              </View>
              <Text style={styles.waTapHint}>Gusa kufungua mazungumzo →</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={{ fontSize: 28 }}>📞</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>USSD *150*64#</Text>
              <View style={[styles.statusPill, { backgroundColor: `${colors.gold}33` }]}>
                <Text style={[styles.statusText, { color: '#7A5E00' }]}>Demo Hai — Jaribu Sasa</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>
            Simu za kawaida — bonyeza vitufe hapa chini kama *150*64# halisi. Hakuna intaneti inahitajika.
          </Text>
          <UssdSimulator />
        </View>

        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Button label="Rudi Dashibodi" variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  safeWa: { flex: 1, backgroundColor: '#ECE5DD' },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 720, alignSelf: 'center', width: '100%' },
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.greenDeep,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.dark, marginTop: 6 },
  sub: { fontSize: 13, color: colors.textMuted, marginTop: 8, lineHeight: 20, marginBottom: spacing.lg },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.line,
  },
  cardHead: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', color: colors.dark },
  statusPill: {
    alignSelf: 'flex-start',
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 4,
  },
  statusText: { fontSize: 10, fontWeight: '800' },
  cardDesc: { fontSize: 13, color: colors.textMuted, lineHeight: 19, marginBottom: 10 },
  waPreview: {
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#D1D7DB',
    marginTop: 4,
  },
  waPreviewBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#075E54',
    padding: 12,
  },
  waAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#128C7E',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waAvatarText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  waPreviewTitle: { color: '#fff', fontWeight: '700', fontSize: 14 },
  waPreviewBody: { backgroundColor: '#ECE5DD', padding: 14, minHeight: 100 },
  waPreviewBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    maxWidth: '85%',
  },
  waPreviewText: { fontSize: 13, color: '#111B21', lineHeight: 18 },
  waTapHint: { fontSize: 11, color: '#8696A0', marginTop: 12, textAlign: 'center', fontWeight: '600' },
  ussdLine: {
    fontFamily: 'monospace',
    fontSize: 12,
    color: colors.dark,
    backgroundColor: '#F4F4F4',
    padding: 6,
    marginTop: 4,
    borderRadius: 4,
  },
});
