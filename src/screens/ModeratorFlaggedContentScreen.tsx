// ModeratorFlaggedContentScreen — Screen 6 from the proposal: pending story
// reviews / flagged chat messages awaiting moderator action. Link this from
// AdminDashboardScreen (e.g. a "Maudhui Yaliyoripotiwa" button/tab).
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { colors, radius, spacing } from '../theme/colors';
import Button from '../components/Button';
import LanguageToggle from '../components/LanguageToggle';
import { useLocale } from '../context/LocaleContext';
import { api, type ReportedItem } from '../api/client';

type Props = NativeStackScreenProps<RootStackParamList, 'ModeratorFlaggedContent'>;

type FilterTab = 'pending' | 'resolved';

const REASON_KEYS: Record<string, 'moderator.reasonAbusive' | 'moderator.reasonContact' | 'moderator.reasonInappropriate' | 'moderator.reasonOther'> = {
  abusive_language: 'moderator.reasonAbusive',
  contact_request: 'moderator.reasonContact',
  inappropriate_content: 'moderator.reasonInappropriate',
  other: 'moderator.reasonOther',
};

export default function ModeratorFlaggedContentScreen({ navigation }: Props) {
  const { t } = useLocale();
  const [tab, setTab] = useState<FilterTab>('pending');
  const [items, setItems] = useState<ReportedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    api
      .getReportedContent(tab)
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : t('moderator.loadError')))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const resolve = async (item: ReportedItem, action: 'dismiss' | 'warn' | 'suspend') => {
    setActingId(item.id);
    try {
      await api.resolveReport(item.id, action);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
    } catch (e) {
      Alert.alert(t('moderator.actionFailed'), e instanceof Error ? e.message : t('moderator.tryAgain'));
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = tab === 'pending' ? items.length : undefined;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.nav}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{t('moderator.back')}</Text>
        </Pressable>
        <Text style={styles.navTitle}>{t('moderator.navTitle')}</Text>
        <LanguageToggle />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.tabRow}>
          <FilterChip
            label={`${t('moderator.tabPending')}${pendingCount != null ? ` · ${pendingCount}` : ''}`}
            active={tab === 'pending'}
            accent={colors.dark}
            onPress={() => setTab('pending')}
          />
          <FilterChip
            label={t('moderator.tabResolved')}
            active={tab === 'resolved'}
            accent={colors.textMuted}
            onPress={() => setTab('resolved')}
          />
        </View>

        {loading ? (
          <ActivityIndicator color={colors.green} style={{ marginTop: 40 }} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>✓</Text>
            <Text style={styles.emptyTitle}>
              {tab === 'pending' ? t('moderator.emptyPending') : t('moderator.emptyResolved')}
            </Text>
          </View>
        ) : (
          <View style={{ gap: 10 }}>
            {items.map((item) => (
              <View key={item.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>
                      {item.reported_name} → {item.reporter_name} · {item.mission_title}
                    </Text>
                    <Text style={styles.cardMeta}>
                      {t('moderator.reportedAt', { when: item.reported_at_label })}
                    </Text>
                  </View>
                  <View style={styles.reasonBadge}>
                    <Text style={styles.reasonBadgeText}>
                      {REASON_KEYS[item.reason] ? t(REASON_KEYS[item.reason]) : item.reason}
                    </Text>
                  </View>
                </View>

                {item.excerpt ? (
                  <View style={styles.excerptBox}>
                    <Text style={styles.excerptText}>{item.excerpt}</Text>
                  </View>
                ) : null}

                {tab === 'pending' && (
                  <View style={styles.actionRow}>
                    <ActionBtn
                      label={t('moderator.dismissLabel')}
                      variant="ghost"
                      loading={actingId === item.id}
                      onPress={() => resolve(item, 'dismiss')}
                    />
                    <ActionBtn
                      label={t('moderator.warnUser')}
                      variant="warn"
                      loading={actingId === item.id}
                      onPress={() => resolve(item, 'warn')}
                    />
                    <ActionBtn
                      label={t('moderator.suspendAccount')}
                      variant="danger"
                      loading={actingId === item.id}
                      onPress={() =>
                        Alert.alert(
                          t('moderator.suspendConfirmTitle'),
                          t('moderator.suspendConfirmBody', { name: item.reported_name }),
                          [
                            { text: t('common.cancel'), style: 'cancel' },
                            { text: t('moderator.suspendBtn'), style: 'destructive', onPress: () => resolve(item, 'suspend') },
                          ]
                        )
                      }
                    />
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        <View style={{ marginTop: spacing.xl, alignItems: 'center' }}>
          <Button label={t('moderator.backAdmin')} variant="ghost" onPress={() => navigation.navigate('AdminDashboard')} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function FilterChip({ label, active, accent, onPress }: { label: string; active: boolean; accent: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && { backgroundColor: accent, borderColor: accent }]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ActionBtn({
  label,
  variant,
  loading,
  onPress,
}: {
  label: string;
  variant: 'ghost' | 'warn' | 'danger';
  loading: boolean;
  onPress: () => void;
}) {
  const variantStyle =
    variant === 'ghost' ? styles.actionGhost : variant === 'warn' ? styles.actionWarn : styles.actionDanger;
  const textStyle =
    variant === 'ghost' ? styles.actionGhostText : variant === 'warn' ? styles.actionWarnText : styles.actionDangerText;
  return (
    <Pressable style={[styles.actionBtn, variantStyle]} onPress={onPress} disabled={loading}>
      {loading ? <ActivityIndicator size="small" color={colors.textMuted} /> : <Text style={textStyle}>{label}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F1F5F9' },
  nav: {
    backgroundColor: colors.dark,
    borderBottomWidth: 4,
    borderBottomColor: colors.gold,
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: { width: 56 },
  backBtnText: { color: colors.white, fontSize: 13, fontWeight: '600' },
  navTitle: { color: colors.white, fontWeight: '800', fontSize: 13 },
  scroll: { padding: spacing.lg, paddingBottom: 60, maxWidth: 900, width: '100%', alignSelf: 'center' },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: spacing.md },
  chip: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: colors.white,
  },
  chipText: { fontSize: 12, fontWeight: '700', color: colors.textMuted },
  chipTextActive: { color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.line, padding: spacing.md },
  cardHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.dark },
  cardMeta: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  reasonBadge: { backgroundColor: '#FDF0EE', borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 3 },
  reasonBadgeText: { fontSize: 10, fontWeight: '700', color: '#993C1D' },
  excerptBox: { backgroundColor: '#F8F7F3', borderRadius: 8, padding: 10, marginTop: 10 },
  excerptText: { fontSize: 12.5, color: colors.textMuted, lineHeight: 18, fontStyle: 'italic' },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, borderRadius: 8, paddingVertical: 9, alignItems: 'center' },
  actionGhost: { borderWidth: 1, borderColor: colors.line, backgroundColor: 'transparent' },
  actionGhostText: { fontSize: 11.5, color: colors.textMuted, fontWeight: '600' },
  actionWarn: { borderWidth: 1, borderColor: colors.gold, backgroundColor: 'transparent' },
  actionWarnText: { fontSize: 11.5, color: '#7A5E00', fontWeight: '700' },
  actionDanger: { backgroundColor: colors.danger },
  actionDangerText: { fontSize: 11.5, color: colors.white, fontWeight: '700' },
  emptyWrap: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon: { fontSize: 32, color: colors.green },
  emptyTitle: { fontSize: 13.5, color: colors.textMuted, marginTop: 10, fontWeight: '600' },
  error: { color: colors.danger, textAlign: 'center', marginTop: 20 },
});
