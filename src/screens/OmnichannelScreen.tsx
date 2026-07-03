// OmnichannelScreen — live WhatsApp bot demo + USSD vision
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, Pressable } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import UssdSimulator from '../components/UssdSimulator';
import WhatsAppChat from '../components/WhatsAppChat';
import { api, type ChatMessage } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { markVisited } from '../utils/visitTracking';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'Omnichannel'>;

const BOT_PEER = {
  name: 'Kivuko Bot',
  initials: 'KB',
  region_label: 'Muungano Hub',
  home_area: 'Tanzania',
};

const DEFAULT_SUGGESTIONS = ['JARIBIO', 'SOMO', 'MENYU'];

function toMessage(from: 'me' | 'peer', text: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random()}`,
    from_role: from,
    text,
    created_at: new Date().toISOString(),
  };
}

export default function OmnichannelScreen({ navigation }: Props) {
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [waMessages, setWaMessages] = useState<ChatMessage[]>([]);
  const [waSending, setWaSending] = useState(false);
  const [waTyping, setWaTyping] = useState(false);
  const [showWaChat, setShowWaChat] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [suggestions, setSuggestions] = useState<string[]>(DEFAULT_SUGGESTIONS);
  const [botPoints, setBotPoints] = useState(0);

  useEffect(() => {
    markVisited('omnichannel');
  }, []);

  const applyBotResponse = useCallback((res: Awaited<ReturnType<typeof api.whatsappBot>>) => {
    if (res.session_id) setSessionId(res.session_id);
    if (res.suggestions?.length) setSuggestions(res.suggestions);
    setBotPoints(res.points ?? 0);
    setWaMessages((prev) => [...prev, toMessage('peer', res.reply)]);
  }, []);

  useEffect(() => {
    if (!showWaChat || waMessages.length > 0) return;
    setWaTyping(true);
    api
      .whatsappBot('', sessionId)
      .then(applyBotResponse)
      .catch(() => {
        setWaMessages([
          toMessage(
            'peer',
            'Habari Mzalendo! 🌊 Andika *MUUNGANO* au *MENYU* kuanza. Jaribio lina maswali 6 ya historia ya taifa.',
          ),
        ]);
        setSuggestions(DEFAULT_SUGGESTIONS);
      })
      .finally(() => setWaTyping(false));
  }, [showWaChat, waMessages.length, sessionId, applyBotResponse]);

  const sendWhatsApp = async (text: string) => {
    setWaSending(true);
    setWaMessages((prev) => [...prev, toMessage('me', text)]);
    setWaTyping(true);
    try {
      const res = await api.whatsappBot(text, sessionId);
      setTimeout(() => {
        applyBotResponse(res);
        setWaTyping(false);
      }, 700);
    } catch {
      setWaTyping(false);
      setWaMessages((prev) => [
        ...prev,
        toMessage('peer', 'Samahani, hitilafu ya mtandao. Jaribu tena au andika *MENYU*.'),
      ]);
      setSuggestions(['MENYU', 'JARIBIO']);
    } finally {
      setWaSending(false);
    }
  };

  const headerSubtitle =
    botPoints > 0
      ? `${t('omnichannel.waSubtitle')} · ⭐ ${botPoints} ${t('common.pts')}`
      : t('omnichannel.waSubtitle');

  if (showWaChat) {
    return (
      <SafeAreaView style={styles.safeWa}>
        <WhatsAppChat
          messages={waMessages}
          peerName={BOT_PEER.name}
          peerInitials={BOT_PEER.initials}
          peerRegionLabel={BOT_PEER.region_label}
          peerHomeArea={BOT_PEER.home_area}
          headerSubtitle={headerSubtitle}
          placeholder={t('omnichannel.waPlaceholder')}
          sending={waSending}
          peerTyping={waTyping}
          onSend={sendWhatsApp}
          onBack={() => setShowWaChat(false)}
          suggestions={suggestions}
          onSuggestionPress={sendWhatsApp}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.eyebrow}>{t('omnichannel.eyebrow')}</Text>
        <Text style={styles.title}>{t('omnichannel.title')}</Text>
        <Text style={styles.sub}>{t('omnichannel.sub')}</Text>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={{ fontSize: 28 }}>📱</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('omnichannel.pwaTitle')}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${colors.green}22` }]}>
                <Text style={[styles.statusText, { color: colors.green }]}>{t('omnichannel.live')}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>{t('omnichannel.pwaDesc')}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={{ fontSize: 28 }}>💬</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('omnichannel.waTitle')}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${colors.blue}22` }]}>
                <Text style={[styles.statusText, { color: colors.blue }]}>{t('omnichannel.waLive')}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>{t('omnichannel.waDesc')}</Text>
          <Pressable style={styles.waPreview} onPress={() => setShowWaChat(true)}>
            <View style={styles.waPreviewBar}>
              <View style={styles.waAvatar}>
                <Text style={styles.waAvatarText}>KB</Text>
              </View>
              <Text style={styles.waPreviewTitle}>Kivuko Bot</Text>
            </View>
            <View style={styles.waPreviewBody}>
              <View style={styles.waPreviewBubble}>
                <Text style={styles.waPreviewText}>{t('omnichannel.waPreview')}</Text>
              </View>
              <View style={styles.chipRow}>
                {DEFAULT_SUGGESTIONS.map((chip) => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>
              <Text style={styles.waTapHint}>{t('omnichannel.waTap')}</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHead}>
            <Text style={{ fontSize: 28 }}>📞</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{t('omnichannel.ussdTitle')}</Text>
              <View style={[styles.statusPill, { backgroundColor: `${colors.gold}33` }]}>
                <Text style={[styles.statusText, { color: '#7A5E00' }]}>{t('omnichannel.ussdLive')}</Text>
              </View>
            </View>
          </View>
          <Text style={styles.cardDesc}>{t('omnichannel.ussdDesc')}</Text>
          <UssdSimulator />
        </View>

        <View style={{ marginTop: spacing.lg, alignItems: 'center' }}>
          <Button label={t('admin.backDashboard')} variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  safeWa: { flex: 1, backgroundColor: '#DADBD6' },
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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#D1D7DB',
  },
  chipText: { fontSize: 11, fontWeight: '700', color: '#128C7E' },
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
