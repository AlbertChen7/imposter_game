import React from 'react';
import { Clock } from 'lucide-react';

interface TimerBarProps {
  timeLeft: number;
  totalDuration: number;
  label?: string;
}

export const TimerBar: React.FC<TimerBarProps> = ({ timeLeft, totalDuration, label }) => {
  const percentage = Math.max(0, Math.min(100, (timeLeft / totalDuration) * 100));
  const isUrgent = timeLeft <= 5;
  const isWarning = timeLeft <= 10 && !isUrgent;

  return (
    <div className="w-full max-w-xl mx-auto mb-6 px-2">
      <div className="flex justify-between items-center mb-2 text-sm font-semibold">
        <span className="flex items-center gap-1.5 text-slate-300">
          <Clock className={`w-4 h-4 ${isUrgent ? 'text-red-400 animate-pulse' : 'text-purple-400'}`} />
          {label || 'Time Remaining'}
        </span>
        <span
          className={`font-mono text-base px-2 py-0.5 rounded-full ${
            isUrgent
              ? 'bg-red-500/20 text-red-400 font-bold animate-bounce-short'
              : isWarning
              ? 'bg-amber-500/20 text-amber-400'
              : 'bg-slate-800 text-purple-300'
          }`}
        >
          {timeLeft}s
        </span>
      </div>
      <div className="w-full bg-slate-800/80 rounded-full h-2.5 overflow-hidden border border-slate-700/50 p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-linear ${
            isUrgent
              ? 'bg-gradient-to-r from-red-500 to-rose-600'
              : isWarning
              ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
              : 'bg-gradient-to-r from-purple-500 to-fuchsia-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

