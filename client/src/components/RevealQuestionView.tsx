import React from 'react';
import { Sparkles, FastForward, Users } from 'lucide-react';
import { RoomPublicState } from '../types.js';
import { TimerBar } from './TimerBar.js';

interface RevealQuestionViewProps {
  gameState: RoomPublicState;
  isHost: boolean;
  onNextPhase: () => void;
}

export const RevealQuestionView: React.FC<RevealQuestionViewProps> = ({
  gameState,
  isHost,
  onNextPhase,
}) => {
  const playersMap = new Map(gameState.players.map((p) => [p.id, p]));

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in zoom-in-95 duration-500">
      {/* Timer Bar */}
      {gameState.timer && (
        <TimerBar
          timeLeft={gameState.timer.timeLeft}
          totalDuration={gameState.timer.totalDuration}
          label="Deliberation starting in..."
        />
      )}

      {/* Big Dramatic True Question Card */}
      <div className="bg-gradient-to-br from-purple-900/60 via-slate-900 to-fuchsia-950/60 border-2 border-purple-500/80 rounded-3xl p-6 sm:p-10 shadow-2xl text-center glow-purple">
        <div className="inline-flex items-center gap-2 bg-purple-500/30 text-purple-200 border border-purple-400/40 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
          The True Question Revealed
        </div>

        <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">
          "{gameState.trueQuestion}"
        </h2>

        <p className="text-slate-300 text-xs sm:text-sm mt-4 max-w-lg mx-auto leading-relaxed">
          The majority answered this question! The <span className="text-rose-400 font-bold">Imposter</span> received something completely different.
        </p>
      </div>

      {/* Mini Recap of Answers */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
          <Users className="w-3.5 h-3.5 text-purple-400" />
          Quick Recap of Picks
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {gameState.revealedAnswers.map(({ playerId, targetPlayerId }) => {
            const voter = playersMap.get(playerId);
            const target = playersMap.get(targetPlayerId);
            if (!voter || !target) return null;

            return (
              <div key={playerId} className="bg-slate-800/70 rounded-xl p-2.5 flex items-center justify-between border border-slate-700/50">
                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{voter.avatar}</span> {voter.name}
                </span>
                <span className="text-purple-400 font-bold flex items-center gap-1">
                  👉 <span>{target.avatar}</span> {target.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Skip / Advance Control */}
      {isHost && (
        <div className="text-center pt-2">
          <button
            onClick={onNextPhase}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-purple-600/30 transition inline-flex items-center gap-2 text-sm"
          >
            <FastForward className="w-4 h-4" />
            Start Deliberation Now
          </button>
        </div>
      )}
    </div>
  );
};
