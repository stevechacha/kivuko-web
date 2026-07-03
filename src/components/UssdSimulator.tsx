import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius } from '../theme/colors';

type UssdState = 'menu' | 'chemsha' | 'points' | 'register';

const MENU = [
  'Karibu Kivuko la Muungano',
  '1. Chemsha Bongo',
  '2. Sauti za Wazee',
  '3. Pointi zangu',
  '4. Jisajili (SMS)',
];

export default function UssdSimulator() {
  const [screen, setScreen] = useState<UssdState>('menu');
  const [input, setInput] = useState('');

  const dial = (key: string) => {
    if (key === 'C') {
      setInput('');
      setScreen('menu');
      return;
    }
    if (key === '#') {
      handleSubmit(input || key);
      setInput('');
      return;
    }
    if (key === '*') return;
    setInput((prev) => prev + key);
  };

  const handleSubmit = (choice: string) => {
    if (screen === 'menu') {
      if (choice === '1') setScreen('chemsha');
      else if (choice === '2') setScreen('menu');
      else if (choice === '3') setScreen('points');
      else if (choice === '4') setScreen('register');
      return;
    }
    if (screen === 'chemsha' && choice === '2') {
      setScreen('points');
    }
  };

  const body = () => {
    switch (screen) {
      case 'chemsha':
        return [
          'Chemsha Bongo — Swali 1/3',
          'Muungano ulianzishwa:',
          '1. 1961  2. 1964  3. 1977',
          'Jibu kwa namba, kisha #',
        ];
      case 'points':
        return [
          'Pointi zako za Uzalendo:',
          '⭐ 120 Pointi',
          'Daraja: Mwanachama wa Kivuko',
          'Endelea kwenye wavuti kwa cheti cha QR.',
        ];
      case 'register':
        return [
          'Jisajili kwa SMS:',
          'Tuma MUUNGANO kwenda',
          '15064 au tembelea:',
          'kivuko-web.../usajili',
        ];
      default:
        return MENU;
    }
  };

  return (
    <View style={styles.phone}>
      <View style={styles.lcd}>
        <Text style={styles.lcdTitle}>*150*64# · Kivuko USSD</Text>
        {body().map((line, i) => (
          <Text key={i} style={[styles.lcdLine, i === 0 && styles.lcdLineBold]}>
            {line}
          </Text>
        ))}
        {input ? <Text style={styles.inputPreview}>Chaguo: {input}</Text> : null}
      </View>
      <View style={styles.keys}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#'].map((k) => (
          <Pressable key={k} style={styles.key} onPress={() => dial(k)}>
            <Text style={styles.keyText}>{k}</Text>
          </Pressable>
        ))}
      </View>
      <Pressable style={styles.clearBtn} onPress={() => dial('C')}>
        <Text style={styles.clearText}>Futa / Rudi Menyu</Text>
      </Pressable>
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
    minHeight: 140,
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
  clearBtn: { marginTop: 10, alignItems: 'center', padding: 8 },
  clearText: { color: colors.gold, fontSize: 11, fontWeight: '700' },
});
