import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './game/RoomManager.js';
import {
  ClientToServerEvents,
  ServerToClientEvents,
  ChatMessage
} from './types.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

const server = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents>(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

const roomManager = new RoomManager(io);

io.on('connection', (socket) => {
  // 1. Create Room
  socket.on('room:create', ({ playerName, avatar, color, playerId }) => {
    const room = roomManager.createRoom();
    socket.join(room.code);
    roomManager.registerSocket(socket.id, room.code, playerId);

    room.addPlayer({
      id: playerId,
      socketId: socket.id,
      name: playerName,
      avatar,
      color,
    });
  });

  // 2. Join Room
  socket.on('room:join', ({ roomCode, playerName, avatar, color, playerId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error:msg', { message: `Room "${roomCode.toUpperCase()}" not found!` });
      return;
    }

    if (room.phase !== 'LOBBY') {
      socket.emit('error:msg', { message: 'A game is currently in progress in this room.' });
      return;
    }

    socket.join(room.code);
    roomManager.registerSocket(socket.id, room.code, playerId);

    room.addPlayer({
      id: playerId,
      socketId: socket.id,
      name: playerName,
      avatar,
      color,
    });
  });

  // 3. Reconnect Room
  socket.on('room:reconnect', ({ roomCode, playerId }) => {
    const room = roomManager.getRoom(roomCode);
    if (!room) {
      socket.emit('error:msg', { message: 'Room session expired.' });
      return;
    }

    const reconnected = room.reconnectPlayer(playerId, socket.id);
    if (reconnected) {
      socket.join(room.code);
      roomManager.registerSocket(socket.id, room.code, playerId);
    } else {
      socket.emit('error:msg', { message: 'Player session not found in room.' });
    }
  });

  // 4. Update Config
  socket.on('room:update_config', ({ config }) => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room && room.hostId === info.playerId) {
      room.updateConfig(config);
    }
  });

  // 5. Start Game
  socket.on('game:start', () => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room && room.hostId === info.playerId) {
      const started = room.startGame();
      if (!started) {
        socket.emit('error:msg', { message: 'At least 3 players are required to start the game!' });
      }
    }
  });

  // 6. Submit Answer
  socket.on('game:submit_answer', ({ targetPlayerId }) => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room) {
      room.submitAnswer(info.playerId, targetPlayerId);
    }
  });

  // 7. Host Advance Phase
  socket.on('game:next_phase', () => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room && room.hostId === info.playerId) {
      room.handleHostNextPhase();
    }
  });

  // 8. Submit Vote
  socket.on('game:submit_vote', ({ targetPlayerId }) => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room) {
      room.submitVote(info.playerId, targetPlayerId);
    }
  });

  // 9. Next Round
  socket.on('game:next_round', () => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room && room.hostId === info.playerId) {
      room.nextRound();
    }
  });

  // 10. Return to Lobby
  socket.on('game:return_lobby', () => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room && room.hostId === info.playerId) {
      room.returnToLobby();
    }
  });

  // 11. Chat Message
  socket.on('chat:send', ({ text }) => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (!info) return;
    const room = roomManager.getRoom(info.roomCode);
    if (room && text.trim()) {
      const player = room.players.get(info.playerId);
      if (!player) return;

      const chatMsg: ChatMessage = {
        id: Math.random().toString(36).substring(2, 9),
        playerId: player.id,
        playerName: player.name,
        playerColor: player.color,
        text: text.trim().slice(0, 200),
        timestamp: Date.now(),
      };
      room.broadcastChatMessage(chatMsg);
    }
  });

  // 12. Disconnect
  socket.on('disconnect', () => {
    const info = roomManager.getPlayerBySocket(socket.id);
    if (info) {
      const room = roomManager.getRoom(info.roomCode);
      if (room) {
        room.removePlayer(info.playerId);
      }
      roomManager.unregisterSocket(socket.id);
    }
  });
});

// Serve frontend build if available (production deployment)
const clientDist = path.resolve(__dirname, '../../client/dist');
if (process.env.NODE_ENV === 'production' || fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

