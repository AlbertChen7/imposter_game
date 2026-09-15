import { useState } from 'react';
import { Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useGameSocket } from './hooks/useGameSocket.js';
import { sound } from './utils/audio.js';
import { LobbyView } from './components/LobbyView.js';
import { AnsweringView } from './components/AnsweringView.js';
import { RevealAnswersView } from './components/RevealAnswersView.js';
import { RevealQuestionView } from './components/RevealQuestionView.js';
import { DeliberationView } from './components/DeliberationView.js';
import { VotingView } from './components/VotingView.js';
import { ResultView } from './components/ResultView.js';
import { ChatDrawer } from './components/ChatDrawer.js';

export default function App() {
  const {
    playerId,
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
  } = useGameSocket();

  const [soundEnabled, setSoundEnabled] = useState(true);

  const toggleSound = () => {
    const next = !soundEnabled;
    sound.enabled = next;
    setSoundEnabled(next);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between selection:bg-purple-500 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur sticky top-0 z-30 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🎭</span>
            <div>
              <h1 className="font-extrabold text-sm sm:text-base text-white tracking-tight flex items-center gap-1.5">
                Who Is Most Likely To...
              </h1>
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">
                Imposter Game
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {gameState && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs font-mono font-bold text-purple-300">
                <span>Room:</span>
                <span className="text-white tracking-widest">{gameState.roomCode}</span>
              </div>
            )}

            {/* Sound Toggle */}
            <button
              onClick={toggleSound}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700/80 text-slate-300 hover:text-white transition"
              title={soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-purple-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            {/* Connection Status Indicator */}
            <div
              className={`p-2 rounded-xl border flex items-center justify-center ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
              title={isConnected ? 'Connected to server' : 'Connecting to server...'}
            >
              {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4 animate-pulse" />}
            </div>
          </div>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-1 flex flex-col justify-center py-6 px-3 sm:px-4">
        {(!gameState || gameState.phase === 'LOBBY') && (
          <LobbyView
            gameState={gameState}
            currentPlayerId={playerId}
            isHost={isHost}
            onCreateRoom={createRoom}
            onJoinRoom={joinRoom}
            onUpdateConfig={updateConfig}
            onStartGame={startGame}
            onLeaveRoom={leaveRoom}
            errorMessage={error}
            onClearError={clearError}
          />
        )}

        {gameState && gameState.phase === 'ANSWERING' && (
          <AnsweringView
            gameState={gameState}
            myPrompt={myPrompt}
            currentPlayerId={playerId}
            onSubmitAnswer={submitAnswer}
          />
        )}

        {gameState && gameState.phase === 'REVEAL_ANSWERS' && (
          <RevealAnswersView
            gameState={gameState}
            isHost={isHost}
            onNextPhase={nextPhase}
          />
        )}

        {gameState && gameState.phase === 'REVEAL_QUESTION' && (
          <RevealQuestionView
            gameState={gameState}
            isHost={isHost}
            onNextPhase={nextPhase}
          />
        )}

        {gameState && gameState.phase === 'DELIBERATION' && (
          <DeliberationView
            gameState={gameState}
            isHost={isHost}
            onNextPhase={nextPhase}
          />
        )}

        {gameState && gameState.phase === 'VOTING' && (
          <VotingView
            gameState={gameState}
            currentPlayerId={playerId}
            onSubmitVote={submitVote}
          />
        )}

        {gameState && gameState.phase === 'ROUND_RESULT' && (
          <ResultView
            gameState={gameState}
            currentPlayerId={playerId}
            isHost={isHost}
            onNextRound={nextRound}
            onReturnToLobby={returnToLobby}
          />
        )}
      </main>

      {/* In-Game Chat Drawer (Available when inside a room) */}
      {gameState && (
        <ChatDrawer
          messages={messages}
          onSendMessage={sendChat}
          currentPlayerId={playerId}
        />
      )}

      {/* Footer */}
      <footer className="py-3 text-center text-slate-600 text-[11px] border-t border-slate-900">
        Who Is Most Likely To... &bull; Imposter Edition &bull; Play with friends on any device
      </footer>
    </div>
  );
}

