import { Gym, User, Exercise, Schedule, WorkoutExecutionLog, PaymentConfig, StudentPayment } from '../domain/types.js';

export interface IGymRepository {
  findAllGyms(): Promise<Gym[]>;
  findGymById(id: string): Promise<Gym | null>;
  findGymBySlug(slug: string): Promise<Gym | null>;
  createGym(gym: Omit<Gym, 'id' | 'createdAt'>): Promise<Gym>;
  updateGym(id: string, gymData: Partial<Gym>): Promise<Gym | null>;
}

export interface IUserRepository {
  findAllUsers(): Promise<User[]>;
  findUserById(id: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByInviteCode(inviteCode: string): Promise<User | null>;
  findStudentsByTrainerId(trainerId: string): Promise<User[]>;
  createUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
  updateUser(id: string, userData: Partial<User>): Promise<User | null>;
}

export interface IExerciseRepository {
  findExercisesByTrainerId(trainerId: string): Promise<Exercise[]>;
  findExerciseById(id: string): Promise<Exercise | null>;
  createExercise(exercise: Omit<Exercise, 'id' | 'createdAt'>): Promise<Exercise>;
  deleteExercise(id: string): Promise<boolean>;
}

export interface IScheduleRepository {
  findSchedulesByStudentId(studentId: string): Promise<Schedule[]>;
  findActiveScheduleByStudentId(studentId: string): Promise<Schedule | null>;
  findScheduleById(id: string): Promise<Schedule | null>;
  createSchedule(schedule: Omit<Schedule, 'id' | 'createdAt'>): Promise<Schedule>;
  deactivateAllSchedulesForStudent(studentId: string): Promise<void>;
  logExecution(log: Omit<WorkoutExecutionLog, 'id'>): Promise<WorkoutExecutionLog>;
  findExecutionLogs(studentId: string): Promise<WorkoutExecutionLog[]>;
}

export interface IPaymentRepository {
  getTrainerPaymentConfig(trainerId: string): Promise<PaymentConfig | null>;
  saveTrainerPaymentConfig(config: PaymentConfig): Promise<PaymentConfig>;
  findStudentPayments(studentId: string): Promise<StudentPayment[]>;
  findTrainerPayments(trainerId: string): Promise<StudentPayment[]>;
  updatePaymentStatus(paymentId: string, status: 'PAID' | 'PENDING' | 'OVERDUE'): Promise<StudentPayment | null>;
  createPayment(payment: Omit<StudentPayment, 'id'>): Promise<StudentPayment>;
}
