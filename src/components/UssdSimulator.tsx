import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';
import { api } from '../api/client';

export default function UssdSimulator() {
  const { t } = useLocale();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lines, setLines] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [points, setPoints] = useState(0);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const send = useCallback(async (text: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.ussdSession(text, sessionId);
      setSessionId(res.session_id);
      setLines(res.lines.length ? res.lines : [t('ussd.empty')]);
      setSuggestions(res.suggestions);
      setPoints(res.points);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('ussd.err'));
    } finally {
      setLoading(false);
    }
  }, [sessionId, t]);

  useEffect(() => {
    send('');
  }, []);

  const resetMenu = () => {
    setInput('');
    send('MENYU');
  };

  const submit = (choice: string) => {
    const c = choice.trim();
    if (!c) return;
    send(c);
    setInput('');
  };

  const dial = (key: string) => {
    if (key === 'C') {
      resetMenu();
      return;
    }
    if (key === '#') {
      submit(input);
      return;
    }
    if (key === '*') return;

    if (!input && ['1', '2', '3', '4', '5'].includes(key)) {
      submit(key);
      return;
    }

    setInput((prev) => prev + key);
  };

  const quickChoices = suggestions.length
    ? suggestions
    : ['1', '2', '3', '4', '5'];

  return (
    <View style={styles.phone}>
      <View style={styles.lcd}>
        <Text style={styles.lcdTitle}>{t('ussd.lcdTitle')}</Text>
        {loading ? (
          <ActivityIndicator color={colors.greenDeep} style={{ marginVertical: 12 }} />
        ) : error ? (
          <Text style={styles.errText}>{error}</Text>
        ) : (
          lines.map((line, i) => (
            <Text key={`${i}-${line.slice(0, 12)}`} style={styles.lcdLine}>
              {line}
            </Text>
          ))
        )}
        {points > 0 ? (
          <Text style={styles.pointsLine}>{t('ussd.livePoints', { pts: points })}</Text>
        ) : null}
        {input ? <Text style={styles.inputPreview}>{t('ussd.choice', { value: input })}</Text> : null}
      </View>

      <View style={styles.quickRow}>
        {quickChoices.slice(0, 4).map((label) => (
          <Pressable key={label} style={styles.quickChip} onPress={() => submit(label)}>
            <Text style={styles.quickChipText}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((key) => (
          <Pressable key={key} style={styles.key} onPress={() => dial(key)}>
            <Text style={styles.keyText}>{key}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actions}>
        <Pressable style={styles.okBtn} onPress={() => submit(input || 'MENYU')}>
          <Text style={styles.okText}>{t('ussd.ok')}</Text>
        </Pressable>
        <Pressable style={styles.okBtn} onPress={resetMenu}>
          <Text style={styles.okText}>{t('ussd.backMenu')}</Text>
        </Pressable>
      </View>

      <View style={styles.footerRow}>
        <Pressable onPress={() => dial('C')}>
          <Text style={styles.clearText}>{t('ussd.clear')}</Text>
        </Pressable>
        <Text style={styles.hintSmall}>{t('ussd.tapMenu')}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    backgroundColor: '#1C2421',
    borderRadius: radius.lg,
    padding: 14,
    maxWidth: 320,
    alignSelf: 'center',
    width: '100%',
  },
  lcd: {
    backgroundColor: '#C8D8B8',
    borderRadius: 8,
    padding: 12,
    minHeight: 160,
    marginBottom: 10,
  },
  lcdTitle: { fontSize: 10, fontWeight: '800', color: '#2D4A2E', marginBottom: 6 },
  lcdLine: { fontSize: 11, color: '#1A2E1C', lineHeight: 16, fontFamily: 'monospace' },
  pointsLine: { fontSize: 10, fontWeight: '700', color: colors.greenDeep, marginTop: 8 },
  inputPreview: { fontSize: 10, color: '#3A5A3C', marginTop: 6, fontStyle: 'italic' },
  errText: { fontSize: 11, color: colors.danger, lineHeight: 16 },
  quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  quickChip: {
    backgroundColor: '#2E4038',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  quickChipText: { color: '#B8E0C8', fontSize: 10, fontWeight: '700' },
  keypad: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  key: {
    width: '30%',
    backgroundColor: '#2A3530',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  keyText: { color: colors.white, fontSize: 16, fontWeight: '600' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 10 },
  okBtn: {
    flex: 1,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  okText: { color: colors.white, fontWeight: '700', fontSize: 12 },
  footerRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, alignItems: 'center' },
  clearText: { color: '#8AA', fontSize: 11 },
  hintSmall: { color: '#6B7', fontSize: 9, flex: 1, textAlign: 'right' },
});
