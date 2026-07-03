import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius } from '../theme/colors';
import { useLocale } from '../context/LocaleContext';

type UssdState = 'menu' | 'chemsha' | 'chemsha_result' | 'elders' | 'points' | 'register';

type ChemshaQ = { prompt: string; options: string[]; correct: string };

export default function UssdSimulator() {
  const { t } = useLocale();
  const [screen, setScreen] = useState<UssdState>('menu');
  const [input, setInput] = useState('');
  const [chemshaIndex, setChemshaIndex] = useState(0);
  const [chemshaScore, setChemshaScore] = useState(0);

  const chemshaQuestions: ChemshaQ[] = useMemo(
    () => [
      {
        prompt: t('ussd.q1'),
        options: ['1. 1961', '2. 1964', '3. 1977'],
        correct: '2',
      },
      {
        prompt: t('ussd.q2'),
        options: ['1. Kenya', '2. Tanzania', '3. Uganda'],
        correct: '2',
      },
      {
        prompt: t('ussd.q3'),
        options: ['1. Dodoma', '2. Dar', '3. Zanzibar'],
        correct: '1',
      },
    ],
    [t],
  );

  const menuLines = useMemo(
    () => [
      t('ussd.welcome'),
      t('ussd.opt1'),
      t('ussd.opt2'),
      t('ussd.opt3'),
      t('ussd.opt4'),
    ],
    [t],
  );

  const resetMenu = () => {
    setInput('');
    setScreen('menu');
    setChemshaIndex(0);
    setChemshaScore(0);
  };

  const submit = (choice: string) => {
    const c = choice.trim();
    if (!c) return;

    if (screen === 'menu') {
      if (c === '1') {
        setChemshaIndex(0);
        setChemshaScore(0);
        setScreen('chemsha');
      } else if (c === '2') setScreen('elders');
      else if (c === '3') setScreen('points');
      else if (c === '4') setScreen('register');
      return;
    }

    if (screen === 'chemsha') {
      const q = chemshaQuestions[chemshaIndex];
      if (c === q.correct) setChemshaScore((s) => s + 1);
      const next = chemshaIndex + 1;
      if (next >= chemshaQuestions.length) {
        setScreen('chemsha_result');
      } else {
        setChemshaIndex(next);
      }
      return;
    }

    if (screen === 'chemsha_result' || screen === 'elders' || screen === 'points' || screen === 'register') {
      resetMenu();
    }
  };

  const dial = (key: string) => {
    if (key === 'C') {
      resetMenu();
      return;
    }
    if (key === '#') {
      submit(input);
      setInput('');
      return;
    }
    if (key === '*') return;

    // Main menu: one tap selects (like real USSD short codes)
    if (screen === 'menu' && ['1', '2', '3', '4'].includes(key)) {
      submit(key);
      setInput('');
      return;
    }

    // Chemsha quiz: one tap submits answer
    if (screen === 'chemsha' && ['1', '2', '3'].includes(key)) {
      submit(key);
      setInput('');
      return;
    }

    setInput((prev) => prev + key);
  };

  const pressOk = () => {
    if (input.trim()) {
      submit(input);
      setInput('');
    }
  };

  const body = (): string[] => {
    switch (screen) {
      case 'chemsha': {
        const q = chemshaQuestions[chemshaIndex];
        return [
          t('ussd.chemshaTitle', { n: chemshaIndex + 1, total: chemshaQuestions.length }),
          q.prompt,
          ...q.options,
          t('ussd.answerHint'),
        ];
      }
      case 'chemsha_result':
        return [
          t('ussd.resultTitle'),
          t('ussd.resultScore', { score: chemshaScore, total: chemshaQuestions.length }),
          t('ussd.resultPts', { pts: chemshaScore * 10 }),
          t('ussd.resultWeb'),
        ];
      case 'elders':
        return [
          t('ussd.eldersTitle'),
          '1. Bibi Fatuma — Pemba',
          '2. Babu Elias — Kigoma',
          '3. Mwalimu Nyerere — Taifa',
          t('ussd.eldersNote'),
        ];
      case 'points':
        return [t('ussd.pointsTitle'), t('ussd.pointsValue'), t('ussd.pointsGrade'), t('ussd.pointsWeb')];
      case 'register':
        return [t('ussd.regTitle'), t('ussd.regSms'), t('ussd.regCode'), t('ussd.regWeb')];
      default:
        return [...menuLines, t('ussd.menuHint')];
    }
  };

  const showOk =
    screen === 'chemsha' ||
    (input.length > 0 && screen !== 'menu');

  const showBackHint =
    screen === 'chemsha_result' || screen === 'elders' || screen === 'points' || screen === 'register';

  return (
    <View style={styles.phone}>
      <View style={styles.lcd}>
        <Text style={styles.lcdTitle}>{t('ussd.lcdTitle')}</Text>
        {body().map((line, i) => (
          <Text key={`${screen}-${i}`} style={[styles.lcdLine, i === 0 && styles.lcdLineBold]}>
            {line}
          </Text>
        ))}
        {input ? <Text style={styles.inputPreview}>{t('ussd.choice', { value: input })}</Text> : null}
      </View>

      <View style={styles.keys}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
          <Pressable key={k} style={styles.key} onPress={() => dial(k)}>
            <Text style={styles.keyText}>{k}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.actionRow}>
        {showOk ? (
          <Pressable
            style={[styles.okBtn, !input.trim() && styles.okBtnDisabled]}
            onPress={pressOk}
            disabled={!input.trim()}
          >
            <Text style={styles.okText}>{t('ussd.ok')}</Text>
          </Pressable>
        ) : showBackHint ? (
          <Pressable style={styles.okBtn} onPress={resetMenu}>
            <Text style={styles.okText}>{t('ussd.backMenu')}</Text>
          </Pressable>
        ) : (
          <View style={styles.okPlaceholder}>
            <Text style={styles.hintSmall}>{t('ussd.tapMenu')}</Text>
          </View>
        )}
        <Pressable style={styles.clearBtn} onPress={() => dial('C')}>
          <Text style={styles.clearText}>{t('ussd.clear')}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  phone: {
    backgroundColor: '#2C3E50',
    borderRadius: radius.lg,
    padding: 14,
    marginTop: 10,
  },
  lcd: {
    backgroundColor: '#C5E8C5',
    borderRadius: 8,
    padding: 12,
    minHeight: 148,
  },
  lcdTitle: { fontSize: 10, fontWeight: '800', color: '#1A472A', marginBottom: 6 },
  lcdLine: { fontSize: 12, color: '#1A1A1A', lineHeight: 17, fontFamily: 'monospace' },
  lcdLineBold: { fontWeight: '800' },
  inputPreview: { fontSize: 11, color: colors.greenDeep, marginTop: 8, fontWeight: '700' },
  keys: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10, justifyContent: 'center' },
  key: {
    width: '29%',
    backgroundColor: '#34495E',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  keyText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  okBtn: {
    flex: 1,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  okBtnDisabled: {
    backgroundColor: '#5A7A6E',
    opacity: 0.7,
  },
  okText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  okPlaceholder: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintSmall: { color: 'rgba(255,255,255,0.75)', fontSize: 10, fontWeight: '600', textAlign: 'center' },
  clearBtn: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  clearText: { color: colors.gold, fontSize: 11, fontWeight: '700' },
});
