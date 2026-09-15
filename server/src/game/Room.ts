import { Server } from 'socket.io';
import {
  GamePhase,
  Player,
  QuestionPair,
  Answer,
  Vote,
  RoomConfig,
  RoomPublicState,
  RoundResultData,
  ChatMessage
} from '../types.js';
import { getRandomQuestionPair } from './questions.js';

export class Room {
  public code: string;
  public phase: GamePhase = 'LOBBY';
  public players: Map<string, Player> = new Map(); // playerId -> Player
  public hostId: string = '';
  public currentRound: number = 0;
  public totalRounds: number = 5;
  
  public config: RoomConfig = {
    answerDuration: 45,
    deliberationDuration: 60,
    votingDuration: 30,
    autoAdvanceReveals: true,
    categories: ['survival', 'ambition', 'party', 'spicy', 'chaos']
  };

  // Round specific state
  public currentQuestionPair: QuestionPair | null = null;
  public imposterPlayerId: string = '';
  public answers: Map<string, Answer> = new Map(); // playerId -> Answer
  public votes: Map<string, Vote> = new Map(); // voterId -> Vote
  public usedQuestionIds: string[] = [];
  public roundResult: RoundResultData | null = null;

  // Timers
  private timerHandle: NodeJS.Timeout | null = null;
  private timerInterval: NodeJS.Timeout | null = null;
  public timeLeft: number = 0;
  public totalDuration: number = 0;

  private io: Server;

  constructor(code: string, io: Server) {
    this.code = code;
    this.io = io;
  }

  // --- PLAYER MANAGEMENT ---

  public addPlayer(player: { id: string; socketId: string; name: string; avatar: string; color: string }): Player {
    const isFirstPlayer = this.players.size === 0;
    if (isFirstPlayer) {
      this.hostId = player.id;
    }

    const newPlayer: Player = {
      id: player.id,
      socketId: player.socketId,
      name: player.name.trim().slice(0, 16) || 'Player',
      avatar: player.avatar,
      color: player.color,
      isHost: isFirstPlayer || player.id === this.hostId,
      score: 0,
      connected: true,
    };

    this.players.set(player.id, newPlayer);
    this.broadcastState();
    return newPlayer;
  }

  public reconnectPlayer(playerId: string, newSocketId: string): boolean {
    const player = this.players.get(playerId);
    if (!player) return false;

    player.socketId = newSocketId;
    player.connected = true;

    // Send prompt if in ANSWERING phase
    if (this.phase === 'ANSWERING' && this.currentQuestionPair) {
      const isImposter = player.id === this.imposterPlayerId;
      const prompt = isImposter
        ? this.currentQuestionPair.imposterQuestion
        : this.currentQuestionPair.trueQuestion;

      this.io.to(newSocketId).emit('player:prompt', {
        prompt,
        round: this.currentRound
      });
    }

    this.broadcastState();
    return true;
  }

  public removePlayer(playerId: string) {
    const player = this.players.get(playerId);
    if (!player) return;

    player.connected = false;

    // If in lobby, remove completely
    if (this.phase === 'LOBBY') {
      this.players.delete(playerId);
      if (this.hostId === playerId) {
        const nextHost = Array.from(this.players.values()).find(p => p.connected);
        if (nextHost) {
          this.hostId = nextHost.id;
          nextHost.isHost = true;
        }
      }
    } else {
      // If mid-game host disconnects, reassign host
      if (this.hostId === playerId) {
        const nextHost = Array.from(this.players.values()).find(p => p.connected);
        if (nextHost) {
          this.hostId = nextHost.id;
          nextHost.isHost = true;
        }
      }

      // Check if answering or voting can complete early
      if (this.phase === 'ANSWERING') {
        this.checkAllAnswersSubmitted();
      } else if (this.phase === 'VOTING') {
        this.checkAllVotesSubmitted();
      }
    }

    this.broadcastState();
  }

  public updateConfig(newConfig: Partial<RoomConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.broadcastState();
  }

  // --- GAME FLOW ---

  public startGame(): boolean {
    const activePlayers = this.getActivePlayers();
    if (activePlayers.length < 3) {
      return false;
    }

    this.currentRound = 0;
    // Reset all scores
    for (const player of this.players.values()) {
      player.score = 0;
    }
    this.startRound();
    return true;
  }

  public startRound() {
    this.clearTimer();
    this.currentRound++;
    this.phase = 'ANSWERING';
    this.answers.clear();
    this.votes.clear();
    this.roundResult = null;

    // Select random Imposter
    const activePlayers = this.getActivePlayers();
    const imposterIndex = Math.floor(Math.random() * activePlayers.length);
    this.imposterPlayerId = activePlayers[imposterIndex].id;

    // Select question pair
    this.currentQuestionPair = getRandomQuestionPair(this.usedQuestionIds, this.config.categories);
    this.usedQuestionIds.push(this.currentQuestionPair.id);

    // Send secret prompts to each individual player
    for (const player of activePlayers) {
      const isImposter = player.id === this.imposterPlayerId;
      const prompt = isImposter
        ? this.currentQuestionPair.imposterQuestion
        : this.currentQuestionPair.trueQuestion;

      this.io.to(player.socketId).emit('player:prompt', {
        prompt,
        round: this.currentRound
      });
    }

    // Start Answering timer
    this.startCountdown(this.config.answerDuration, () => {
      this.finishAnswering();
    });

    this.broadcastState();
  }

  public submitAnswer(playerId: string, targetPlayerId: string) {
    if (this.phase !== 'ANSWERING') return;
    if (!this.players.has(playerId) || !this.players.has(targetPlayerId)) return;

    this.answers.set(playerId, { playerId, targetPlayerId });
    this.broadcastState();
    this.checkAllAnswersSubmitted();
  }

  private checkAllAnswersSubmitted() {
    const activePlayers = this.getActivePlayers();
    const allSubmitted = activePlayers.every(p => this.answers.has(p.id));
    if (allSubmitted && activePlayers.length >= 3) {
      this.finishAnswering();
    }
  }

  private finishAnswering() {
    this.clearTimer();

    // Fill in default answers for any active player who timed out
    const activePlayers = this.getActivePlayers();
    for (const p of activePlayers) {
      if (!this.answers.has(p.id)) {
        // Pick random other player
        const others = activePlayers.filter(o => o.id !== p.id);
        const randomTarget = others[Math.floor(Math.random() * others.length)] || p;
        this.answers.set(p.id, { playerId: p.id, targetPlayerId: randomTarget.id });
      }
    }

    // Move to STAGE 1: REVEAL_ANSWERS
    this.phase = 'REVEAL_ANSWERS';

    if (this.config.autoAdvanceReveals) {
      // Give players 8 seconds to review who picked whom before showing the true prompt
      this.startCountdown(8, () => {
        this.revealTrueQuestion();
      });
    }

    this.broadcastState();
  }

  public revealTrueQuestion() {
    this.clearTimer();
    // Move to STAGE 2: REVEAL_QUESTION
    this.phase = 'REVEAL_QUESTION';

    if (this.config.autoAdvanceReveals) {
      // Give 6 seconds for the "Aha!" moment of seeing the true question
      this.startCountdown(6, () => {
        this.startDeliberation();
      });
    }

    this.broadcastState();
  }

  public startDeliberation() {
    this.clearTimer();
    this.phase = 'DELIBERATION';

    this.startCountdown(this.config.deliberationDuration, () => {
      this.startVoting();
    });

    this.broadcastState();
  }

  public startVoting() {
    this.clearTimer();
    this.phase = 'VOTING';
    this.votes.clear();

    this.startCountdown(this.config.votingDuration, () => {
      this.finishVoting();
    });

    this.broadcastState();
  }

  public submitVote(voterId: string, targetPlayerId: string) {
    if (this.phase !== 'VOTING') return;
    if (!this.players.has(voterId) || !this.players.has(targetPlayerId)) return;
    if (voterId === targetPlayerId) return; // Cannot vote for yourself

    this.votes.set(voterId, { voterId, targetPlayerId });
    this.broadcastState();
    this.checkAllVotesSubmitted();
  }

  private checkAllVotesSubmitted() {
    const activePlayers = this.getActivePlayers();
    const allVoted = activePlayers.every(p => this.votes.has(p.id));
    if (allVoted && activePlayers.length >= 3) {
      this.finishVoting();
    }
  }

  private finishVoting() {
    this.clearTimer();
    this.phase = 'ROUND_RESULT';

    // Tally votes: targetId -> voterIds[]
    const voteTally: Record<string, string[]> = {};
    for (const player of this.players.values()) {
      voteTally[player.id] = [];
    }
    for (const vote of this.votes.values()) {
      if (!voteTally[vote.targetPlayerId]) {
        voteTally[vote.targetPlayerId] = [];
      }
      voteTally[vote.targetPlayerId].push(vote.voterId);
    }

    // Determine highest vote recipient
    let maxVotes = -1;
    let accusedPlayerId: string | null = null;
    let isTie = false;

    for (const [targetId, voters] of Object.entries(voteTally)) {
      if (voters.length > maxVotes) {
        maxVotes = voters.length;
        accusedPlayerId = targetId;
        isTie = false;
      } else if (voters.length === maxVotes && maxVotes > 0) {
        isTie = true;
      }
    }

    // In case of a tie or zero votes, nobody was conclusively convicted
    if (isTie || maxVotes <= 0) {
      accusedPlayerId = null;
    }

    const wasImposterCaught = accusedPlayerId === this.imposterPlayerId;
    const scoreChanges: Record<string, number> = {};

    for (const player of this.players.values()) {
      scoreChanges[player.id] = 0;
    }

    if (wasImposterCaught) {
      // Crew Wins!
      for (const player of this.getActivePlayers()) {
        if (player.id !== this.imposterPlayerId) {
          // Bonus if they voted correctly
          const vote = this.votes.get(player.id);
          const votedCorrectly = vote && vote.targetPlayerId === this.imposterPlayerId;
          const points = votedCorrectly ? 150 : 75;
          scoreChanges[player.id] = points;
          player.score += points;
        }
      }
    } else {
      // Imposter Wins! (Escaped detection)
      const imposterPlayer = this.players.get(this.imposterPlayerId);
      if (imposterPlayer) {
        const points = 250;
        scoreChanges[this.imposterPlayerId] = points;
        imposterPlayer.score += points;
      }
    }

    this.roundResult = {
      accusedPlayerId,
      votes: voteTally,
      imposterPlayerId: this.imposterPlayerId,
      wasImposterCaught,
      trueQuestion: this.currentQuestionPair ? this.currentQuestionPair.trueQuestion : '',
      imposterQuestion: this.currentQuestionPair ? this.currentQuestionPair.imposterQuestion : '',
      scoreChanges
    };

    this.broadcastState();
  }

  // Host manual phase advance (e.g. Skip Reveal countdown or Skip Deliberation)
  public handleHostNextPhase() {
    if (this.phase === 'REVEAL_ANSWERS') {
      this.revealTrueQuestion();
    } else if (this.phase === 'REVEAL_QUESTION') {
      this.startDeliberation();
    } else if (this.phase === 'DELIBERATION') {
      this.startVoting();
    }
  }

  public nextRound() {
    this.startRound();
  }

  public returnToLobby() {
    this.clearTimer();
    this.phase = 'LOBBY';
    this.currentRound = 0;
    this.answers.clear();
    this.votes.clear();
    this.roundResult = null;
    this.broadcastState();
  }

  // --- HELPERS & TIMERS ---

  private getActivePlayers(): Player[] {
    return Array.from(this.players.values()).filter(p => p.connected);
  }

  private startCountdown(seconds: number, onComplete: () => void) {
    this.clearTimer();
    this.totalDuration = seconds;
    this.timeLeft = seconds;

    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.clearTimer();
        onComplete();
      } else {
        this.broadcastState();
      }
    }, 1000);
  }

  private clearTimer() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.timerHandle) {
      clearTimeout(this.timerHandle);
      this.timerHandle = null;
    }
    this.timeLeft = 0;
    this.totalDuration = 0;
  }

  public broadcastChatMessage(chat: ChatMessage) {
    this.io.to(this.code).emit('chat:message', chat);
  }

  public broadcastState() {
    const state = this.getPublicState();
    this.io.to(this.code).emit('state:update', state);
  }

  public getPublicState(): RoomPublicState {
    const revealedAnswersList: { playerId: string; targetPlayerId: string }[] = [];
    if (
      this.phase === 'REVEAL_ANSWERS' ||
      this.phase === 'REVEAL_QUESTION' ||
      this.phase === 'DELIBERATION' ||
      this.phase === 'VOTING' ||
      this.phase === 'ROUND_RESULT'
    ) {
      for (const [playerId, ans] of this.answers.entries()) {
        revealedAnswersList.push({
          playerId,
          targetPlayerId: ans.targetPlayerId
        });
      }
    }

    const showTrueQuestion = (
      this.phase === 'REVEAL_QUESTION' ||
      this.phase === 'DELIBERATION' ||
      this.phase === 'VOTING' ||
      this.phase === 'ROUND_RESULT'
    ) && this.currentQuestionPair !== null;

    return {
      roomCode: this.code,
      phase: this.phase,
      players: Array.from(this.players.values()),
      hostId: this.hostId,
      currentRound: this.currentRound,
      totalRounds: this.totalRounds,
      config: this.config,
      timer: this.totalDuration > 0 ? {
        timeLeft: this.timeLeft,
        totalDuration: this.totalDuration
      } : null,
      submittedPlayerIds: Array.from(this.answers.keys()),
      revealedAnswers: revealedAnswersList,
      trueQuestion: showTrueQuestion ? this.currentQuestionPair!.trueQuestion : null,
      votedPlayerIds: Array.from(this.votes.keys()),
      result: this.roundResult
    };
  }

  public destroy() {
    this.clearTimer();
    this.players.clear();
    this.answers.clear();
    this.votes.clear();
  }
}

