import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-0.5 sm:gap-1 bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 rounded-full px-1.5 sm:px-2.5 py-1 text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-300 backdrop-blur-md shadow-sm">
      <Globe className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400 hidden sm:block" />
      <button
        onClick={() => setLang('pt-br')}
        className={`px-2 py-0.5 rounded-full transition-all ${
          lang === 'pt-br' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        PT 🇧🇷
      </button>
      <span className="text-slate-300 dark:text-slate-600">|</span>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 rounded-full transition-all ${
          lang === 'en' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        EN 🇺🇸
      </button>
    </div>
  );
};
