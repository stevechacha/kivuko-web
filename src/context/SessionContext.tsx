import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import type { Participant } from '../api/client';

const STORAGE_KEY = 'kivuko_session';

interface StoredSession {
  participant: Participant | null;
  missionId: string | null;
  matchId: string | null;
}

interface SessionState {
  participant: Participant | null;
  missionId: string | null;
  matchId: string | null;
  setParticipant: (p: Participant | null) => void;
  updateParticipant: (patch: Partial<Participant>) => void;
  setMission: (missionId: string, matchId: string) => void;
  clearSession: () => void;
  hydrated: boolean;
}

const SessionContext = createContext<SessionState | null>(null);

function loadStored(): StoredSession {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') {
    return { participant: null, missionId: null, matchId: null };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { participant: null, missionId: null, matchId: null };
    return JSON.parse(raw) as StoredSession;
  } catch {
    return { participant: null, missionId: null, matchId: null };
  }
}

function saveStored(data: StoredSession) {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const initial = loadStored();
  const [participant, setParticipantState] = useState<Participant | null>(initial.participant);
  const [missionId, setMissionId] = useState<string | null>(initial.missionId);
  const [matchId, setMatchId] = useState<string | null>(initial.matchId);
  const [hydrated] = useState(true);

  const persist = useCallback((next: StoredSession) => {
    saveStored(next);
  }, []);

  const setParticipant = useCallback(
    (p: Participant | null) => {
      setParticipantState(p);
      if (!p) {
        setMissionId(null);
        setMatchId(null);
        persist({ participant: null, missionId: null, matchId: null });
        return;
      }
      setMissionId(null);
      setMatchId(null);
      persist({ participant: p, missionId: null, matchId: null });
    },
    [persist],
  );

  const updateParticipant = useCallback(
    (patch: Partial<Participant>) => {
      setParticipantState((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        persist({ participant: next, missionId, matchId });
        return next;
      });
    },
    [matchId, missionId, persist],
  );

  const setMission = useCallback(
    (mid: string, rid: string) => {
      setMissionId(mid);
      setMatchId(rid);
      persist({ participant, missionId: mid, matchId: rid });
    },
    [participant, persist],
  );

  const clearSession = useCallback(() => {
    setParticipantState(null);
    setMissionId(null);
    setMatchId(null);
    persist({ participant: null, missionId: null, matchId: null });
  }, [persist]);

  const value = useMemo<SessionState>(
    () => ({
      participant,
      missionId,
      matchId,
      setParticipant,
      updateParticipant,
      setMission,
      clearSession,
      hydrated,
    }),
    [participant, missionId, matchId, setParticipant, updateParticipant, setMission, clearSession, hydrated],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
