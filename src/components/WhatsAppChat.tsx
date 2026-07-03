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
  /** Quick-reply chips (e.g. JARIBIO, MENYU). */
  suggestions?: string[];
  onSuggestionPress?: (text: string) => void;
  /** On web, wrap chat in a phone-sized frame (default true). */
  phoneFrame?: boolean;
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
  suggestions = [],
  onSuggestionPress,
  phoneFrame = Platform.OS === 'web',
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

  const chat = (
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

      {suggestions.length > 0 && onSuggestionPress ? (
        <View style={styles.suggestionsRow}>
          {suggestions.map((chip) => (
            <Pressable
              key={chip}
              style={styles.suggestionChip}
              onPress={() => onSuggestionPress(chip)}
              disabled={sending}
            >
              <Text style={styles.suggestionText}>{chip}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

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

  if (phoneFrame && Platform.OS === 'web') {
    return (
      <View style={styles.webOuter}>
        <View style={styles.phoneFrame}>{chat}</View>
      </View>
    );
  }

  return chat;
}

function FormattedText({ text, style }: { text: string; style: object }) {
  const parts = text.split(/(\*[^*]+\*)/g);
  return (
    <Text style={style}>
      {parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
          return (
            <Text key={i} style={[style, styles.boldText]}>
              {part.slice(1, -1)}
            </Text>
          );
        }
        return <Text key={i}>{part}</Text>;
      })}
    </Text>
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
        <FormattedText text={message.text} style={styles.bubbleText} />
        <View style={styles.metaRow}>
          <Text style={styles.timeText}>{formatTime(message.created_at)}</Text>
          {mine && <Text style={styles.ticks}>✓✓</Text>}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  webOuter: {
    flex: 1,
    width: '100%',
    backgroundColor: '#DADBD6',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  phoneFrame: {
    width: '100%',
    maxWidth: 390,
    height: '100%',
    maxHeight: 680,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#C5C9CC',
    backgroundColor: WA.bg,
    ...Platform.select({
      web: {
        boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
      } as object,
      default: {},
    }),
  },
  root: { flex: 1, backgroundColor: WA.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WA.header,
    paddingVertical: 8,
    paddingHorizontal: 8,
    gap: 8,
  },
  backBtn: { paddingHorizontal: 2 },
  backIcon: { color: '#fff', fontSize: 28, lineHeight: 28, fontWeight: '300' },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: WA.headerLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  headerInfo: { flex: 1, minWidth: 0 },
  headerName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  headerStatus: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 1 },
  chatArea: { flex: 1 },
  listContent: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    paddingBottom: 4,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
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
    maxWidth: Platform.OS === 'web' ? 280 : '78%',
    borderRadius: 7,
    paddingHorizontal: 8,
    paddingTop: 5,
    paddingBottom: 3,
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
  senderName: { fontSize: 11, fontWeight: '700', color: WA.headerLight, marginBottom: 1 },
  bubbleText: { fontSize: 14, lineHeight: 19, color: '#111B21' },
  boldText: { fontWeight: '700' },
  suggestionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: WA.inputBg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D7DB',
  },
  suggestionChip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#D1D7DB',
  },
  suggestionText: { fontSize: 12, fontWeight: '700', color: WA.headerLight },
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
  encryptBanner: { alignItems: 'center', paddingVertical: 4, paddingHorizontal: 12 },
  encryptText: { fontSize: 9, color: '#8696A0', textAlign: 'center' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: WA.inputBg,
    paddingHorizontal: 6,
    paddingVertical: 5,
    gap: 5,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D1D7DB',
  },
  inputWrap: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 7 : 6,
    maxHeight: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#E9EDEF',
  },
  input: {
    fontSize: 14,
    color: '#111B21',
    lineHeight: 18,
    ...Platform.select({ web: { outlineStyle: 'none' as const } }),
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  sendBtnActive: { backgroundColor: WA.headerLight },
  sendBtnIdle: { backgroundColor: '#8696A0' },
  sendIcon: { color: '#fff', fontSize: 16 },
});
