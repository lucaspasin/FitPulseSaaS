import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useLanguage } from '../context/LanguageContext.js';
import { LanguageSelector } from './LanguageSelector.js';
import { ThemeToggle } from './ThemeToggle.js';
import { Dumbbell, Shield, UserCheck, User as UserIcon, LogOut, RefreshCw, ChevronDown, Search } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, gym, logout, switchDemoRole, originalLoginRole, trainersList, studentsList, selectTrainerUser, selectStudentUser } = useAuth();
  const { t } = useLanguage();

  const [showTrainerDropdown, setShowTrainerDropdown] = useState(false);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [trainerSearchTerm, setTrainerSearchTerm] = useState('');
  const [studentSearchTerm, setStudentSearchTerm] = useState('');

  if (!user) return null;

  const currentCoachId = user.role === 'TRAINER' ? user.id : (user.trainerId || 'usr-trainer-dutra');
  const coachStudents = studentsList.filter(s => !s.trainerId || s.trainerId === currentCoachId || user.role === 'ADMIN');

  const filteredTrainers = trainersList.filter(tr => {
    const term = trainerSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return tr.name.toLowerCase().includes(term) || tr.email.toLowerCase().includes(term);
  });

  const filteredStudents = coachStudents.filter(st => {
    const term = studentSearchTerm.toLowerCase().trim();
    if (!term) return true;
    return st.name.toLowerCase().includes(term) || st.email.toLowerCase().includes(term);
  });

  const roleSwitcher = (compact: boolean) => (
    <div className={`flex items-center gap-1 bg-purple-50 dark:bg-slate-900/90 border border-purple-200 dark:border-slate-800 rounded-full p-1 text-xs shadow-sm relative ${compact ? 'w-full min-w-0 overflow-x-auto' : ''}`}>
      <span className="text-[10px] sm:text-[11px] font-semibold text-purple-700 dark:text-purple-300 px-2 flex items-center gap-1 shrink-0">
        <RefreshCw className="w-3 h-3 text-purple-600 dark:text-purple-400" />
        <span className={compact ? '' : 'hidden lg:inline'}>{compact ? t('admin') : t('adminModeSwitch')}</span>
      </span>

      <button
        onClick={() => {
          setShowTrainerDropdown(false);
          setShowStudentDropdown(false);
          switchDemoRole('ADMIN');
        }}
        className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-medium transition-all shrink-0 ${
          user.role === 'ADMIN' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
        }`}
      >
        <Shield className="w-3 h-3" /> {t('admin')}
      </button>

      <div className="relative shrink-0">
        <button
          onClick={() => {
            setShowStudentDropdown(false);
            setShowTrainerDropdown(!showTrainerDropdown);
          }}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-medium transition-all ${
            user.role === 'TRAINER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-3 h-3" />
          <span className="max-w-[7rem] truncate">{user.role === 'TRAINER' ? user.name : t('trainer')}</span>
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
        </button>

        {showTrainerDropdown && (
          <div className="absolute left-0 mt-2 w-[min(16rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={trainerSearchTerm}
                onChange={(e) => setTrainerSearchTerm(e.target.value)}
                placeholder={t('trainer')}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-blue-500"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredTrainers.map((tr) => (
                <button
                  key={tr.id}
                  onClick={() => {
                    selectTrainerUser(tr);
                    setShowTrainerDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors ${
                    user.id === tr.id
                      ? 'bg-blue-50 dark:bg-blue-950/60 font-bold text-blue-600 dark:text-blue-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block font-semibold truncate">{tr.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{tr.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative shrink-0">
        <button
          onClick={() => {
            setShowTrainerDropdown(false);
            setShowStudentDropdown(!showStudentDropdown);
          }}
          className={`px-2.5 py-1 rounded-full flex items-center gap-1 font-medium transition-all ${
            user.role === 'STUDENT' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <UserIcon className="w-3 h-3" />
          <span className="max-w-[7rem] truncate">{user.role === 'STUDENT' ? user.name : t('student')}</span>
          <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
        </button>

        {showStudentDropdown && (
          <div className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-2rem))] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2 shadow-2xl z-50 text-xs space-y-2">
            <div className="px-2 py-1 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800/60 text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
              {t('student')} ({coachStudents.length})
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={studentSearchTerm}
                onChange={(e) => setStudentSearchTerm(e.target.value)}
                placeholder={t('student')}
                className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {filteredStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => {
                    selectStudentUser(st);
                    setShowStudentDropdown(false);
                  }}
                  className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition-colors ${
                    user.id === st.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 font-bold text-emerald-600 dark:text-emerald-400'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <span className="block font-semibold truncate">{st.name}</span>
                    <span className="text-[10px] text-slate-400 block truncate">{st.email}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="h-14 sm:h-16 flex items-center justify-between gap-2 min-w-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {gym ? (
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <img src={gym.logoUrl} alt={gym.name} className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg object-cover ring-1 ring-blue-500/40 shrink-0" />
                <div className="min-w-0">
                  <h1 className="font-bold text-xs sm:text-base text-slate-900 dark:text-white tracking-tight leading-none truncate max-w-[9rem] sm:max-w-xs">
                    {gym.name}
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600 dark:text-blue-400">
                    FitPulse
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Dumbbell className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600 dark:text-blue-500 shrink-0" />
                <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-wider">FitPulse</span>
              </div>
            )}
          </div>

          {originalLoginRole === 'ADMIN' && (
            <div className="hidden md:flex flex-1 justify-center px-3 min-w-0">
              {roleSwitcher(false)}
            </div>
          )}

          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <ThemeToggle />
            <LanguageSelector />

            <div className="flex items-center gap-1.5 sm:gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
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

        {originalLoginRole === 'ADMIN' && (
          <div className="md:hidden pb-2">
            {roleSwitcher(true)}
          </div>
        )}
      </div>
    </header>
  );
};
