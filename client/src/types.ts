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

export interface RoomConfig {
  answerDuration: number;
  deliberationDuration: number;
  votingDuration: number;
  autoAdvanceReveals: boolean;
  categories: string[];
}

export interface RoundResultData {
  accusedPlayerId: string | null;
  votes: Record<string, string[]>;
  imposterPlayerId: string;
  wasImposterCaught: boolean;
  trueQuestion: string;
  imposterQuestion: string;
  scoreChanges: Record<string, number>;
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

