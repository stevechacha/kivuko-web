// AdminDashboardScreen — moderator panel with stats, flagged queue, stories, gala shortlist
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import LanguageToggle from '../components/LanguageToggle';
import { useLocale } from '../context/LocaleContext';
import { api, type AdminDashboard, type LeaderboardEntry, type ReportedItem } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

type AdminTab = 'stats' | 'flagged' | 'stories' | 'gala';

const MOCK_STORIES = [
  { id: 's1', title: 'Kumbukumbu ya Muungano — Dodoma', author: 'Amina J.' },
  { id: 's2', title: 'Sauti ya Bibi kutoka Unguja', author: 'Khadija M.' },
];

export default function AdminDashboardScreen({ navigation }: Props) {
  const { t } = useLocale();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [pendingReports, setPendingReports] = useState<ReportedItem[]>([]);
  const [galaShortlist, setGalaShortlist] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.getAdminDashboard(),
      api.getReportedContent('pending').catch(() => [] as ReportedItem[]),
      api.getLeaderboard(10).catch(() => [] as LeaderboardEntry[]),
    ])
      .then(([dash, reports, leaders]) => {
        setStats(dash);
        setPendingReports(reports);
        setGalaShortlist(leaders);
      })
      .catch((e) => setError(e instanceof Error ? e.message : t('admin.loadError')))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.adminNav}>
        <Text style={styles.adminNavTitle}>{t('admin.panelTitle')}</Text>
        <View style={styles.navRight}>
          <LanguageToggle />
          <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>{t('admin.moderatorRole')}</Text>
          </View>
        </View>
      </View>

      <View style={styles.tabRow}>
        {(
          [
            ['stats', t('admin.tabStats')],
            ['flagged', `${t('admin.tabReports')}${pendingReports.length ? ` (${pendingReports.length})` : ''}`],
            ['stories', t('admin.tabStories')],
            ['gala', t('admin.tabGala')],
          ] as const
        ).map(([id, label]) => (
          <Pressable
            key={id}
            style={[styles.tab, tab === id && styles.tabActive]}
            onPress={() => setTab(id)}
          >
            <Text style={[styles.tabText, tab === id && styles.tabTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : (
          <>
            {tab === 'stats' && stats && (
              <>
                <View style={styles.statGrid}>
                  <StatCard label={t('admin.statMembers')} value={stats.total_participants} />
                  <StatCard label={t('admin.statMatches')} value={stats.active_matches} />
                  <StatCard label={t('admin.statMissions')} value={stats.completed_missions} />
                  <StatCard label={t('admin.statCerts')} value={stats.certificates_issued} />
                  <StatCard label={t('common.bara')} value={stats.bara_participants} accent={colors.green} />
                  <StatCard label={t('common.visiwani')} value={stats.visiwani_participants} accent={colors.blue} />
                </View>
                <View style={styles.connectionsCard}>
                  <Text style={styles.connectionsTitle}>{t('admin.recentConnections')}</Text>
                  {stats.recent_connections.slice(0, 6).map((c) => (
                    <View key={c.id} style={styles.connectionRow}>
                      <Text style={styles.connectionText}>
                        {c.from_region} → {c.to_region}
                      </Text>
                    </View>
                  ))}
                </View>
              </>
            )}

            {tab === 'flagged' && (
              <>
                <Text style={styles.sectionHint}>{t('admin.flaggedHint')}</Text>
                {pendingReports.length === 0 ? (
                  <Text style={styles.empty}>{t('admin.noReports')}</Text>
                ) : (
                  pendingReports.slice(0, 5).map((r) => (
                    <View key={r.id} style={styles.flagCard}>
                      <Text style={styles.flagTitle}>{r.reported_name} · {r.mission_title}</Text>
                      <Text style={styles.flagMeta}>{r.reported_at_label} · {r.reason}</Text>
                      {r.excerpt ? <Text style={styles.flagExcerpt}>"{r.excerpt}"</Text> : null}
                    </View>
                  ))
                )}
                <View style={{ marginTop: spacing.md }}>
                  <Button
                    label={t('admin.openFullQueue')}
                    onPress={() => navigation.navigate('ModeratorFlaggedContent')}
                  />
                </View>
              </>
            )}

            {tab === 'stories' && (
              <>
                <Text style={styles.sectionHint}>{t('admin.storiesHint')}</Text>
                {MOCK_STORIES.map((s) => (
                  <View key={s.id} style={styles.flagCard}>
                    <Text style={styles.flagTitle}>{s.title}</Text>
                    <Text style={styles.flagMeta}>{s.author} · {t('admin.pendingStatus')}</Text>
                    <View style={styles.storyActions}>
                      <Text style={styles.storyAction}>{t('admin.approve')}</Text>
                      <Text style={styles.storyActionMuted}>{t('admin.reject')}</Text>
                    </View>
                  </View>
                ))}
              </>
            )}

            {tab === 'gala' && (
              <>
                <Text style={styles.sectionHint}>{t('admin.galaShortlist')}</Text>
                {galaShortlist.map((e) => (
                  <View key={e.rank} style={styles.galaRow}>
                    <Text style={styles.galaRank}>{e.rank}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.galaName}>{e.name}</Text>
                      <Text style={styles.galaMeta}>{e.region_label} · {e.patriotism_points} pts</Text>
                    </View>
                    <Text style={styles.galaCheck}>☐</Text>
                  </View>
                ))}
              </>
            )}
          </>
        )}

        <View style={{ marginTop: spacing.xl, alignItems: 'center', gap: 8 }}>
          <Button label={t('admin.flaggedLink')} variant="secondary" onPress={() => navigation.navigate('ModeratorFlaggedContent')} />
          <Button label={t('admin.viewMap')} variant="secondary" onPress={() => navigation.navigate('UnionMap')} />
          <Button label={t('admin.backDashboard')} variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <View style={[styles.statCard, accent ? { borderLeftColor: accent, borderLeftWidth: 4 } : null]}>
      <Text style={styles.statValue}>{value.toLocaleString()}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  adminNav: {
    backgroundColor: colors.dark,
    borderBottomWidth: 4,
    borderBottomColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminNavTitle: { color: colors.white, fontWeight: '800', fontSize: 13 },
  navRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(220,38,38,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#EF4444' },
  liveText: { fontSize: 10, color: '#FCA5A5', fontWeight: '800' },
  tabRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, padding: spacing.md, backgroundColor: colors.white, borderBottomWidth: 1, borderBottomColor: colors.line },
  tab: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, backgroundColor: '#F4F7F6' },
  tabActive: { backgroundColor: colors.dark },
  tabText: { fontSize: 11, fontWeight: '700', color: colors.textMuted },
  tabTextActive: { color: colors.white },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 900, width: '100%', alignSelf: 'center' },
  sectionHint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md, lineHeight: 18 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: {
    flexBasis: '30%',
    flexGrow: 1,
    minWidth: 120,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.line,
  },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.dark },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 4 },
  connectionsCard: {
    marginTop: spacing.lg,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
  },
  connectionsTitle: { fontSize: 14, fontWeight: '700', color: colors.dark, marginBottom: 12 },
  connectionRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.line },
  connectionText: { fontSize: 13, color: colors.blueDeep, fontWeight: '600' },
  flagCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: colors.line },
  flagTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  flagMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  flagExcerpt: { fontSize: 12, color: colors.textMuted, fontStyle: 'italic', marginTop: 6 },
  storyActions: { flexDirection: 'row', gap: 16, marginTop: 10 },
  storyAction: { fontSize: 12, fontWeight: '700', color: colors.green },
  storyActionMuted: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  galaRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, padding: 12, borderRadius: radius.md, marginBottom: 6, borderWidth: 1, borderColor: colors.line },
  galaRank: { fontSize: 16, fontWeight: '800', width: 24, textAlign: 'center' },
  galaName: { fontSize: 13, fontWeight: '700', color: colors.dark },
  galaMeta: { fontSize: 11, color: colors.textMuted },
  galaCheck: { fontSize: 18, color: colors.gold },
  empty: { fontSize: 13, color: colors.textMuted, textAlign: 'center', paddingVertical: 24 },
  error: { color: colors.danger, textAlign: 'center', marginTop: 20 },
});
