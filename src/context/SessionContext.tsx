import React, { createContext, useContext, useMemo, useState } from 'react';
import type { Participant } from '../api/client';

interface SessionState {
  participant: Participant | null;
  missionId: string | null;
  matchId: string | null;
  setParticipant: (p: Participant | null) => void;
  setMission: (missionId: string, matchId: string) => void;
  clearSession: () => void;
}

const SessionContext = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [missionId, setMissionId] = useState<string | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  const value = useMemo<SessionState>(
    () => ({
      participant,
      missionId,
      matchId,
      setParticipant,
      setMission: (mid, rid) => {
        setMissionId(mid);
        setMatchId(rid);
      },
      clearSession: () => {
        setParticipant(null);
        setMissionId(null);
        setMatchId(null);
      },
    }),
    [participant, missionId, matchId],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
