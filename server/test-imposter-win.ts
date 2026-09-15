import { io, Socket } from 'socket.io-client';
import { RoomPublicState } from './src/types.js';

interface TestClient {
  name: string;
  id: string;
  socket: Socket;
  prompt: string | null;
  state: RoomPublicState | null;
}

function createClient(name: string): Promise<TestClient> {
  return new Promise((resolve) => {
    const id = 'test2_' + name.toLowerCase();
    const socket = io('http://localhost:3001', {
      transports: ['websocket'],
    });

    const client: TestClient = {
      name,
      id,
      socket,
      prompt: null,
      state: null,
    };

    socket.on('connect', () => resolve(client));
    socket.on('player:prompt', (data: { prompt: string }) => {
      client.prompt = data.prompt;
    });
    socket.on('state:update', (st: RoomPublicState) => {
      client.state = st;
    });
  });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runImposterWinSimulation() {
  console.log('🧪 Testing Imposter Win scenario (Innocent player voted out)...');

  const p1 = await createClient('Player1');
  const p2 = await createClient('Player2');
  const p3 = await createClient('Player3');

  p1.socket.emit('room:create', {
    playerName: p1.name,
    avatar: '🦊',
    color: 'bg-purple-600',
    playerId: p1.id,
  });
  await sleep(200);

  const roomCode = p1.state!.roomCode;
  p2.socket.emit('room:join', { roomCode, playerName: p2.name, avatar: '🐼', color: 'bg-cyan-600', playerId: p2.id });
  p3.socket.emit('room:join', { roomCode, playerName: p3.name, avatar: '🦁', color: 'bg-amber-600', playerId: p3.id });
  await sleep(300);

  p1.socket.emit('game:start');
  await sleep(300);

  // Submit answers
  p1.socket.emit('game:submit_answer', { targetPlayerId: p2.id });
  p2.socket.emit('game:submit_answer', { targetPlayerId: p3.id });
  p3.socket.emit('game:submit_answer', { targetPlayerId: p1.id });
  await sleep(300);

  // Advance through reveals and deliberation
  p1.socket.emit('game:next_phase'); // Stage 2
  await sleep(200);
  p1.socket.emit('game:next_phase'); // Deliberation
  await sleep(200);
  p1.socket.emit('game:next_phase'); // Voting
  await sleep(200);

  const prompts = [p1.prompt, p2.prompt, p3.prompt];
  const truePrompt = prompts.find((p) => prompts.filter((x) => x === p).length === 2);
  const imposter = [p1, p2, p3].find((c) => c.prompt !== truePrompt)!;
  const innocents = [p1, p2, p3].filter((c) => c.id !== imposter.id);

  console.log(`Imposter is: ${imposter.name}. Innocent players: ${innocents.map(i => i.name).join(', ')}`);

  // Now vote for an INNOCENT player (innocents[0])
  const framedPlayer = innocents[0];
  console.log(`Framing innocent player: ${framedPlayer.name}`);

  // Both imposter and second innocent vote for framedPlayer
  imposter.socket.emit('game:submit_vote', { targetPlayerId: framedPlayer.id });
  innocents[1].socket.emit('game:submit_vote', { targetPlayerId: framedPlayer.id });
  framedPlayer.socket.emit('game:submit_vote', { targetPlayerId: imposter.id });

  await sleep(400);

  const result = p1.state?.result;
  console.log('Result:', {
    accused: result?.accusedPlayerId,
    imposter: result?.imposterPlayerId,
    wasImposterCaught: result?.wasImposterCaught,
    scoreChanges: result?.scoreChanges,
  });

  if (result?.wasImposterCaught === true) {
    throw new Error('Expected imposter to escape (wasImposterCaught should be false)!');
  }
  if (result?.scoreChanges[imposter.id] !== 250) {
    throw new Error('Expected imposter to receive 250 points for winning!');
  }

  console.log('✅ Imposter win condition verified! Innocent player was accused, Imposter escaped and won +250 points!');

  p1.socket.disconnect();
  p2.socket.disconnect();
  p3.socket.disconnect();
  process.exit(0);
}

runImposterWinSimulation().catch((err) => {
  console.error(err);
  process.exit(1);
});

