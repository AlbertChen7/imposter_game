import React, { useState } from 'react';
import { Vote, CheckCircle2, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';
import { RoomPublicState } from '../types.js';
import { TimerBar } from './TimerBar.js';

interface VotingViewProps {
  gameState: RoomPublicState;
  currentPlayerId: string;
  onSubmitVote: (targetPlayerId: string) => void;
}

export const VotingView: React.FC<VotingViewProps> = ({
  gameState,
  currentPlayerId,
  onSubmitVote,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [showRefresher, setShowRefresher] = useState(false);

  const hasVoted = gameState.votedPlayerIds.includes(currentPlayerId);
  const activePlayers = gameState.players.filter((p) => p.connected);
  const eligibleSuspects = activePlayers.filter((p) => p.id !== currentPlayerId);
  const playersMap = new Map(gameState.players.map((p) => [p.id, p]));

  const handleConfirmVote = () => {
    if (!selectedTargetId || hasVoted) return;
    onSubmitVote(selectedTargetId);
  };

  const selectedPlayer = selectedTargetId ? playersMap.get(selectedTargetId) : null;

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
      {/* Timer Bar */}
      {gameState.timer && (
        <TimerBar
          timeLeft={gameState.timer.timeLeft}
          totalDuration={gameState.timer.totalDuration}
          label="Voting Time Left"
        />
      )}

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-rose-500/10 text-rose-300 border border-rose-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <ShieldAlert className="w-3.5 h-3.5" /> Accusation Phase
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Vote For The Imposter
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Choose carefully! If the majority votes for an innocent player, the imposter wins.
        </p>
      </div>

      {/* Quick Refresher Toggle */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowRefresher(!showRefresher)}
          className="w-full px-4 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
        >
          <span>Need a refresher on what everyone picked?</span>
          {showRefresher ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showRefresher && (
          <div className="p-4 border-t border-slate-800/80 bg-slate-950/40 space-y-2 text-xs">
            <div className="font-bold text-purple-300">
              True Question: "{gameState.trueQuestion}"
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1">
              {gameState.revealedAnswers.map(({ playerId, targetPlayerId }) => {
                const voter = playersMap.get(playerId);
                const target = playersMap.get(targetPlayerId);
                if (!voter || !target) return null;
                return (
                  <div key={playerId} className="text-slate-300">
                    <span className="font-semibold">{voter.name}</span> voted 👉 <span className="text-purple-300 font-semibold">{target.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Suspect Candidates Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Suspects
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {gameState.votedPlayerIds.length}/{activePlayers.length} voted
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {eligibleSuspects.map((player) => {
            const isSelected = selectedTargetId === player.id;

            return (
              <button
                key={player.id}
                type="button"
                disabled={hasVoted}
                onClick={() => setSelectedTargetId(player.id)}
                className={`relative rounded-2xl p-4 border transition-all text-center flex flex-col items-center ${
                  isSelected
                    ? 'bg-rose-500/20 border-rose-500 ring-2 ring-rose-500 scale-[1.02] shadow-lg shadow-rose-500/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                } ${hasVoted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-rose-500 text-white rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl ${player.color} flex items-center justify-center text-2xl shadow-inner mb-2`}>
                  {player.avatar}
                </div>

                <span className="font-bold text-sm text-slate-100 truncate w-full">
                  {player.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Submit / Voted Area */}
      <div className="pt-2 text-center">
        {!hasVoted ? (
          <button
            onClick={handleConfirmVote}
            disabled={!selectedTargetId}
            className="w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-rose-600/30 text-lg transition transform active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Vote className="w-5 h-5" />
            {selectedPlayer ? `Vote to Accuse ${selectedPlayer.name}` : 'Select a Suspect'}
          </button>
        ) : (
          <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-4 inline-flex items-center gap-3 text-rose-300 font-semibold text-sm animate-pulse-slow">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Vote recorded! Waiting for remaining players...</span>
          </div>
        )}
      </div>
    </div>
  );
};

