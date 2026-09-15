import React, { useState, useEffect } from 'react';
import {
  Users,
  Copy,
  Check,
  Play,
  Settings,
  HelpCircle,
  Crown,
  LogOut,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { RoomPublicState, RoomConfig } from '../types.js';

interface LobbyViewProps {
  gameState: RoomPublicState | null;
  currentPlayerId: string;
  isHost: boolean;
  onCreateRoom: (name: string, avatar: string, color: string) => void;
  onJoinRoom: (code: string, name: string, avatar: string, color: string) => void;
  onUpdateConfig: (config: Partial<RoomConfig>) => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
  errorMessage: string | null;
  onClearError: () => void;
}

const AVATARS = ['🦊', '🐼', '🦁', '🐯', '🐸', '🦄', '🐙', '🤖', '👻', '🎭', '🤠', '🥷', '👾', '👑'];
const COLORS = [
  { name: 'Purple', bg: 'bg-purple-600', text: 'text-purple-400', border: 'border-purple-500' },
  { name: 'Cyan', bg: 'bg-cyan-600', text: 'text-cyan-400', border: 'border-cyan-500' },
  { name: 'Emerald', bg: 'bg-emerald-600', text: 'text-emerald-400', border: 'border-emerald-500' },
  { name: 'Rose', bg: 'bg-rose-600', text: 'text-rose-400', border: 'border-rose-500' },
  { name: 'Amber', bg: 'bg-amber-600', text: 'text-amber-400', border: 'border-amber-500' },
  { name: 'Blue', bg: 'bg-blue-600', text: 'text-blue-400', border: 'border-blue-500' },
];

export const LobbyView: React.FC<LobbyViewProps> = ({
  gameState,
  currentPlayerId,
  isHost,
  onCreateRoom,
  onJoinRoom,
  onUpdateConfig,
  onStartGame,
  onLeaveRoom,
  errorMessage,
  onClearError,
}) => {
  // Setup state for initial screen (using sessionStorage ensures independent tabs when testing)
  const [name, setName] = useState(() => sessionStorage.getItem('imposter_player_name') || '');
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    return sessionStorage.getItem('imposter_player_avatar') || AVATARS[Math.floor(Math.random() * AVATARS.length)];
  });
  const [selectedColor, setSelectedColor] = useState(() => {
    return sessionStorage.getItem('imposter_player_color') || COLORS[Math.floor(Math.random() * COLORS.length)].bg;
  });
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Read code from URL if provided (e.g. ?room=ABCD or ?code=ABCD)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('room') || params.get('code');
    if (code) {
      setJoinCode(code.toUpperCase().trim());
    }
  }, []);

  const saveProfile = (n: string, a: string, c: string) => {
    sessionStorage.setItem('imposter_player_name', n);
    sessionStorage.setItem('imposter_player_avatar', a);
    sessionStorage.setItem('imposter_player_color', c);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    saveProfile(name.trim(), selectedAvatar, selectedColor);
    onCreateRoom(name.trim(), selectedAvatar, selectedColor);
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !joinCode.trim()) return;
    saveProfile(name.trim(), selectedAvatar, selectedColor);
    onJoinRoom(joinCode.trim().toUpperCase(), name.trim(), selectedAvatar, selectedColor);
  };

  const copyRoomLink = () => {
    if (!gameState) return;
    const url = `${window.location.origin}${window.location.pathname}?room=${gameState.roomCode}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // 1. Initial Screen: Join or Create
  if (!gameState) {
    return (
      <div className="max-w-md w-full mx-auto p-4 sm:p-6 my-auto animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20 mb-3 glow-purple">
            <span className="text-4xl">🎭</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center gap-2">
            Who Is Most Likely To...
          </h1>
          <p className="text-purple-400 font-semibold tracking-wider uppercase text-xs mt-1">
            The Imposter Party Game
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-sm flex justify-between items-center">
            <span>{errorMessage}</span>
            <button onClick={onClearError} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
          </div>
        )}

        <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          {/* Nickname */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Your Nickname
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name..."
              maxLength={15}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              required
            />
          </div>

          {/* Avatar Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Choose Avatar
            </label>
            <div className="grid grid-cols-7 gap-2 bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedAvatar(emoji)}
                  className={`text-2xl p-1.5 rounded-lg transition transform hover:scale-110 ${
                    selectedAvatar === emoji
                      ? 'bg-purple-600 shadow-md scale-110'
                      : 'hover:bg-slate-700'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              Card Color
            </label>
            <div className="flex gap-2 justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              {COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setSelectedColor(c.bg)}
                  className={`w-8 h-8 rounded-full ${c.bg} transition-all transform ${
                    selectedColor === c.bg
                      ? 'ring-4 ring-white/80 scale-110'
                      : 'opacity-70 hover:opacity-100 hover:scale-105'
                  }`}
                  title={c.name}
                />
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 space-y-3">
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-40 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg shadow-purple-600/30 transition transform active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-5 h-5" />
              Create New Room
            </button>

            <div className="flex items-center my-3 text-slate-600">
              <div className="flex-1 border-t border-slate-800" />
              <span className="px-3 text-xs uppercase font-bold tracking-wider text-slate-500">Or join existing</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            <form onSubmit={handleJoin} className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  placeholder="Room Code (e.g. ABCD)"
                  maxLength={4}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white uppercase tracking-widest font-mono text-center font-bold placeholder-slate-500 placeholder:normal-case placeholder:tracking-normal focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                />
                <button
                  type="submit"
                  disabled={!name.trim() || joinCode.trim().length < 4}
                  className="bg-slate-800 hover:bg-slate-700 disabled:opacity-40 border border-slate-700 text-purple-400 font-bold px-5 rounded-xl transition hover:border-purple-500"
                >
                  Join
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 2. Room Lobby Screen (Inside Room)
  const activePlayers = gameState.players.filter((p) => p.connected);
  const canStart = isHost && activePlayers.length >= 3;

  return (
    <div className="max-w-3xl w-full mx-auto p-4 sm:p-6 space-y-6 animate-in fade-in">
      {/* Header with Room Code & Share Link */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-5 shadow-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-slate-400">Room Code</span>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-4xl font-black font-mono tracking-widest text-purple-400">
              {gameState.roomCode}
            </span>
            <button
              onClick={copyRoomLink}
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 transition"
              title="Copy invite link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Link Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isHost && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2.5 rounded-xl border transition ${
                showSettings
                  ? 'bg-purple-600/30 border-purple-500 text-purple-300'
                  : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
              }`}
              title="Game Settings"
            >
              <Settings className="w-5 h-5" />
            </button>
          )}

          <button
            onClick={onLeaveRoom}
            className="p-2.5 bg-slate-800 hover:bg-rose-900/30 border border-slate-700 hover:border-rose-500 text-slate-400 hover:text-rose-300 rounded-xl transition"
            title="Leave Room"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/20 border border-rose-500/50 rounded-xl text-rose-300 text-sm flex justify-between items-center">
          <span>{errorMessage}</span>
          <button onClick={onClearError} className="text-rose-400 hover:text-white font-bold ml-2">✕</button>
        </div>
      )}

      {/* Host Settings Drawer / Panel */}
      {isHost && showSettings && (
        <div className="bg-slate-900/95 border border-purple-500/40 rounded-3xl p-5 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="font-bold text-base text-purple-300 flex items-center gap-2">
              <Settings className="w-4 h-4" /> Game Rules & Timers
            </h3>
            <span className="text-xs text-slate-400">Host Only</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Answer Timer</label>
              <select
                value={gameState.config.answerDuration}
                onChange={(e) => onUpdateConfig({ answerDuration: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
                <option value={60}>60 seconds</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Deliberation Timer</label>
              <select
                value={gameState.config.deliberationDuration}
                onChange={(e) => onUpdateConfig({ deliberationDuration: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value={30}>30 seconds</option>
                <option value={60}>60 seconds</option>
                <option value={90}>90 seconds</option>
                <option value={120}>2 minutes</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1">Voting Timer</label>
              <select
                value={gameState.config.votingDuration}
                onChange={(e) => onUpdateConfig({ votingDuration: Number(e.target.value) })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
              >
                <option value={20}>20 seconds</option>
                <option value={30}>30 seconds</option>
                <option value={45}>45 seconds</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Players List Grid */}
      <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-400" />
            Players in Lobby ({activePlayers.length})
          </h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            Min 3 players
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {gameState.players.map((p) => {
            const isMe = p.id === currentPlayerId;
            return (
              <div
                key={p.id}
                className={`relative rounded-2xl p-4 border transition-all flex flex-col items-center text-center ${
                  p.connected
                    ? 'bg-slate-800/80 border-slate-700/80'
                    : 'bg-slate-900/40 border-dashed border-slate-800 opacity-50'
                } ${isMe ? 'ring-2 ring-purple-500' : ''}`}
              >
                {/* Host Crown */}
                {p.isHost && (
                  <div className="absolute top-2 left-2 bg-amber-500/20 text-amber-400 p-1 rounded-lg border border-amber-500/40" title="Host">
                    <Crown className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* You badge */}
                {isMe && (
                  <span className="absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 px-1.5 py-0.5 rounded-md border border-purple-500/30">
                    You
                  </span>
                )}

                <div className={`w-14 h-14 rounded-2xl ${p.color} flex items-center justify-center text-2xl shadow-inner mb-2.5`}>
                  {p.avatar}
                </div>

                <div className="font-bold text-sm text-slate-100 truncate w-full">
                  {p.name}
                </div>

                <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
                  {p.connected ? (
                    <>
                      <UserCheck className="w-3 h-3 text-emerald-400" />
                      <span>Ready</span>
                    </>
                  ) : (
                    <span className="text-rose-400">Disconnected</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Start Game Action */}
        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col items-center text-center">
          {isHost ? (
            <div className="w-full max-w-sm space-y-2">
              <button
                onClick={onStartGame}
                disabled={!canStart}
                className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-30 disabled:pointer-events-none text-white font-bold py-4 px-6 rounded-2xl shadow-xl shadow-purple-600/30 text-lg transition transform active:scale-95 flex items-center justify-center gap-2 glow-purple"
              >
                <Play className="w-5 h-5 fill-current" />
                Start Game
              </button>
              {!canStart && (
                <p className="text-xs text-amber-400/90 font-medium">
                  Need at least 3 players to start ({activePlayers.length}/3 ready)
                </p>
              )}
            </div>
          ) : (
            <div className="text-center py-2">
              <div className="inline-block animate-pulse-slow font-semibold text-purple-300 text-sm">
                Waiting for host to start the game...
              </div>
              <p className="text-xs text-slate-500 mt-1">Get ready to vote and bluff!</p>
            </div>
          )}
        </div>
      </div>

      {/* How to Play Rules Card */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <h4 className="font-bold text-slate-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
          <HelpCircle className="w-3.5 h-3.5 text-purple-400" /> How to Play
        </h4>
        <ol className="list-decimal list-inside space-y-1 text-slate-400">
          <li>Everyone receives the same <span className="text-purple-300 font-semibold">"Who is most likely to..."</span> question, except 1 secret <span className="text-rose-300 font-semibold">Imposter</span> who receives a different question.</li>
          <li>Each player selects one person from the lobby who best fits the prompt.</li>
          <li><span className="text-amber-300 font-semibold">Stage 1:</span> Player answers are revealed first so everyone sees who voted for whom.</li>
          <li><span className="text-amber-300 font-semibold">Stage 2:</span> The True Question is revealed to everyone!</li>
          <li>Deliberate, notice suspicious answers, and vote to catch the Imposter!</li>
        </ol>
      </div>
    </div>
  );
};

