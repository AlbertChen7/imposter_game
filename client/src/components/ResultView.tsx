import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Play, Skull, Award } from 'lucide-react';
import { RoomPublicState } from '../types.js';

interface ResultViewProps {
  gameState: RoomPublicState;
  currentPlayerId: string;
  isHost: boolean;
  onNextRound: () => void;
  onReturnToLobby: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  gameState,
  currentPlayerId,
  isHost,
  onNextRound,
  onReturnToLobby,
}) => {
  const result = gameState.result;
  const playersMap = new Map(gameState.players.map((p) => [p.id, p]));

  const imposter = result ? playersMap.get(result.imposterPlayerId) : null;
  const accused = result?.accusedPlayerId ? playersMap.get(result.accusedPlayerId) : null;
  const wasCaught = result?.wasImposterCaught || false;
  const isMeImposter = currentPlayerId === result?.imposterPlayerId;

  // Did current player win?
  // If caught: crew wins (anyone who is not imposter)
  // If not caught: imposter wins
  const didIWin = wasCaught ? !isMeImposter : isMeImposter;

  useEffect(() => {
    if (didIWin) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [didIWin]);

  if (!result || !imposter) {
    return <div className="text-center p-8 text-slate-400">Loading results...</div>;
  }

  // Sort players by total score
  const sortedPlayers = [...gameState.players].sort((a, b) => b.score - a.score);

  return (
    <div className="max-w-2xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in zoom-in-95 duration-500">
      {/* Big Outcome Banner */}
      <div
        className={`rounded-3xl p-6 sm:p-8 border-2 shadow-2xl text-center relative overflow-hidden ${
          wasCaught
            ? 'bg-gradient-to-b from-emerald-950/60 via-slate-900 to-slate-900 border-emerald-500/80 glow-emerald'
            : 'bg-gradient-to-b from-rose-950/60 via-slate-900 to-slate-900 border-rose-500/80 glow-rose'
        }`}
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider mb-4 border bg-slate-900/80 shadow-md">
          {wasCaught ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Trophy className="w-4 h-4 text-emerald-400" /> Crew Victory!
            </span>
          ) : (
            <span className="text-rose-400 flex items-center gap-1">
              <Skull className="w-4 h-4 text-rose-400" /> Imposter Victory!
            </span>
          )}
        </div>

        {/* Accused Reveal */}
        {accused ? (
          <div className="space-y-2 mb-4">
            <div className="text-slate-400 text-xs sm:text-sm uppercase tracking-wider font-semibold">
              The Group Voted To Accuse
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white flex items-center justify-center gap-3">
              <span className="text-3xl">{accused.avatar}</span>
              <span>{accused.name}</span>
            </div>
            <div className={`text-sm font-extrabold ${wasCaught ? 'text-emerald-400' : 'text-rose-400'}`}>
              {wasCaught
                ? '...and they WERE the Imposter! 🎯'
                : '...and they were INNOCENT! 😱'}
            </div>
          </div>
        ) : (
          <div className="space-y-1 mb-4">
            <div className="text-xl sm:text-2xl font-black text-amber-400">
              The Vote Was A Tie!
            </div>
            <p className="text-slate-400 text-xs">
              No majority consensus was reached, allowing the Imposter to escape!
            </p>
          </div>
        )}

        {/* The Real Imposter Reveal */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 bg-slate-950/40 rounded-2xl p-4 space-y-3">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-400">
            The True Imposter Was
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <div className={`w-10 h-10 rounded-xl ${imposter.color} flex items-center justify-center text-xl shadow`}>
              {imposter.avatar}
            </div>
            <span className="text-xl font-black text-white">{imposter.name}</span>
          </div>

          {/* Imposter Secret Question */}
          <div className="pt-2">
            <span className="text-[10px] uppercase font-black tracking-widest text-rose-400 block mb-1">
              Their Secret Question Was:
            </span>
            <div className="font-bold text-sm sm:text-base text-rose-200 italic px-2">
              "{result.imposterQuestion}"
            </div>
          </div>
        </div>
      </div>

      {/* Comparison: True Question vs Imposter Question */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl text-xs sm:text-sm">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs">
          Questions Compared
        </h4>
        <div className="space-y-2">
          <div className="bg-purple-950/40 border border-purple-800/40 rounded-xl p-3">
            <span className="font-bold text-[11px] uppercase tracking-wider text-purple-400 block mb-0.5">
              True Question (Everyone else)
            </span>
            <span className="text-slate-200 font-semibold">"{result.trueQuestion}"</span>
          </div>
          <div className="bg-rose-950/40 border border-rose-800/40 rounded-xl p-3">
            <span className="font-bold text-[11px] uppercase tracking-wider text-rose-400 block mb-0.5">
              Imposter Question ({imposter.name})
            </span>
            <span className="text-slate-200 font-semibold">"{result.imposterQuestion}"</span>
          </div>
        </div>
      </div>

      {/* Vote Breakdown */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-2">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs">
          Who Voted for Whom
        </h4>
        <div className="space-y-2 text-xs">
          {Object.entries(result.votes).map(([targetId, voterIds]) => {
            const target = playersMap.get(targetId);
            if (!target || voterIds.length === 0) return null;
            return (
              <div key={targetId} className="bg-slate-800/60 rounded-xl p-2.5 flex items-center justify-between">
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <span>{target.avatar}</span>
                  <span>{target.name}</span>
                  <span className="text-[11px] font-semibold text-slate-500">
                    ({voterIds.length} {voterIds.length === 1 ? 'vote' : 'votes'})
                  </span>
                </div>
                <div className="text-slate-400 flex items-center gap-1">
                  from {voterIds.map((vId) => playersMap.get(vId)?.name || 'Unknown').join(', ')}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3 shadow-xl">
        <h4 className="font-bold text-slate-300 uppercase tracking-wider text-xs flex items-center gap-1.5">
          <Award className="w-4 h-4 text-amber-400" /> Leaderboard
        </h4>
        <div className="space-y-2">
          {sortedPlayers.map((p, index) => {
            const gained = result.scoreChanges[p.id] || 0;
            return (
              <div
                key={p.id}
                className="bg-slate-800/80 rounded-xl p-3 flex items-center justify-between text-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-slate-500 w-4">{index + 1}.</span>
                  <span className="text-lg">{p.avatar}</span>
                  <span className="font-bold text-slate-200">{p.name}</span>
                </div>

                <div className="flex items-center gap-3">
                  {gained > 0 && (
                    <span className="text-emerald-400 font-bold text-xs">
                      +{gained} pts
                    </span>
                  )}
                  <span className="font-mono font-extrabold text-purple-300">
                    {p.score} pts
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Host Action Controls */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
        {isHost ? (
          <>
            <button
              onClick={onNextRound}
              className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold py-3.5 px-6 rounded-2xl shadow-xl shadow-purple-600/30 text-base transition transform active:scale-95 inline-flex items-center justify-center gap-2 glow-purple"
            >
              <Play className="w-4 h-4 fill-current" />
              Next Round
            </button>
            <button
              onClick={onReturnToLobby}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white font-bold py-3.5 px-6 rounded-2xl transition inline-flex items-center justify-center gap-2 text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              Return to Lobby
            </button>
          </>
        ) : (
          <div className="text-center text-slate-400 text-xs animate-pulse-slow">
            Waiting for the host to start the next round...
          </div>
        )}
      </div>
    </div>
  );
};
