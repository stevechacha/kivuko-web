import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Platform } from 'react-native';
import { api, type Participant, type Peer, type SessionResponse } from '../api/client';

const STORAGE_KEY = 'kivuko_session';

interface StoredSession {
  participant: Participant | null;
  missionId: string | null;
  matchId: string | null;
  peer: Peer | null;
}

interface SessionState {
  participant: Participant | null;
  missionId: string | null;
  matchId: string | null;
  peer: Peer | null;
  setParticipant: (p: Participant | null) => void;
  applySession: (session: SessionResponse) => void;
  updateParticipant: (patch: Partial<Participant>) => void;
  setMission: (missionId: string, matchId: string, peer?: Peer | null) => void;
  clearSession: () => void;
  hydrated: boolean;
  refreshing: boolean;
}

const SessionContext = createContext<SessionState | null>(null);

function loadStored(): StoredSession {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') {
    return { participant: null, missionId: null, matchId: null, peer: null };
  }
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return { participant: null, missionId: null, matchId: null, peer: null };
    const parsed = JSON.parse(raw) as StoredSession;
    return { ...parsed, peer: parsed.peer ?? null };
  } catch {
    return { participant: null, missionId: null, matchId: null, peer: null };
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
  const [peer, setPeer] = useState<Peer | null>(initial.peer);
  const [hydrated, setHydrated] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const persist = useCallback((next: StoredSession) => {
    saveStored(next);
  }, []);

  const applySession = useCallback(
    (session: SessionResponse) => {
      const nextMissionId = session.active_mission_id;
      const nextMatchId = session.active_match_id;
      setParticipantState(session.participant);
      setMissionId(nextMissionId);
      setMatchId(nextMatchId);
      setPeer((prevPeer) => {
        persist({
          participant: session.participant,
          missionId: nextMissionId,
          matchId: nextMatchId,
          peer: prevPeer,
        });
        return prevPeer;
      });
    },
    [persist],
  );

  useEffect(() => {
    let cancelled = false;

    async function refreshFromApi() {
      const token = initial.participant?.session_token;
      if (!token) {
        setHydrated(true);
        return;
      }

      setRefreshing(true);
      try {
        const session = await api.getMe(token);
        if (!cancelled) {
          applySession(session);
        }
      } catch {
        if (!cancelled) {
          setParticipantState(null);
          setMissionId(null);
          setMatchId(null);
          setPeer(null);
          persist({ participant: null, missionId: null, matchId: null, peer: null });
        }
      } finally {
        if (!cancelled) {
          setRefreshing(false);
          setHydrated(true);
        }
      }
    }

    refreshFromApi();
    return () => {
      cancelled = true;
    };
  }, [applySession, initial.participant?.session_token, persist]);

  const setParticipant = useCallback(
    (p: Participant | null) => {
      setParticipantState(p);
      if (!p) {
        setMissionId(null);
        setMatchId(null);
        setPeer(null);
        persist({ participant: null, missionId: null, matchId: null, peer: null });
        return;
      }
      setMissionId(null);
      setMatchId(null);
      setPeer(null);
      persist({ participant: p, missionId: null, matchId: null, peer: null });
    },
    [persist],
  );

  const updateParticipant = useCallback(
    (patch: Partial<Participant>) => {
      setParticipantState((prev) => {
        if (!prev) return prev;
        const next = { ...prev, ...patch };
        persist({ participant: next, missionId, matchId, peer });
        return next;
      });
    },
    [matchId, missionId, peer, persist],
  );

  const setMission = useCallback(
    (mid: string, rid: string, nextPeer?: Peer | null) => {
      setMissionId(mid);
      setMatchId(rid);
      if (nextPeer !== undefined) setPeer(nextPeer);
      persist({
        participant,
        missionId: mid,
        matchId: rid,
        peer: nextPeer !== undefined ? nextPeer : peer,
      });
    },
    [participant, peer, persist],
  );

  const clearSession = useCallback(() => {
    setParticipantState(null);
    setMissionId(null);
    setMatchId(null);
    setPeer(null);
    persist({ participant: null, missionId: null, matchId: null, peer: null });
  }, [persist]);

  const value = useMemo<SessionState>(
    () => ({
      participant,
      missionId,
      matchId,
      peer,
      setParticipant,
      applySession,
      updateParticipant,
      setMission,
      clearSession,
      hydrated,
      refreshing,
    }),
    [
      participant,
      missionId,
      matchId,
      peer,
      setParticipant,
      applySession,
      updateParticipant,
      setMission,
      clearSession,
      hydrated,
      refreshing,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
