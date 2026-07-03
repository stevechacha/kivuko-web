import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { resolveWsBaseUrl } from '../config/api';
import type { ChatMessage } from '../api/client';

type Options = {
  missionId: string | null;
  token: string | null | undefined;
  enabled: boolean;
  onMessage?: (message: ChatMessage) => void;
};

export function useMissionChatSocket({ missionId, token, enabled, onMessage }: Options) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const send = useCallback(
    (text: string) => {
      const ws = socketRef.current;
      if (!ws || ws.readyState !== WebSocket.OPEN) return false;
      ws.send(JSON.stringify({ type: 'send_message', text }));
      return true;
    },
    [],
  );

  useEffect(() => {
    if (!enabled || Platform.OS !== 'web' || !missionId || !token) {
      setConnected(false);
      return undefined;
    }

    const wsUrl = `${resolveWsBaseUrl()}/ws/missions/${missionId}/chat/?token=${encodeURIComponent(token)}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);
    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string) as ChatMessage & { type?: string };
        if (payload.type === 'message' || payload.from_role) {
          onMessageRef.current?.({
            id: payload.id,
            from_role: payload.from_role,
            text: payload.text,
            created_at: payload.created_at,
          });
        }
      } catch {
        // ignore malformed frames
      }
    };

    return () => {
      ws.close();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, missionId, token]);

  return { connected, send };
}
