import React from 'react';
import { X, PlayCircle, Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext.js';
import { ModalOverlay } from './ModalOverlay.js';

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
    <ModalOverlay onClose={onClose}>
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 min-w-0">
            <PlayCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 shrink-0" />
            <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">{exerciseName}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
            <div className="w-full p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>{instructions}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-white rounded-lg text-xs font-semibold transition-colors"
          >
            {t('close')}
          </button>
        </div>

      </div>
    </ModalOverlay>
  );
};
