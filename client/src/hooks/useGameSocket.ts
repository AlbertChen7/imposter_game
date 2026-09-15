import { useEffect, useState, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { RoomPublicState, ChatMessage, RoomConfig } from '../types.js';
import { sound } from '../utils/audio.js';

// Get or create unique player ID per tab (sessionStorage ensures each tab is an independent player)
function getStoredPlayerId(): string {
  let id = sessionStorage.getItem('imposter_player_id');
  if (!id) {
    id = 'p_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    sessionStorage.setItem('imposter_player_id', id);
  }
  return id;
}

export function useGameSocket() {
  const [gameState, setGameState] = useState<RoomPublicState | null>(null);
  const [myPrompt, setMyPrompt] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const playerIdRef = useRef<string>(getStoredPlayerId());

  // Detect previous phase to trigger sound effects
  const prevPhaseRef = useRef<string | null>(null);
  const prevTimerRef = useRef<number | null>(null);

  useEffect(() => {
    // In local development (Vite dev server), backend runs on port 3001.
    // In production (served by Express or deployed to cloud), connect to window.location.origin
    // or use custom VITE_BACKEND_URL if specified.
    const socketUrl = import.meta.env.VITE_BACKEND_URL || (
      import.meta.env.DEV
        ? (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
            ? 'http://localhost:3001'
            : `http://${window.location.hostname}:3001`)
        : window.location.origin
    );

    const socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      // Auto-reconnect if URL or sessionStorage has room code
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get('room') || params.get('code');
      const savedCode = sessionStorage.getItem('imposter_room_code') || urlCode;
      if (savedCode) {
        socket.emit('room:reconnect', {
          roomCode: savedCode,
          playerId: playerIdRef.current,
        });
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('state:update', (state: RoomPublicState) => {
      setGameState(state);
      sessionStorage.setItem('imposter_room_code', state.roomCode);

      // Play audio cues on phase transitions
      if (prevPhaseRef.current !== state.phase) {
        if (state.phase === 'REVEAL_ANSWERS') {
          sound.playReveal();
        } else if (state.phase === 'REVEAL_QUESTION') {
          sound.playGong();
        } else if (state.phase === 'ROUND_RESULT') {
          if (state.result?.wasImposterCaught) {
            sound.playWin();
          } else {
            sound.playBuzzer();
          }
        }
        prevPhaseRef.current = state.phase;
      }

      // Play tick sound when timer is low (< 5s)
      if (state.timer && state.timer.timeLeft <= 5 && state.timer.timeLeft > 0) {
        if (prevTimerRef.current !== state.timer.timeLeft) {
          sound.playTick();
          prevTimerRef.current = state.timer.timeLeft;
        }
      }
    });

    socket.on('player:prompt', (data: { prompt: string; round: number }) => {
      setMyPrompt(data.prompt);
    });

    socket.on('chat:message', (msg: ChatMessage) => {
      setMessages((prev) => [...prev.slice(-49), msg]);
    });

    socket.on('error:msg', (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // Actions
  const createRoom = useCallback((playerName: string, avatar: string, color: string) => {
    setError(null);
    socketRef.current?.emit('room:create', {
      playerName,
      avatar,
      color,
      playerId: playerIdRef.current,
    });
  }, []);

  const joinRoom = useCallback((roomCode: string, playerName: string, avatar: string, color: string) => {
    setError(null);
    socketRef.current?.emit('room:join', {
      roomCode: roomCode.toUpperCase().trim(),
      playerName,
      avatar,
      color,
      playerId: playerIdRef.current,
    });
  }, []);

  const updateConfig = useCallback((config: Partial<RoomConfig>) => {
    socketRef.current?.emit('room:update_config', { config });
  }, []);

  const startGame = useCallback(() => {
    socketRef.current?.emit('game:start');
  }, []);

  const submitAnswer = useCallback((targetPlayerId: string) => {
    sound.playSelect();
    socketRef.current?.emit('game:submit_answer', { targetPlayerId });
  }, []);

  const nextPhase = useCallback(() => {
    sound.playSelect();
    socketRef.current?.emit('game:next_phase');
  }, []);

  const submitVote = useCallback((targetPlayerId: string) => {
    sound.playSelect();
    socketRef.current?.emit('game:submit_vote', { targetPlayerId });
  }, []);

  const nextRound = useCallback(() => {
    sound.playSelect();
    socketRef.current?.emit('game:next_round');
  }, []);

  const returnToLobby = useCallback(() => {
    sound.playSelect();
    socketRef.current?.emit('game:return_lobby');
  }, []);

  const sendChat = useCallback((text: string) => {
    socketRef.current?.emit('chat:send', { text });
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const leaveRoom = useCallback(() => {
    sessionStorage.removeItem('imposter_room_code');
    setGameState(null);
    setMyPrompt(null);
    window.location.search = '';
  }, []);

  const currentPlayer = gameState?.players.find((p) => p.id === playerIdRef.current) || null;
  const isHost = currentPlayer?.isHost || false;

  return {
    playerId: playerIdRef.current,
    currentPlayer,
    isHost,
    gameState,
    myPrompt,
    messages,
    error,
    isConnected,
    createRoom,
    joinRoom,
    updateConfig,
    startGame,
    submitAnswer,
    nextPhase,
    submitVote,
    nextRound,
    returnToLobby,
    sendChat,
    clearError,
    leaveRoom,
  };
}

