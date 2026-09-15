import React from 'react';
import { ArrowRight, Eye, FastForward } from 'lucide-react';
import { RoomPublicState } from '../types.js';
import { TimerBar } from './TimerBar.js';

interface RevealAnswersViewProps {
  gameState: RoomPublicState;
  isHost: boolean;
  onNextPhase: () => void;
}

export const RevealAnswersView: React.FC<RevealAnswersViewProps> = ({
  gameState,
  isHost,
  onNextPhase,
}) => {
  const playersMap = new Map(gameState.players.map((p) => [p.id, p]));

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
      {/* Timer Bar */}
      {gameState.timer && (
        <TimerBar
          timeLeft={gameState.timer.timeLeft}
          totalDuration={gameState.timer.totalDuration}
          label="Revealing True Question in..."
        />
      )}

      {/* Header Banner */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <Eye className="w-3.5 h-3.5" /> Stage 1: Player Answers
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          The Picks Are In! 👀
        </h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          Here is who everyone chose. Take note of any unusual patterns before the prompt is unveiled!
        </p>
      </div>

      {/* Answers Grid */}
      <div className="space-y-3">
        {gameState.revealedAnswers.map(({ playerId, targetPlayerId }) => {
          const voter = playersMap.get(playerId);
          const target = playersMap.get(targetPlayerId);

          if (!voter || !target) return null;

          return (
            <div
              key={playerId}
              className="bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-3 transition-all"
            >
              {/* Voter */}
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-12 h-12 rounded-xl ${voter.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
                  {voter.avatar}
                </div>
                <div className="truncate">
                  <div className="font-extrabold text-sm sm:text-base text-slate-100 truncate">
                    {voter.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Player</div>
                </div>
              </div>

              {/* Arrow Indicator */}
              <div className="flex flex-col items-center justify-center px-2 text-slate-500 shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Voted For</span>
                <div className="bg-slate-800 p-1.5 rounded-full border border-slate-700">
                  <ArrowRight className="w-4 h-4 text-purple-400" />
                </div>
              </div>

              {/* Target */}
              <div className="flex items-center justify-end gap-3 min-w-0 flex-1 text-right">
                <div className="truncate">
                  <div className="font-extrabold text-sm sm:text-base text-purple-300 truncate">
                    {target.name}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Selected</div>
                </div>
                <div className={`w-12 h-12 rounded-xl ${target.color} flex items-center justify-center text-xl shrink-0 shadow-md`}>
                  {target.avatar}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Host Skip / Advance Control */}
      {isHost && (
        <div className="text-center pt-2">
          <button
            onClick={onNextPhase}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-purple-300 hover:text-white font-bold py-3 px-6 rounded-2xl transition inline-flex items-center gap-2 text-sm"
          >
            <FastForward className="w-4 h-4" />
            Reveal True Question Now
          </button>
        </div>
      )}
    </div>
  );
};

