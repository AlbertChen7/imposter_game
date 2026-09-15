export type GamePhase =
  | 'LOBBY'
  | 'ANSWERING'
  | 'REVEAL_ANSWERS'
  | 'REVEAL_QUESTION'
  | 'DELIBERATION'
  | 'VOTING'
  | 'ROUND_RESULT';

export interface Player {
  id: string;
  socketId: string;
  name: string;
  avatar: string;
  color: string;
  isHost: boolean;
  score: number;
  connected: boolean;
}

export interface QuestionPair {
  id: string;
  category: string;
  trueQuestion: string;
  imposterQuestion: string;
}

export interface Answer {
  playerId: string;
  targetPlayerId: string;
}

export interface Vote {
  voterId: string;
  targetPlayerId: string;
}

export interface RoomConfig {
  answerDuration: number;        // in seconds (default 45)
  deliberationDuration: number;  // in seconds (default 60)
  votingDuration: number;        // in seconds (default 30)
  autoAdvanceReveals: boolean;   // default true (or host click)
  categories: string[];
}

export interface RoundResultData {
  accusedPlayerId: string | null;       // Player with majority votes, or null if tie
  votes: Record<string, string[]>;      // targetPlayerId -> voterIds[]
  imposterPlayerId: string;
  wasImposterCaught: boolean;
  trueQuestion: string;
  imposterQuestion: string;
  scoreChanges: Record<string, number>; // playerId -> points gained
}

export interface RoomPublicState {
  roomCode: string;
  phase: GamePhase;
  players: Player[];
  hostId: string;
  currentRound: number;
  totalRounds: number;
  config: RoomConfig;
  timer: {
    timeLeft: number;
    totalDuration: number;
  } | null;
  submittedPlayerIds: string[];
  revealedAnswers: {
    playerId: string;
    targetPlayerId: string;
  }[];
  trueQuestion: string | null;
  votedPlayerIds: string[];
  result: RoundResultData | null;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  playerColor: string;
  text: string;
  timestamp: number;
}

// Socket Events
export interface ClientToServerEvents {
  'room:create': (data: { playerName: string; avatar: string; color: string; playerId: string }) => void;
  'room:join': (data: { roomCode: string; playerName: string; avatar: string; color: string; playerId: string }) => void;
  'room:reconnect': (data: { roomCode: string; playerId: string }) => void;
  'room:update_config': (data: { config: Partial<RoomConfig> }) => void;
  'game:start': () => void;
  'game:submit_answer': (data: { targetPlayerId: string }) => void;
  'game:next_phase': () => void; // Host advance (e.g. advance reveal or skip deliberation)
  'game:submit_vote': (data: { targetPlayerId: string }) => void;
  'game:next_round': () => void;
  'game:return_lobby': () => void;
  'chat:send': (data: { text: string }) => void;
}

export interface ServerToClientEvents {
  'state:update': (state: RoomPublicState) => void;
  'player:prompt': (data: { prompt: string; round: number }) => void;
  'chat:message': (message: ChatMessage) => void;
  'error:msg': (data: { message: string }) => void;
}

