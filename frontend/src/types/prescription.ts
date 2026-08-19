export type EffortType = 'reps' | 'time';

export const WEEKDAYS_PT = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo'
] as const;

export type WeekdayPt = (typeof WEEKDAYS_PT)[number];

export const WEEKDAY_I18N_KEYS = {
  Segunda: 'weekdayMonday',
  Terça: 'weekdayTuesday',
  Quarta: 'weekdayWednesday',
  Quinta: 'weekdayThursday',
  Sexta: 'weekdayFriday',
  Sábado: 'weekdaySaturday',
  Domingo: 'weekdaySunday'
} as const;

export const JS_DAY_TO_WEEKDAY_PT: WeekdayPt[] = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

export interface ExercisePrescription {
  setsCount: number;
  effortType: EffortType;
  effortValue: string;
  label: string;
}

const clampSets = (value: number) => {
  if (!Number.isFinite(value) || value < 1) return 3;
  return Math.min(12, Math.round(value));
};

export function formatSetsReps(setsCount: number, effortType: EffortType, effortValue: string): string {
  const fallback = effortType === 'time' ? '30s' : '10';
  const value = effortValue.trim() || fallback;
  return `${clampSets(setsCount)}x${value}`;
}

export function parseSetsReps(setsReps: string | undefined): ExercisePrescription {
  if (!setsReps?.trim()) {
    return { setsCount: 3, effortType: 'reps', effortValue: '10', label: '3x10' };
  }

  const trimmed = setsReps.trim();
  const match = trimmed.match(/^(\d+)\s*[xX×]\s*(.+)$/);
  const setsCount = match ? clampSets(Number.parseInt(match[1], 10)) : 3;
  const effortValue = match ? match[2].trim() : trimmed;
  const effortType: EffortType = /\d+\s*s\b/i.test(effortValue) ? 'time' : 'reps';
  return {
    setsCount,
    effortType,
    effortValue,
    label: formatSetsReps(setsCount, effortType, effortValue)
  };
}

export function resolveExercisePrescription(ex: {
  setsCount?: number;
  effortType?: EffortType;
  effortValue?: string;
  setsReps?: string;
}): ExercisePrescription {
  if (ex.setsCount != null || ex.effortType || ex.effortValue != null) {
    const parsedFallback = parseSetsReps(ex.setsReps);
    const setsCount = clampSets(Number(ex.setsCount ?? parsedFallback.setsCount));
    const effortType: EffortType = ex.effortType === 'time' || ex.effortType === 'reps' ? ex.effortType : parsedFallback.effortType;
    const effortValue = (ex.effortValue ?? parsedFallback.effortValue).trim() || parsedFallback.effortValue;
    return {
      setsCount,
      effortType,
      effortValue,
      label: formatSetsReps(setsCount, effortType, effortValue)
    };
  }
  return parseSetsReps(ex.setsReps);
}

export function inferWeekday(workout: { weekday?: string; title?: string }): WeekdayPt | '' {
  if (workout.weekday && WEEKDAYS_PT.includes(workout.weekday as WeekdayPt)) {
    return workout.weekday as WeekdayPt;
  }
  const title = (workout.title || '').toLowerCase();
  return WEEKDAYS_PT.find((day) => title.includes(day.toLowerCase())) || '';
}

export function defaultStrengthExercise() {
  return {
    name: 'Novo Exercício',
    setsCount: 3,
    effortType: 'reps' as EffortType,
    effortValue: '10',
    setsReps: '3x10',
    notes: ''
  };
}
