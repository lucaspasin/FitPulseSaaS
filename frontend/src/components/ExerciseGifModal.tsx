import React from 'react';
import { X, PlayCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';

interface ExerciseGifModalProps {
  isOpen: boolean;
  onClose: () => void;
  exerciseName: string;
  gifUrl?: string;
  instructions?: string;
}

export const ExerciseGifModal: React.FC<ExerciseGifModalProps> = ({
  isOpen,
  onClose,
  exerciseName,
  gifUrl,
  instructions
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-slate-100">{exerciseName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content / GIF */}
        <div className="p-5 flex flex-col items-center gap-4">
          {gifUrl ? (
            <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src={gifUrl}
                alt={exerciseName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-full h-48 rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-slate-500 gap-2">
              <PlayCircle className="w-10 h-10 stroke-1 text-slate-600" />
              <span className="text-xs">{t('exerciseGif')}</span>
            </div>
          )}

          {instructions && (
            <div className="w-full p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{instructions}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-800/60 bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </div>
  );
};
