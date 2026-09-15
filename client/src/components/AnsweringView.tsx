import React, { useState } from 'react';
import { CheckCircle2, Send, HelpCircle, Users } from 'lucide-react';
import { RoomPublicState } from '../types.js';
import { TimerBar } from './TimerBar.js';

interface AnsweringViewProps {
  gameState: RoomPublicState;
  myPrompt: string | null;
  currentPlayerId: string;
  onSubmitAnswer: (targetPlayerId: string) => void;
}

export const AnsweringView: React.FC<AnsweringViewProps> = ({
  gameState,
  myPrompt,
  currentPlayerId,
  onSubmitAnswer,
}) => {
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);

  const hasSubmitted = gameState.submittedPlayerIds.includes(currentPlayerId);
  const activePlayers = gameState.players.filter((p) => p.connected);
  const submittedCount = gameState.submittedPlayerIds.length;

  const handleSelect = (playerId: string) => {
    if (hasSubmitted) return;
    setSelectedTargetId(playerId);
  };

  const handleConfirm = () => {
    if (!selectedTargetId || hasSubmitted) return;
    onSubmitAnswer(selectedTargetId);
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
      {/* Timer Bar */}
      {gameState.timer && (
        <TimerBar
          timeLeft={gameState.timer.timeLeft}
          totalDuration={gameState.timer.totalDuration}
          label="Time to Answer"
        />
      )}

      {/* Secret Prompt Card */}
      <div className="bg-gradient-to-br from-slate-900 via-purple-950/40 to-slate-900 border-2 border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-center glow-purple">
        <div className="inline-flex items-center gap-2 bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3 border border-purple-500/30">
          <HelpCircle className="w-3.5 h-3.5" /> Your Secret Prompt
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-white leading-snug tracking-tight">
          "{myPrompt || 'Loading prompt...'}"
        </h2>

        <p className="text-slate-400 text-xs sm:text-sm mt-3">
          Select the player in the lobby who best fits this description!
        </p>
      </div>

      {/* Players Selection Grid */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-purple-400" />
            Pick A Player
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {submittedCount}/{activePlayers.length} answered
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {activePlayers.map((player) => {
            const isSelected = selectedTargetId === player.id;
            const isMe = player.id === currentPlayerId;

            return (
              <button
                key={player.id}
                type="button"
                disabled={hasSubmitted}
                onClick={() => handleSelect(player.id)}
                className={`relative rounded-2xl p-4 border transition-all text-center flex flex-col items-center ${
                  isSelected
                    ? 'bg-purple-600/30 border-purple-400 ring-2 ring-purple-400 scale-[1.02] shadow-lg shadow-purple-600/20'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                } ${hasSubmitted ? 'opacity-70 cursor-not-allowed' : 'cursor-pointer active:scale-95'}`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl ${player.color} flex items-center justify-center text-2xl shadow-inner mb-2`}>
                  {player.avatar}
                </div>

                <span className="font-bold text-sm text-slate-100 truncate w-full">
                  {player.name}
                </span>

                {isMe && (
                  <span className="text-[10px] text-purple-400 font-semibold mt-0.5">
                    (You)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lock In / Status Area */}
      <div className="pt-2 text-center">
        {!hasSubmitted ? (
          <button
            onClick={handleConfirm}
            disabled={!selectedTargetId}
            className="w-full sm:w-auto min-w-[240px] bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold py-4 px-8 rounded-2xl shadow-xl shadow-purple-600/30 text-lg transition transform active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Send className="w-5 h-5" />
            Lock In Choice
          </button>
        ) : (
          <div className="bg-slate-900/90 border border-purple-500/30 rounded-2xl p-4 inline-flex items-center gap-3 text-purple-300 font-semibold text-sm animate-pulse-slow">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Choice locked in! Waiting for other players...</span>
          </div>
        )}
      </div>
    </div>
  );
};

