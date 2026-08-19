export interface LoggedSet {
  weightKg?: number;
  reps?: number;
  durationSec?: number;
}

export interface ExercisePerformance {
  name: string;
  targetSetsReps: string;
  sets: LoggedSet[];
}

export function parsePrescribedSetCount(setsReps: string | undefined): number {
  if (!setsReps) return 3;
  const match = setsReps.trim().match(/^(\d+)\s*[xX×]/);
  if (!match) return 3;
  const count = Number.parseInt(match[1], 10);
  if (!Number.isFinite(count) || count < 1) return 3;
  return Math.min(count, 12);
}

export function formatLoggedSets(sets: LoggedSet[] | undefined): string {
  if (!sets?.length) return '';
  return sets
    .map((set) => {
      const weight = set.weightKg != null && !Number.isNaN(set.weightKg) ? `${set.weightKg}kg` : '—';
      if (set.durationSec != null && !Number.isNaN(set.durationSec)) {
        return `${weight} × ${set.durationSec}s`;
      }
      const reps = set.reps != null && !Number.isNaN(set.reps) ? `${set.reps}` : '—';
      return `${weight} × ${reps}`;
    })
    .join('  ·  ');
}
