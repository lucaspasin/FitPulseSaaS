import React from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { LanguageSelector } from './LanguageSelector.js';
import { ThemeToggle } from './ThemeToggle.js';
import { Dumbbell, Shield, UserCheck, User, LogOut, RefreshCw } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, gym, logout, switchDemoRole, originalLoginRole } = useAuth();
  const { t } = useLanguage();

  if (!user) return null;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand / Gym Logo */}
        <div className="flex items-center gap-3">
          {gym ? (
            <div className="flex items-center gap-2.5">
              <img src={gym.logoUrl} alt={gym.name} className="w-9 h-9 rounded-lg object-cover ring-1 ring-blue-500/40" />
              <div>
                <h1 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight leading-none">{gym.name}</h1>
                <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                  FitPulse
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Dumbbell className="w-7 h-7 text-blue-600 dark:text-blue-500" />
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-wider">FitPulse</span>
            </div>
          )}
        </div>

        {/* PERSISTENT DEMO ROLE SWITCHER BAR — SHOWN WHEN ORIGINAL LOGIN IS ADMIN */}
        {originalLoginRole === 'ADMIN' && (
          <div className="hidden md:flex items-center gap-1.5 bg-purple-50 dark:bg-slate-900/90 border border-purple-200 dark:border-slate-800 rounded-full p-1 text-xs shadow-sm">
            <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-300 px-2 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-purple-600 dark:text-purple-400" /> {t('adminModeSwitch')}
            </span>
            <button
              onClick={() => switchDemoRole('ADMIN')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-medium transition-all ${
                user.role === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Shield className="w-3 h-3" /> {t('admin')}
            </button>
            <button
              onClick={() => switchDemoRole('TRAINER')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-medium transition-all ${
                user.role === 'TRAINER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3 h-3" /> {t('trainer')}
            </button>
            <button
              onClick={() => switchDemoRole('STUDENT')}
              className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-medium transition-all ${
                user.role === 'STUDENT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <User className="w-3 h-3" /> {t('student')}
            </button>
          </div>
        )}

        {/* Controls: Theme Toggle, Language Selector & User Profile */}
        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageSelector />

          <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{user.name}</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${
                user.role === 'ADMIN' ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-400 border border-purple-300 dark:border-purple-800/50' :
                user.role === 'TRAINER' ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-300 dark:border-blue-800/50' :
                'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800/50'
              }`}>
                {user.role}
              </span>
            </div>

            <button
              onClick={logout}
              title={t('logout')}
              className="p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </header>
  );
};
