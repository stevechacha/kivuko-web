// AcademyScreen — Multimedia museum with tabs (improvement/Uzalendoo.html)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import TopNav from '../components/TopNav';
import Button from '../components/Button';
import { api, type AcademyArticle } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'Academy'>;
type Tab = 'army' | 'union' | 'patriot';

const TABS: { id: Tab; label: string; icon: string; sub: string }[] = [
  { id: 'army', label: 'Historia ya JWTZ', icon: '🎖️', sub: 'Kuvunjwa kwa TFM na kuzaliwa kwa JWTZ 1964.' },
  { id: 'union', label: 'Nyaraka za Muungano', icon: '🏛️', sub: 'Hati za Muungano na changamoto zilizovushwa.' },
  { id: 'patriot', label: 'Misingi ya Uzalendo', icon: '❤️', sub: 'Nembo za Taifa, Wimbo, na viapo vya kulinda nchi.' },
];

export default function AcademyScreen({ route, navigation }: Props) {
  const initialTab = route.params?.tab ?? 'union';
  const [tab, setTab] = useState<Tab>(initialTab);
  const [articles, setArticles] = useState<AcademyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api
      .getAcademyArticles(tab)
      .then(setArticles)
      .catch((e) => setError(e instanceof Error ? e.message : 'Imeshindwa kupakia maudhui.'))
      .finally(() => setLoading(false));
  }, [tab]);

  const article = articles[0];

  return (
    <SafeAreaView style={styles.safe}>
      <TopNav currentStep={0} showPoints />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Maktaba ya Uzalendo & Historia</Text>
            <Text style={styles.headerSub}>Makumbusho ya kidijitali ya Muungano na JWTZ (1964 — Sasa)</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <Pressable
              key={t.id}
              onPress={() => setTab(t.id)}
              style={[styles.tab, tab === t.id && styles.tabActive]}
            >
              <Text style={{ fontSize: 16 }}>{t.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tabLabel, tab === t.id && styles.tabLabelActive]}>{t.label}</Text>
                <Text style={styles.tabSub}>{t.sub}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <View style={styles.contentCard}>
          {loading ? (
            <ActivityIndicator color={colors.green} style={{ marginVertical: 40 }} />
          ) : error ? (
            <Text style={styles.error}>{error}</Text>
          ) : article ? (
            <>
              <View style={styles.contentHead}>
                <Text style={styles.contentTitle}>{article.title}</Text>
                {article.badge_label ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{article.badge_label}</Text>
                  </View>
                ) : null}
              </View>
              <Text style={styles.summary}>{article.summary}</Text>
              <Text style={styles.body}>{article.body}</Text>
            </>
          ) : (
            <Text style={styles.error}>Hakuna maudhui kwa sasa.</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Button label="Rudi Dashibodi" variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 900, width: '100%', alignSelf: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.md,
  },
  headerIcon: { fontSize: 28 },
  headerTitle: { fontSize: 15, fontWeight: '800', color: colors.dark },
  headerSub: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  tabRow: { gap: 8, marginBottom: spacing.md },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.line,
    backgroundColor: colors.white,
  },
  tabActive: { borderColor: colors.green, backgroundColor: '#F0FAF8' },
  tabLabel: { fontSize: 12, fontWeight: '700', color: colors.dark },
  tabLabelActive: { color: colors.greenDeep },
  tabSub: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  contentCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    minHeight: 280,
  },
  contentHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 12 },
  contentTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: colors.greenDeep, textTransform: 'uppercase' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill },
  badgeText: { fontSize: 9, fontWeight: '700', color: '#92400E' },
  summary: { fontSize: 13, color: colors.textMuted, lineHeight: 20, marginBottom: 14 },
  body: { fontSize: 13, color: colors.dark, lineHeight: 22 },
  error: { color: colors.danger, textAlign: 'center', padding: 20 },
  footer: { marginTop: spacing.lg, alignItems: 'center' },
});
