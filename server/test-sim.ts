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
    const id = 'test_' + name.toLowerCase();
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

    socket.on('connect', () => {
      resolve(client);
    });

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

async function runSimulation() {
  console.log('🚀 Starting end-to-end multiplayer simulation test...');

  // 1. Create 3 players
  const alice = await createClient('Alice');
  const bob = await createClient('Bob');
  const charlie = await createClient('Charlie');

  console.log('✅ Connected 3 test sockets: Alice, Bob, Charlie');

  // 2. Alice creates room
  alice.socket.emit('room:create', {
    playerName: alice.name,
    avatar: '👑',
    color: 'bg-purple-600',
    playerId: alice.id,
  });

  await sleep(200);
  const roomCode = alice.state?.roomCode;
  if (!roomCode) {
    throw new Error('Room was not created properly!');
  }
  console.log(`✅ Room created with code: ${roomCode}`);

  // 3. Bob and Charlie join room
  bob.socket.emit('room:join', {
    roomCode,
    playerName: bob.name,
    avatar: '🐼',
    color: 'bg-cyan-600',
    playerId: bob.id,
  });

  charlie.socket.emit('room:join', {
    roomCode,
    playerName: charlie.name,
    avatar: '🦁',
    color: 'bg-amber-600',
    playerId: charlie.id,
  });

  await sleep(300);
  console.log(`✅ All 3 players joined room ${roomCode}. Players count: ${alice.state?.players.length}`);
  if (alice.state?.players.length !== 3) {
    throw new Error('Expected 3 players in room!');
  }

  // 4. Host (Alice) starts game
  console.log('🎮 Starting game...');
  alice.socket.emit('game:start');
  await sleep(300);

  if (alice.state?.phase !== 'ANSWERING') {
    throw new Error(`Expected phase ANSWERING, got ${alice.state?.phase}`);
  }
  console.log('✅ Phase transitioned to ANSWERING');

  // Verify prompts
  console.log(`Alice Prompt: "${alice.prompt}"`);
  console.log(`Bob Prompt: "${bob.prompt}"`);
  console.log(`Charlie Prompt: "${charlie.prompt}"`);

  const prompts = [alice.prompt, bob.prompt, charlie.prompt];
  const uniquePrompts = Array.from(new Set(prompts));
  if (uniquePrompts.length !== 2) {
    throw new Error(`Expected exactly 2 distinct prompts (1 true, 1 imposter), got ${uniquePrompts.length}`);
  }
  console.log('✅ Prompts verified: 2 players got the true prompt, 1 player got the imposter prompt!');

  // 5. Submit Answers
  console.log('📝 Submitting player answers...');
  alice.socket.emit('game:submit_answer', { targetPlayerId: bob.id });
  bob.socket.emit('game:submit_answer', { targetPlayerId: charlie.id });
  charlie.socket.emit('game:submit_answer', { targetPlayerId: alice.id });

  await sleep(300);

  // 6. Verify STAGE 1: REVEAL_ANSWERS
  if (alice.state?.phase !== 'REVEAL_ANSWERS') {
    throw new Error(`Expected phase REVEAL_ANSWERS, got ${alice.state?.phase}`);
  }
  console.log('✅ Phase transitioned to REVEAL_ANSWERS (Stage 1)');
  console.log('Revealed answers count:', alice.state.revealedAnswers.length);
  if (alice.state.revealedAnswers.length !== 3) {
    throw new Error('Expected 3 revealed answers!');
  }
  if (alice.state.trueQuestion !== null) {
    throw new Error('Expected trueQuestion to be HIDDEN in Stage 1 REVEAL_ANSWERS!');
  }
  console.log('✅ Verified: Stage 1 reveals player picks, while True Question remains hidden!');

  // 7. Advance to STAGE 2: REVEAL_QUESTION
  console.log('✨ Advancing to Stage 2 (REVEAL_QUESTION)...');
  alice.socket.emit('game:next_phase');
  await sleep(300);

  if (alice.state?.phase !== 'REVEAL_QUESTION') {
    throw new Error(`Expected phase REVEAL_QUESTION, got ${alice.state?.phase}`);
  }
  console.log('✅ Phase transitioned to REVEAL_QUESTION (Stage 2)');
  console.log(`True Question revealed: "${alice.state.trueQuestion}"`);
  if (!alice.state.trueQuestion) {
    throw new Error('Expected trueQuestion to be revealed in Stage 2!');
  }

  // 8. Advance to DELIBERATION
  console.log('🗣️ Advancing to DELIBERATION...');
  alice.socket.emit('game:next_phase');
  await sleep(300);
  if (alice.state?.phase !== 'DELIBERATION') {
    throw new Error(`Expected phase DELIBERATION, got ${alice.state?.phase}`);
  }
  console.log('✅ Phase transitioned to DELIBERATION');

  // Test Chat
  alice.socket.emit('chat:send', { text: 'I think Bob is acting super suspicious!' });
  await sleep(200);

  // 9. Advance to VOTING
  console.log('🗳️ Advancing to VOTING...');
  alice.socket.emit('game:next_phase');
  await sleep(300);
  if (alice.state?.phase !== 'VOTING') {
    throw new Error(`Expected phase VOTING, got ${alice.state?.phase}`);
  }
  console.log('✅ Phase transitioned to VOTING');

  // Determine who the imposter was
  // In server, imposter prompt is the one that differs from the majority
  const truePrompt = prompts.find((p) => prompts.filter((x) => x === p).length === 2);
  const imposterClient = [alice, bob, charlie].find((c) => c.prompt !== truePrompt)!;
  console.log(`(Secret Imposter was: ${imposterClient.name})`);

  // Let Alice and Bob vote for the imposter, and imposter vote for Alice
  const nonImposters = [alice, bob, charlie].filter((c) => c.id !== imposterClient.id);
  nonImposters[0].socket.emit('game:submit_vote', { targetPlayerId: imposterClient.id });
  nonImposters[1].socket.emit('game:submit_vote', { targetPlayerId: imposterClient.id });
  imposterClient.socket.emit('game:submit_vote', { targetPlayerId: nonImposters[0].id });

  await sleep(400);

  // 10. Verify ROUND_RESULT
  if (alice.state?.phase !== 'ROUND_RESULT') {
    throw new Error(`Expected phase ROUND_RESULT, got ${alice.state?.phase}`);
  }
  console.log('✅ Phase transitioned to ROUND_RESULT');
  const result = alice.state.result;
  console.log('Round Result:', {
    accusedPlayerId: result?.accusedPlayerId,
    imposterPlayerId: result?.imposterPlayerId,
    wasImposterCaught: result?.wasImposterCaught,
    scoreChanges: result?.scoreChanges,
  });

  if (!result?.wasImposterCaught) {
    throw new Error('Expected imposter to be caught by majority vote!');
  }
  console.log('✅ Imposter was correctly caught! Crew wins!');

  // 11. Test Next Round
  console.log('🔄 Testing Next Round...');
  alice.socket.emit('game:next_round');
  await sleep(300);

  if (alice.state?.phase !== 'ANSWERING') {
    throw new Error(`Expected phase to reset to ANSWERING for Round 2, got ${alice.state?.phase}`);
  }
  console.log(`✅ Round 2 started cleanly! Round: ${alice.state.currentRound}`);

  // Disconnect sockets
  alice.socket.disconnect();
  bob.socket.disconnect();
  charlie.socket.disconnect();

  console.log('🎉 ALL END-TO-END SIMULATION TESTS PASSED SUCCESSFULLY!');
  process.exit(0);
}

runSimulation().catch((err) => {
  console.error('❌ Simulation Test Failed:', err);
  process.exit(1);
});

