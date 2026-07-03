import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';
import { api } from '../api/client';
import { useSession } from '../context/SessionContext';
import { useLocale } from '../context/LocaleContext';

type Props = {
  onRated?: (avg: number | null) => void;
};

export default function PeerRatingCard({ onRated }: Props) {
  const { participant, missionId } = useSession();
  const { t } = useLocale();
  const [stars, setStars] = useState(0);
  const [done, setDone] = useState(false);
  const [trustAvg, setTrustAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (value: number) => {
    if (!missionId || !participant?.session_token || loading || done) return;
    setStars(value);
    setLoading(true);
    try {
      const res = await api.submitPeerRating(missionId, value, '', participant.session_token);
      setTrustAvg(res.peer_trust_avg ?? null);
      setDone(true);
      onRated?.(res.peer_trust_avg ?? null);
    } catch {
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  if (!missionId) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{t('peerRate.title')}</Text>
      <Text style={styles.sub}>{t('peerRate.sub')}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => submit(n)} disabled={done || loading}>
            <Text style={[styles.star, (done ? stars : 0) >= n && styles.starOn]}>
              {(done ? stars : 0) >= n ? '★' : '☆'}
            </Text>
          </Pressable>
        ))}
      </View>
      {done ? (
        <Text style={styles.thanks}>
          {t('peerRate.thanks')}
          {trustAvg != null ? ` · ${t('peerRate.trust', { avg: trustAvg })}` : ''}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
  },
  title: { fontSize: 14, fontWeight: '800', color: colors.dark },
  sub: { fontSize: 11, color: colors.textMuted, marginTop: 4, lineHeight: 16 },
  stars: { flexDirection: 'row', gap: 8, marginTop: 12 },
  star: { fontSize: 28, color: colors.line },
  starOn: { color: colors.gold },
  thanks: { fontSize: 11, color: colors.green, marginTop: 10, fontWeight: '700' },
});
