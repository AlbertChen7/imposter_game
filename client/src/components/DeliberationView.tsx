import React from 'react';
import { MessageCircle, Vote as VoteIcon, ArrowRight } from 'lucide-react';
import { RoomPublicState } from '../types.js';
import { TimerBar } from './TimerBar.js';

interface DeliberationViewProps {
  gameState: RoomPublicState;
  isHost: boolean;
  onNextPhase: () => void;
}

export const DeliberationView: React.FC<DeliberationViewProps> = ({
  gameState,
  isHost,
  onNextPhase,
}) => {
  const playersMap = new Map(gameState.players.map((p) => [p.id, p]));

  return (
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
      {/* Timer Bar */}
      {gameState.timer && (
        <TimerBar
          timeLeft={gameState.timer.timeLeft}
          totalDuration={gameState.timer.totalDuration}
          label="Deliberation Time"
        />
      )}

      {/* Deliberation Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
          <MessageCircle className="w-3.5 h-3.5" /> Deliberation & Interrogation
        </div>
        <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Who's The Imposter? 🤔
        </h2>
        <p className="text-slate-400 text-sm max-w-lg mx-auto">
          Talk, accuse, and defend! Whose choice makes no sense for the True Question?
        </p>
      </div>

      {/* True Question Reminder Banner */}
      <div className="bg-slate-900/90 border border-purple-500/40 rounded-3xl p-5 sm:p-6 shadow-xl text-center">
        <span className="text-[11px] font-bold uppercase tracking-widest text-purple-400">
          The True Question
        </span>
        <h3 className="text-lg sm:text-xl font-extrabold text-white mt-1">
          "{gameState.trueQuestion}"
        </h3>
      </div>

      {/* Player Choices Grid */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 block">
          Player Answers
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {gameState.revealedAnswers.map(({ playerId, targetPlayerId }) => {
            const voter = playersMap.get(playerId);
            const target = playersMap.get(targetPlayerId);
            if (!voter || !target) return null;

            return (
              <div
                key={playerId}
                className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl ${voter.color} flex items-center justify-center text-lg shadow`}>
                    {voter.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-100">{voter.name}</div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Player</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  <div className="text-right">
                    <div className="font-bold text-sm text-purple-300 flex items-center gap-1.5 justify-end">
                      <span>{target.name}</span>
                      <span className="text-base">{target.avatar}</span>
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Voted</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Controls */}
      <div className="text-center pt-3">
        {isHost ? (
          <button
            onClick={onNextPhase}
            className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-3.5 px-8 rounded-2xl shadow-xl shadow-purple-600/30 text-base transition transform active:scale-95 inline-flex items-center gap-2"
          >
            <VoteIcon className="w-5 h-5" />
            Skip to Voting
          </button>
        ) : (
          <p className="text-xs text-slate-500">
            Discussion underway. Host can start voting early at any time.
          </p>
        )}
      </div>
    </div>
  );
};

