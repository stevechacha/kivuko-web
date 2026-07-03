// AdminDashboardScreen — Live admin stats (improvement/admin.html concept)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import { api, type AdminDashboard } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'AdminDashboard'>;

export default function AdminDashboardScreen({ navigation }: Props) {
  const [stats, setStats] = useState<AdminDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getAdminDashboard()
      .then(setStats)
      .catch((e) => setError(e instanceof Error ? e.message : 'Imeshindwa kupakia dashibodi.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.adminNav}>
        <Text style={styles.adminNavTitle}>PANELI YA UDHIBITI (ADMIN)</Text>
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Msimamizi Mkuu</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {loading ? (
          <ActivityIndicator color={colors.gold} size="large" style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : stats ? (
          <>
            <Text style={styles.sectionTitle}>Takwimu za Moja kwa Moja</Text>
            <View style={styles.statGrid}>
              <StatCard label="Wanachama" value={stats.total_participants} />
              <StatCard label="Jozi Hai" value={stats.active_matches} />
              <StatCard label="Dhamira Zilizokamilika" value={stats.completed_missions} />
              <StatCard label="Vyeti Vilivyotolewa" value={stats.certificates_issued} />
              <StatCard label="Bara" value={stats.bara_participants} accent={colors.green} />
              <StatCard label="Visiwani" value={stats.visiwani_participants} accent={colors.blue} />
            </View>

            <View style={styles.connectionsCard}>
              <Text style={styles.connectionsTitle}>Miunganisho ya Hivi Karibuni</Text>
              {stats.recent_connections.slice(0, 6).map((c) => (
                <View key={c.id} style={styles.connectionRow}>
                  <Text style={styles.connectionText}>
                    {c.from_region} → {c.to_region}
                  </Text>
                </View>
              ))}
            </View>

            <Text style={styles.hint}>
              Django Admin (/admin/) inapatikana kwa usimamizi wa masomo, sauti za wazee, na roles.
            </Text>
          </>
        ) : null}

        <View style={{ marginTop: spacing.xl, alignItems: 'center', gap: 8 }}>
          <Button label="Angalia Ramani Hai" variant="secondary" onPress={() => navigation.navigate('UnionMap')} />
          <Button label="Rudi Dashibodi" variant="ghost" onPress={() => navigation.navigate('HubDashboard')} />
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
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 900, width: '100%', alignSelf: 'center' },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: colors.textMuted, textTransform: 'uppercase', marginBottom: spacing.md },
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
  connectionRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  connectionText: { fontSize: 13, color: colors.blueDeep, fontWeight: '600' },
  hint: { fontSize: 11, color: colors.textMuted, marginTop: spacing.lg, fontStyle: 'italic' },
  error: { color: colors.danger, textAlign: 'center', marginTop: 20 },
});
