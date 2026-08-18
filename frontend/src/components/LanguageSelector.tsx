import React from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { Globe } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { lang, setLang } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-900/80 border border-slate-700/60 rounded-full px-2.5 py-1 text-xs font-medium text-slate-300 backdrop-blur-md shadow-sm">
      <Globe className="w-3.5 h-3.5 text-blue-400" />
      <button
        onClick={() => setLang('pt-br')}
        className={`px-2 py-0.5 rounded-full transition-all ${
          lang === 'pt-br' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-white'
        }`}
      >
        PT 🇧🇷
      </button>
      <span className="text-slate-600">|</span>
      <button
        onClick={() => setLang('en')}
        className={`px-2 py-0.5 rounded-full transition-all ${
          lang === 'en' ? 'bg-blue-600 text-white font-semibold shadow' : 'hover:text-white'
        }`}
      >
        EN 🇺🇸
      </button>
    </div>
  );
};
