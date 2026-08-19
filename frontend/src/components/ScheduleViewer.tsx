import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext.js';
import { ExercisePerformance, formatLoggedSets, LoggedSet, parsePrescribedSetCount } from '../types/workoutLog.js';
import {
  Calendar as CalendarIcon,
  Flame,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Sparkles,
  HeartPulse,
  Bike,
  Droplets,
  Layers,
  Archive,
  Info,
  Dumbbell
} from 'lucide-react';

interface Exercise {
  name: string;
  setsReps: string;
  notes?: string;
  gifUrl?: string;
}

interface Workout {
  id: string;
  title: string;
  exercises: Exercise[];
}

interface ProgressionWeek {
  week: number;
  dates: string;
  monday: string;
  wednesday: string;
  saturday: string;
  rpe: string;
}

interface MatrixRow {
  day: string;
  morningSlot?: string;
  eveningSlot?: string;
}

interface DailyCalendarItem {
  id: string;
  week: string;
  date: string;
  dayName: string;
  workoutTitle: string;
  nutritionNote?: string;
}

interface ScheduleViewerProps {
  schedule: {
    id: string;
    title: string;
    objective: string;
    description: string;
    expectationNotes?: string;
    weeklyMatrix?: MatrixRow[];
    progression?: ProgressionWeek[];
    workouts: Workout[];
    bikePlanNotes?: string;
    recoveryAdvice?: { situation: string; recommendation: string }[];
    dailyCalendar?: DailyCalendarItem[];
    active?: boolean;
  };
  onLogWorkout?: (workoutTitle: string, completedExercises: string[], exercisePerformances: ExercisePerformance[]) => void;
}

type SetDraft = { weightKg: string; reps: string };

const emptySets = (setsReps: string): SetDraft[] =>
  Array.from({ length: parsePrescribedSetCount(setsReps) }, () => ({ weightKg: '', reps: '' }));

const toLoggedSets = (sets: SetDraft[]): LoggedSet[] =>
  sets.map((set) => {
    const weight = set.weightKg.trim() === '' ? undefined : Number(set.weightKg);
    const reps = set.reps.trim() === '' ? undefined : Number(set.reps);
    const logged: LoggedSet = {};
    if (weight != null && Number.isFinite(weight)) logged.weightKg = weight;
    if (reps != null && Number.isFinite(reps)) logged.reps = reps;
    return logged;
  });

export const ScheduleViewer: React.FC<ScheduleViewerProps> = ({ schedule, onLogWorkout }) => {
  const { t } = useLanguage();

  // Detect current day of week (e.g. Terça -> Força 2)
  const daysMap = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const todayName = daysMap[new Date().getDay()];

  const getInitialWorkoutIndex = () => {
    if (!schedule.workouts || schedule.workouts.length === 0) return 0;
    const matchIdx = schedule.workouts.findIndex(w => w.title.toLowerCase().includes(todayName.toLowerCase()));
    return matchIdx !== -1 ? matchIdx : 0;
  };

  const [activeWorkoutIdx, setActiveWorkoutIdx] = useState<number>(getInitialWorkoutIndex());
  const [completedExercises, setCompletedExercises] = useState<Record<string, boolean>>({});
  const [exerciseLogs, setExerciseLogs] = useState<Record<string, SetDraft[]>>({});
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const activeWorkout = schedule.workouts?.[activeWorkoutIdx] || schedule.workouts?.[0];

  const exerciseKey = (exIdx: number, name: string) => `${exIdx}::${name}`;

  const getSets = (key: string, setsReps: string) => exerciseLogs[key] ?? emptySets(setsReps);

  const updateSet = (key: string, setsReps: string, setIdx: number, field: keyof SetDraft, value: string) => {
    setExerciseLogs((prev) => {
      const current = prev[key] ?? emptySets(setsReps);
      return {
        ...prev,
        [key]: current.map((set, idx) => (idx === setIdx ? { ...set, [field]: value } : set))
      };
    });
  };

  const toggleExercise = (key: string) => {
    setCompletedExercises(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const resetWorkoutProgress = () => {
    setCompletedExercises({});
    setExerciseLogs({});
  };

  const handleFinishWorkout = () => {
    if (!activeWorkout) return;
    const performances: ExercisePerformance[] = [];
    (activeWorkout.exercises || []).forEach((ex, exIdx) => {
      const key = exerciseKey(exIdx, ex.name);
      if (!completedExercises[key]) return;
      performances.push({
        name: ex.name,
        targetSetsReps: ex.setsReps,
        sets: toLoggedSets(getSets(key, ex.setsReps))
      });
    });

    const doneList = performances.map((item) => item.name);
    if (onLogWorkout) {
      onLogWorkout(activeWorkout.title, doneList, performances);
      setLoggedSuccess(true);
      setTimeout(() => setLoggedSuccess(false), 4000);
    }
  };

  const isExpired = schedule.active === false;

  return (
    <div className={`space-y-8 animate-fade-in ${isExpired ? 'opacity-80 grayscale-[15%]' : ''}`}>
      
      {/* Expired / Inactive Plan Banner */}
      {isExpired && (
        <div className="p-4 rounded-2xl bg-slate-200 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-between gap-3 text-xs font-semibold shadow-sm">
          <div className="flex items-center gap-2">
            <Archive className="w-4 h-4 text-slate-500" />
            <span>Este plano de treino foi <strong>Finalizado (Expirado)</strong>. Você está visualizando um treino histórico.</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-[10px] font-extrabold uppercase">
            Finalizado
          </span>
        </div>
      )}

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-slate-950 text-white p-6 sm:p-8 border border-blue-900/40 shadow-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-bold uppercase tracking-wider">
              {schedule.objective}
            </span>
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" /> FitPulse
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{schedule.title}</h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">{schedule.description}</p>
        </div>
      </div>

      {/* SECTION 1: WORKOUT ROUTINES WITH GIF DEMONSTRATION & LOGGING */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>{t('workouts')}</span>
          </h2>
          <span className="text-xs text-blue-600 dark:text-blue-400 font-bold bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800">
            {todayName}
          </span>
        </div>

        {/* Workout Tab Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {schedule.workouts?.map((w, idx) => {
            const isToday = w.title.toLowerCase().includes(todayName.toLowerCase());
            return (
              <button
                key={w.id || idx}
                onClick={() => {
                  setActiveWorkoutIdx(idx);
                  resetWorkoutProgress();
                }}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeWorkoutIdx === idx
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:border-blue-400'
                }`}
              >
                <span>{w.title}</span>
                {isToday && (
                  <span className="px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black text-[9px]">
                    {t('todayBadge')}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Workout Exercise List */}
        {activeWorkout && (
          <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-md space-y-6">
            <h3 className="font-extrabold text-base text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
              {activeWorkout.title}
            </h3>

            <div className="space-y-4">
              {activeWorkout.exercises?.map((ex, exIdx) => {
                const key = exerciseKey(exIdx, ex.name);
                const isDone = !!completedExercises[key];
                const sets = getSets(key, ex.setsReps);
                const summary = formatLoggedSets(toLoggedSets(sets));

                return (
                  <div
                    key={key}
                    className={`p-4 rounded-2xl border transition-all ${
                      isDone
                        ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/80'
                        : 'bg-slate-50/80 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 hover:border-blue-500 dark:hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <button
                        type="button"
                        onClick={() => toggleExercise(key)}
                        aria-pressed={isDone}
                        aria-label={isDone ? t('exerciseDone') : t('completeWorkout')}
                        className={`p-1.5 rounded-xl border shrink-0 transition-colors ${
                          isDone
                            ? 'bg-emerald-600 border-emerald-600 text-white'
                            : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-transparent hover:border-emerald-400'
                        }`}
                      >
                        <CheckCircle2 className="w-5 h-5" />
                      </button>

                      {ex.gifUrl ? (
                        <div className={`rounded-xl bg-slate-950 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-800 transition-all ${
                          isDone ? 'w-10 h-10' : 'w-16 h-16'
                        }`}>
                          <img src={ex.gifUrl} alt={ex.name} className="w-full h-full object-cover" />
                        </div>
                      ) : (
                        <div className={`rounded-xl bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 shrink-0 flex items-center justify-center text-blue-600 dark:text-blue-400 transition-all ${
                          isDone ? 'w-10 h-10' : 'w-12 h-12'
                        }`}>
                          <Dumbbell className="w-5 h-5" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0 space-y-0.5">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`font-extrabold text-sm truncate ${
                            isDone ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                          }`}>
                            {ex.name}
                          </h4>
                          <span className="px-2.5 py-0.5 rounded-lg bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs shrink-0">
                            {ex.setsReps}
                          </span>
                        </div>

                        {isDone ? (
                          <p className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 truncate">
                            {summary || t('exerciseDone')}
                          </p>
                        ) : (
                          ex.notes && (
                            <p className="text-slate-500 dark:text-slate-400 text-[11px] italic line-clamp-2">
                              "{ex.notes}"
                            </p>
                          )
                        )}
                      </div>
                    </div>

                    <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-out ${
                      isDone ? 'grid-rows-[0fr] opacity-0 mt-0 pointer-events-none' : 'grid-rows-[1fr] opacity-100 mt-3'
                    }`}>
                      <div className="overflow-hidden">
                        <div className="space-y-2">
                          {sets.map((set, setIdx) => (
                            <div
                              key={`${key}-set-${setIdx}`}
                              className="flex items-center gap-2 sm:gap-3"
                            >
                              <span className="w-16 shrink-0 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                                {t('setLabel')} {setIdx + 1}
                              </span>
                              <label className="flex-1 flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('weightKg')}</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  min="0"
                                  step="0.5"
                                  value={set.weightKg}
                                  onChange={(e) => updateSet(key, ex.setsReps, setIdx, 'weightKg', e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                              </label>
                              <label className="flex-1 flex items-center gap-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2.5 py-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase">{t('repsShort')}</span>
                                <input
                                  type="number"
                                  inputMode="numeric"
                                  min="0"
                                  step="1"
                                  value={set.reps}
                                  onChange={(e) => updateSet(key, ex.setsReps, setIdx, 'reps', e.target.value)}
                                  className="w-full bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none"
                                />
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Finish Workout Execution Button */}
            <div className="pt-2 flex items-center justify-between">
              {loggedSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" /> {t('completeWorkout')}
                </span>
              )}
              <button
                onClick={handleFinishWorkout}
                className="ml-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('completeWorkout')}</span>
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};
