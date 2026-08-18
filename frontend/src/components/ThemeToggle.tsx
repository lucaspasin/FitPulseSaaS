import React from 'react';
import { useTheme } from '../context/ThemeContext.js';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-slate-200 dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-800 transition-colors border border-slate-300 dark:border-slate-800"
      title={theme === 'light' ? 'Ativar Modo Escuro' : 'Ativar Modo Claro'}
    >
      {theme === 'light' ? <Moon className="w-4 h-4 text-slate-700" /> : <Sun className="w-4 h-4 text-amber-400" />}
    </button>
  );
};
