export type Role = 'ADMIN' | 'TRAINER' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface Gym {
  id: string;
  name: string;
  slug: string;
  logoUrl: string;
  bannerUrl: string;
  primaryColor: string;
  secondaryColor: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  role: Role;
  gymId?: string;
  trainerId?: string;
  inviteCode?: string;
  tags?: string[];
  status?: UserStatus;
  createdAt: string;
}

export interface Exercise {
  id: string;
  trainerId: string;
  name: string;
  category: string;
  muscleGroup: string;
  instructions: string;
  gifUrl: string;
  createdAt: string;
}

export type EffortType = 'reps' | 'time';

export interface ExerciseSet {
  id?: string;
  exerciseId?: string;
  name: string;
  setsReps: string; // e.g. "4x8-10" or "3x40s" — kept in sync with structured fields
  setsCount?: number;
  effortType?: EffortType;
  effortValue?: string;
  notes?: string;
  gifUrl?: string;
}

export interface WorkoutRoutine {
  id: string;
  title: string; // e.g., "Força 1 — Segunda (Upper Push)"
  weekday?: string; // e.g. "Segunda"
  exercises: ExerciseSet[];
}

export interface ProgressionWeek {
  week: number;
  dates: string; // e.g., "20-26/07"
  monday: string;
  wednesday: string;
  saturday: string;
  rpe: string;
}

export interface DayCalendarItem {
  id: string;
  week: string; // e.g., "S1"
  date: string; // e.g., "20/07"
  dayName: string; // e.g., "Segunda"
  workoutTitle: string;
  nutritionNote: string;
}

export interface WeeklyMatrixDay {
  day: string;
  morningSlot: string;
  eveningSlot?: string;
}

export interface Schedule {
  id: string;
  studentId: string;
  trainerId: string;
  title: string;
  objective: string;
  description: string;
  expectationNotes: string;
  weeklyMatrix: WeeklyMatrixDay[];
  progression: ProgressionWeek[];
  workouts: WorkoutRoutine[];
  bikePlanNotes?: string;
  recoveryAdvice: Array<{ situation: string; recommendation: string }>;
  dailyCalendar: DayCalendarItem[];
  categories?: string[];
  planPrice?: number;
  targetEndDate?: string;
  paymentDueDate?: string;
  active: boolean;
  createdAt: string;
}

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

export interface WorkoutExecutionLog {
  id: string;
  scheduleId: string;
  studentId: string;
  workoutTitle: string;
  completedExercises: string[]; // exercise names or IDs completed
  exercisePerformances?: ExercisePerformance[];
  completedAt: string;
  notes?: string;
}

export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'EVP';

export interface PaymentConfig {
  trainerId: string;
  pixKeyType: PixKeyType;
  pixKey: string;
  monthlyFee: number;
  dueDay: number;
}

export interface StudentPayment {
  id: string;
  studentId: string;
  trainerId: string;
  amount: number;
  dueDate: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  paidAt?: string;
  pixKey: string;
  pixKeyType: PixKeyType;
}
