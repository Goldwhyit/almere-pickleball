import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export type TournamentRole = 'organizer' | 'player' | 'public';

export interface TournamentEventPayload {
  type: string;
  tournamentId: string;
  timestamp: string;
  data: any;
}

export const useTournamentSocket = (tournamentId: string, role: TournamentRole) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const cleanupTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Cancel any pending cleanup
    if (cleanupTimerRef.current) {
      clearTimeout(cleanupTimerRef.current);
      cleanupTimerRef.current = null;
    }

    // Reuse existing socket if available
    if (socketRef.current) {
      if (socketRef.current.connected) {
        setConnected(true);
        return;
      } else if (!socketRef.current.disconnected) {
        socketRef.current.connect();
        return;
      }
    }

    // Create new socket
    const socket = io(WS_URL, {
      path: '/socket.io',
      transports: ['polling', 'websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
      socket.emit('join-tournament', { tournamentId, role });
    });

    socket.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', error.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected:', reason);
      setConnected(false);
    });

    return () => {
      // Delay cleanup to handle React StrictMode
      cleanupTimerRef.current = setTimeout(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('leave-tournament', { tournamentId });
          socketRef.current.disconnect();
        }
        socketRef.current = null;
      }, 200);
    };
  }, [tournamentId, role]);

  return { socket: socketRef.current, connected };
};
