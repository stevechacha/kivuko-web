// components/ReportModal.tsx
// Bottom-sheet report flow used inside MissionChatScreen (and anywhere a user
// can flag another user's content). Matches the safety design described in
// Chapter Four of the proposal: visible Report action in every chat, no
// direct contact between reporter/reported, moderator review afterwards.
import React, { useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, spacing } from '../theme/colors';

export type ReportReasonId = 'abusive_language' | 'contact_request' | 'inappropriate_content' | 'other';

const REASONS: { id: ReportReasonId; label: string }[] = [
  { id: 'abusive_language', label: 'Lugha ya matusi au chuki' },
  { id: 'contact_request', label: 'Kuomba namba ya simu au mawasiliano nje ya jukwaa' },
  { id: 'inappropriate_content', label: 'Maudhui yasiyofaa au ya kutisha' },
  { id: 'other', label: 'Sababu nyingine' },
];

type Props = {
  visible: boolean;
  peerName: string;
  onClose: () => void;
  onSubmit: (reason: ReportReasonId) => Promise<void> | void;
};

export default function ReportModal({ visible, peerName, onClose, onSubmit }: Props) {
  const [selected, setSelected] = useState<ReportReasonId | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const reset = () => {
    setSelected(null);
    setSubmitting(false);
    setDone(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!selected || submitting) return;
    setSubmitting(true);
    try {
      await onSubmit(selected);
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          {done ? (
            <View style={styles.doneWrap}>
              <View style={styles.doneIcon}>
                <Text style={{ fontSize: 22, color: colors.white }}>✓</Text>
              </View>
              <Text style={styles.doneTitle}>Ripoti Imetumwa</Text>
              <Text style={styles.doneBody}>
                Asante. Timu ya usalama itapitia ndani ya saa 24. {peerName.split(' ')[0]} hataarifiwa kuwa umeripoti.
              </Text>
              <Pressable style={styles.doneBtn} onPress={handleClose}>
                <Text style={styles.doneBtnText}>Funga</Text>
              </Pressable>
            </View>
          ) : (
            <>
              <Text style={styles.title}>Ripoti Mazungumzo Haya</Text>
              <Text style={styles.subtitle}>
                Msimamizi ataangalia ndani ya saa 24. {peerName.split(' ')[0]} hataarifiwa kuwa umeripoti.
              </Text>

              <View style={styles.reasonList}>
                {REASONS.map((r) => (
                  <Pressable
                    key={r.id}
                    style={styles.reasonRow}
                    onPress={() => setSelected(r.id)}
                  >
                    <View style={[styles.radio, selected === r.id && styles.radioActive]}>
                      {selected === r.id && <View style={styles.radioDot} />}
                    </View>
                    <Text style={styles.reasonLabel}>{r.label}</Text>
                  </Pressable>
                ))}
              </View>

              {submitting ? (
                <ActivityIndicator color={colors.danger} style={{ marginTop: spacing.md }} />
              ) : (
                <Pressable
                  style={[styles.submitBtn, !selected && styles.submitBtnDisabled]}
                  onPress={handleSubmit}
                  disabled={!selected}
                >
                  <Text style={styles.submitBtnText}>Wasilisha Ripoti</Text>
                </Pressable>
              )}
              <Pressable style={styles.cancelBtn} onPress={handleClose}>
                <Text style={styles.cancelBtnText}>Ghairi</Text>
              </Pressable>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(26,26,26,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.lg,
    paddingBottom: 28,
  },
  grabber: { width: 36, height: 4, borderRadius: 2, backgroundColor: colors.line, alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 16, fontWeight: '700', color: colors.dark },
  subtitle: { fontSize: 12.5, color: colors.textMuted, marginTop: 6, lineHeight: 18 },
  reasonList: { marginTop: 16 },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: colors.danger },
  radioDot: { width: 9, height: 9, borderRadius: 4.5, backgroundColor: colors.danger },
  reasonLabel: { flex: 1, fontSize: 13.5, color: colors.dark, lineHeight: 19 },
  submitBtn: {
    backgroundColor: colors.danger,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 18,
  },
  submitBtnDisabled: { opacity: 0.45 },
  submitBtnText: { color: colors.white, fontWeight: '700', fontSize: 13.5 },
  cancelBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 2 },
  cancelBtnText: { color: colors.textMuted, fontSize: 13, fontWeight: '600' },
  doneWrap: { alignItems: 'center', paddingVertical: 12 },
  doneIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.green,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  doneTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  doneBody: { fontSize: 13, color: colors.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 19, maxWidth: 280 },
  doneBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 28, borderRadius: radius.md, backgroundColor: '#F4F7F6' },
  doneBtnText: { color: colors.dark, fontWeight: '700', fontSize: 13.5 },
});
