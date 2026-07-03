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
import CivicCompanionBox from '../components/CivicCompanionBox';
import { api, type AcademyArticle } from '../api/client';
import { useLocale } from '../context/LocaleContext';
import { markVisited } from '../utils/visitTracking';
import { useAppBack } from '../navigation/useAppBack';

type Props = NativeStackScreenProps<RootStackParamList, 'Academy'>;
type Tab = 'army' | 'union' | 'patriot';

export default function AcademyScreen({ route, navigation }: Props) {
  const initialTab = route.params?.tab ?? 'union';
  const { t } = useLocale();
  const goBack = useAppBack(navigation);
  const [tab, setTab] = useState<Tab>(initialTab);
  const [articles, setArticles] = useState<AcademyArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tabs: { id: Tab; label: string; icon: string; sub: string }[] = [
    { id: 'army', label: t('academy.tabArmy'), icon: '🎖️', sub: t('academy.tabArmySub') },
    { id: 'union', label: t('academy.tabUnion'), icon: '🏛️', sub: t('academy.tabUnionSub') },
    { id: 'patriot', label: t('academy.tabPatriot'), icon: '❤️', sub: t('academy.tabPatriotSub') },
  ];

  useEffect(() => {
    markVisited('academy');
    if (tab === 'patriot') markVisited('patriot');
  }, [tab]);

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
      <TopNav currentStep={0} showPoints showBack onBack={goBack} hideSteps />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{t('academy.headerTitle')}</Text>
            <Text style={styles.headerSub}>{t('academy.headerSub')}</Text>
          </View>
        </View>

        <CivicCompanionBox />

        <View style={styles.tabRow}>
          {tabs.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => setTab(item.id)}
              style={[styles.tab, tab === item.id && styles.tabActive]}
            >
              <Text style={{ fontSize: 16 }}>{item.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.tabLabel, tab === item.id && styles.tabLabelActive]}>{item.label}</Text>
                <Text style={styles.tabSub}>{item.sub}</Text>
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
            <Text style={styles.error}>{t('academy.empty')}</Text>
          )}
        </View>

        <View style={styles.footer}>
          <Button label={t('admin.backDashboard')} variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
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
