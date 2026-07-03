// components/WhatsAppChat.tsx — production-ready WhatsApp-style chat UI
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import type { ChatMessage } from '../api/client';

const WA = {
  header: '#075E54',
  headerLight: '#128C7E',
  bg: '#ECE5DD',
  inputBg: '#F0F2F5',
  bubbleMe: '#DCF8C6',
  bubblePeer: '#FFFFFF',
  tick: '#53BDEB',
};

export interface WhatsAppChatProps {
  messages: ChatMessage[];
  peerName: string;
  peerInitials: string;
  peerRegionLabel: string;
  peerHomeArea?: string;
  headerSubtitle?: string;
  placeholder?: string;
  sending?: boolean;
  peerTyping?: boolean;
  onSend: (text: string) => void | Promise<void>;
  onBack?: () => void;
  headerAction?: React.ReactNode;
}

function formatTime(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('sw-TZ', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDateLabel(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();
  if (isToday) return 'Leo';
  return d.toLocaleDateString('sw-TZ', { day: 'numeric', month: 'short', year: 'numeric' });
}

type ListItem =
  | { type: 'date'; id: string; label: string }
  | { type: 'message'; id: string; message: ChatMessage };

function buildListItems(messages: ChatMessage[]): ListItem[] {
  const items: ListItem[] = [];
  let lastDate: string | null = null;
  for (const msg of messages) {
    const dateLabel = formatDateLabel(msg.created_at);
    if (dateLabel && dateLabel !== lastDate) {
      items.push({ type: 'date', id: `date-${dateLabel}-${msg.id}`, label: dateLabel });
      lastDate = dateLabel;
    }
    items.push({ type: 'message', id: msg.id, message: msg });
  }
  return items;
}

export default function WhatsAppChat({
  messages,
  peerName,
  peerInitials,
  peerRegionLabel,
  peerHomeArea,
  headerSubtitle,
  placeholder = 'Ujumbe',
  sending = false,
  peerTyping = false,
  onSend,
  onBack,
  headerAction,
}: WhatsAppChatProps) {
  const [draft, setDraft] = React.useState('');
  const listRef = useRef<FlatList<ListItem>>(null);
  const listItems = buildListItems(messages);

  useEffect(() => {
    if (listItems.length === 0) return;
    const t = setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(t);
  }, [listItems.length, peerTyping]);

  const handleSend = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setDraft('');
    await onSend(text);
  };

  const firstName = peerName.split(' ')[0];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        {onBack && (
          <Pressable onPress={onBack} style={styles.backBtn} hitSlop={8}>
            <Text style={styles.backIcon}>‹</Text>
          </Pressable>
        )}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{peerInitials}</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerName} numberOfLines={1}>
            {peerName}
          </Text>
          <Text style={styles.headerStatus} numberOfLines={1}>
            {peerTyping
              ? 'ameandika…'
              : headerSubtitle ?? `${peerRegionLabel}${peerHomeArea ? ` · ${peerHomeArea}` : ''} · mtandaoni`}
          </Text>
        </View>
        {headerAction}
      </View>

      <View style={styles.chatArea}>
        <FlatList
          ref={listRef}
          data={listItems}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          renderItem={({ item }) => {
            if (item.type === 'date') {
              return (
                <View style={styles.datePill}>
                  <Text style={styles.dateText}>{item.label}</Text>
                </View>
              );
            }
            return <MessageBubble message={item.message} peerFirstName={firstName} />;
          }}
          ListFooterComponent={
            peerTyping ? (
              <View style={styles.typingRow}>
                <View style={styles.typingBubble}>
                  <Text style={styles.typingDots}>● ● ●</Text>
                </View>
              </View>
            ) : null
          }
        />
        <View style={styles.encryptBanner}>
          <Text style={styles.encryptText}>🔒 Ujumbe wako umefungwa kwa usalama wa Kivuko</Text>
        </View>
      </View>

      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            placeholder={placeholder}
            placeholderTextColor="#8696A0"
            style={styles.input}
            multiline
            maxLength={2000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />
        </View>
        <Pressable
          style={[styles.sendBtn, draft.trim() ? styles.sendBtnActive : styles.sendBtnIdle]}
          onPress={handleSend}
          disabled={!draft.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.sendIcon}>{draft.trim() ? '➤' : '🎤'}</Text>
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBubble({
  message,
  peerFirstName,
}: {
  message: ChatMessage;
  peerFirstName: string;
}) {
  if (message.from_role === 'system') {
    return (
      <View style={styles.systemWrap}>
        <Text style={styles.systemText}>{message.text}</Text>
      </View>
    );
  }

  const mine = message.from_role === 'me';
  return (
    <View style={[styles.bubbleRow, mine ? styles.bubbleRowMe : styles.bubbleRowPeer]}>
      <View style={[styles.bubble, mine ? styles.bubbleMe : styles.bubblePeer]}>
        {!mine && <Text style={styles.senderName}>{peerFirstName}</Text>}
        <Text style={styles.bubbleText}>{message.text}</Text>
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{formatTime(message.created_at)}</Text>
          {mine && <Text style={styles.ticks}>✓✓</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: WA.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WA.header,
    paddingVertical: 10,
    paddingHorizontal: 8,
    gap: 10,
  },
  backBtn: { paddingHorizontal: 4 },
  backIcon: { color: '#fff', fontSize: 32, lineHeight: 32, fontWeight: '300' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: WA.headerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  headerInfo: { flex: 1 },
  headerName: { color: '#fff', fontSize: 16, fontWeight: '600' },
  headerStatus: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 1 },
  chatArea: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingVertical: 8, paddingBottom: 4, flexGrow: 1 },
  datePill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(225,218,208,0.92)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginVertical: 8,
  },
  dateText: { fontSize: 11, color: '#54656F', fontWeight: '600' },
  systemWrap: {
    alignSelf: 'center',
    backgroundColor: '#FFF9C4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginVertical: 6,
    maxWidth: '88%',
  },
  systemText: { fontSize: 12, color: '#5C5C00', textAlign: 'center', lineHeight: 17 },
  bubbleRow: { marginVertical: 2, flexDirection: 'row' },
  bubbleRowMe: { justifyContent: 'flex-end' },
  bubbleRowPeer: { justifyContent: 'flex-start' },
  bubble: {
    maxWidth: '82%',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingTop: 6,
    paddingBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 1,
        shadowOffset: { width: 0, height: 1 },
      },
      android: { elevation: 1 },
      default: {},
    }),
  },
  bubbleMe: { backgroundColor: WA.bubbleMe, borderTopRightRadius: 2 },
  bubblePeer: { backgroundColor: WA.bubblePeer, borderTopLeftRadius: 2 },
  senderName: { fontSize: 12, fontWeight: '700', color: WA.headerLight, marginBottom: 2 },
  bubbleText: { fontSize: 15, lineHeight: 21, color: '#111B21' },
  metaRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 4, marginTop: 2 },
  timeText: { fontSize: 10, color: '#667781' },
  ticks: { fontSize: 11, color: WA.tick, fontWeight: '700', letterSpacing: -2 },
  typingRow: { flexDirection: 'row', marginTop: 4, marginBottom: 8 },
  typingBubble: {
    backgroundColor: WA.bubblePeer,
    borderRadius: 8,
    borderTopLeftRadius: 2,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  typingDots: { fontSize: 10, color: '#8696A0', letterSpacing: 2 },
  encryptBanner: { alignItems: 'center', paddingVertical: 6, paddingHorizontal: 16 },
  encryptText: { fontSize: 10, color: '#8696A0', textAlign: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: WA.inputBg,
    paddingHorizontal: 8,
    paddingVertical: 6,
    gap: 6,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D7DB',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'web' ? 10 : 8,
    maxHeight: 120,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E9EDEF',
  },
  input: {
    fontSize: 15,
    color: '#111B21',
    lineHeight: 20,
    ...Platform.select({ web: { outlineStyle: 'none' as const } }),
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnActive: { backgroundColor: WA.headerLight },
  sendBtnIdle: { backgroundColor: '#8696A0' },
  sendIcon: { color: '#fff', fontSize: 18 },
});
