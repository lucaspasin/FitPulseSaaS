import React, { useState, useEffect } from 'react';
import { Timer, Play, Pause, RotateCcw, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface RestTimerProps {
  initialSeconds?: number;
  onClose?: () => void;
}

export const RestTimer: React.FC<RestTimerProps> = ({ initialSeconds = 60, onClose }) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    let timer: any = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const resetTimer = (secs: number) => {
    setTimeLeft(secs);
    setIsRunning(true);
  };

  const progress = ((initialSeconds - timeLeft) / initialSeconds) * 100;

  return (
    <div className="bg-slate-900/90 border border-blue-500/30 rounded-2xl p-4 shadow-xl backdrop-blur-md flex flex-col items-center gap-3">
      <div className="w-full flex items-center justify-between text-xs font-semibold text-blue-400">
        <div className="flex items-center gap-1.5">
          <Timer className="w-4 h-4 text-blue-400 animate-pulse" />
          <span>{t('restTimer')}</span>
        </div>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="relative flex items-center justify-center my-1">
        <span className="text-3xl font-black font-mono tracking-wider text-white">
          {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
        <div
          className="bg-blue-500 h-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Preset Buttons & Controls */}
      <div className="flex items-center gap-2 text-xs">
        <button
          onClick={() => resetTimer(30)}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
        >
          30s
        </button>
        <button
          onClick={() => resetTimer(60)}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
        >
          60s
        </button>
        <button
          onClick={() => resetTimer(90)}
          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium"
        >
          90s
        </button>
        <div className="w-px h-4 bg-slate-800 mx-1" />
        <button
          onClick={() => setIsRunning(!isRunning)}
          className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={() => resetTimer(initialSeconds)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
