import { Prisma, PrismaClient } from '@prisma/client';
import {
  User,
  Gym,
  Exercise,
  Schedule,
  PaymentConfig,
  StudentPayment,
  WorkoutExecutionLog,
  Role,
  UserStatus,
  PixKeyType
} from '../domain/types.js';
import { IStorageAdapter } from './Interfaces.js';

function toIso(value: Date): string {
  return value.toISOString();
}

function toDateOnly(value: Date): string {
  return value.toISOString().split('T')[0];
}

function asJson<T>(value: Prisma.JsonValue | null | undefined, fallback: T): T {
  return (value as unknown as T) ?? fallback;
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export class PrismaStorageAdapter implements IStorageAdapter {
  constructor(private readonly prisma: PrismaClient) {}

  private mapGym(row: {
    id: string;
    name: string;
    slug: string;
    logoUrl: string;
    bannerUrl: string;
    primaryColor: string;
    secondaryColor: string;
    createdAt: Date;
  }): Gym {
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      logoUrl: row.logoUrl,
      bannerUrl: row.bannerUrl,
      primaryColor: row.primaryColor,
      secondaryColor: row.secondaryColor,
      createdAt: toIso(row.createdAt)
    };
  }

  private mapUser(row: {
    id: string;
    email: string;
    passwordHash: string;
    name: string;
    role: Role;
    gymId: string | null;
    trainerId: string | null;
    inviteCode: string | null;
    tags: string[];
    status: UserStatus;
    createdAt: Date;
  }): User {
    return {
      id: row.id,
      email: row.email,
      passwordHash: row.passwordHash,
      name: row.name,
      role: row.role,
      gymId: row.gymId ?? undefined,
      trainerId: row.trainerId ?? undefined,
      inviteCode: row.inviteCode ?? undefined,
      tags: row.tags,
      status: row.status,
      createdAt: toIso(row.createdAt)
    };
  }

  private mapExercise(row: {
    id: string;
    trainerId: string;
    name: string;
    category: string;
    muscleGroup: string;
    instructions: string;
    gifUrl: string;
    createdAt: Date;
  }): Exercise {
    return {
      id: row.id,
      trainerId: row.trainerId,
      name: row.name,
      category: row.category,
      muscleGroup: row.muscleGroup,
      instructions: row.instructions,
      gifUrl: row.gifUrl,
      createdAt: toIso(row.createdAt)
    };
  }

  private mapSchedule(row: {
    id: string;
    studentId: string;
    trainerId: string;
    title: string;
    objective: string;
    description: string;
    expectationNotes: string;
    weeklyMatrix: Prisma.JsonValue;
    progression: Prisma.JsonValue;
    workouts: Prisma.JsonValue;
    bikePlanNotes: string | null;
    recoveryAdvice: Prisma.JsonValue;
    dailyCalendar: Prisma.JsonValue;
    categories: Prisma.JsonValue | null;
    planPrice: number | null;
    targetEndDate: string | null;
    paymentDueDate: string | null;
    active: boolean;
    createdAt: Date;
  }): Schedule {
    return {
      id: row.id,
      studentId: row.studentId,
      trainerId: row.trainerId,
      title: row.title,
      objective: row.objective,
      description: row.description,
      expectationNotes: row.expectationNotes,
      weeklyMatrix: asJson(row.weeklyMatrix, []),
      progression: asJson(row.progression, []),
      workouts: asJson(row.workouts, []),
      bikePlanNotes: row.bikePlanNotes ?? undefined,
      recoveryAdvice: asJson(row.recoveryAdvice, []),
      dailyCalendar: asJson(row.dailyCalendar, []),
      categories: (row.categories as unknown as string[] | null) ?? undefined,
      planPrice: row.planPrice ?? undefined,
      targetEndDate: row.targetEndDate ?? undefined,
      paymentDueDate: row.paymentDueDate ?? undefined,
      active: row.active,
      createdAt: toIso(row.createdAt)
    };
  }

  private mapPayment(row: {
    id: string;
    studentId: string;
    trainerId: string;
    amount: number;
    dueDate: Date;
    status: StudentPayment['status'];
    paidAt: Date | null;
    pixKey: string;
    pixKeyType: PixKeyType;
  }): StudentPayment {
    return {
      id: row.id,
      studentId: row.studentId,
      trainerId: row.trainerId,
      amount: row.amount,
      dueDate: toDateOnly(row.dueDate),
      status: row.status,
      paidAt: row.paidAt ? toIso(row.paidAt) : undefined,
      pixKey: row.pixKey,
      pixKeyType: row.pixKeyType
    };
  }

  async findAllGyms(): Promise<Gym[]> {
    const rows = await this.prisma.gym.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map((row) => this.mapGym(row));
  }

  async findGymById(id: string): Promise<Gym | null> {
    const row = await this.prisma.gym.findUnique({ where: { id } });
    return row ? this.mapGym(row) : null;
  }

  async findGymBySlug(slug: string): Promise<Gym | null> {
    const row = await this.prisma.gym.findFirst({
      where: { slug: { equals: slug, mode: 'insensitive' } }
    });
    return row ? this.mapGym(row) : null;
  }

  async createGym(gymData: Omit<Gym, 'id' | 'createdAt'>): Promise<Gym> {
    const row = await this.prisma.gym.create({
      data: {
        id: `gym-${Date.now()}`,
        ...gymData
      }
    });
    return this.mapGym(row);
  }

  async updateGym(id: string, gymData: Partial<Gym>): Promise<Gym | null> {
    try {
      const data = { ...gymData };
      delete data.id;
      delete data.createdAt;
      const row = await this.prisma.gym.update({ where: { id }, data });
      return this.mapGym(row);
    } catch {
      return null;
    }
  }

  async findAllUsers(): Promise<User[]> {
    const rows = await this.prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
    return rows.map((row) => this.mapUser(row));
  }

  async findUserById(id: string): Promise<User | null> {
    const row = await this.prisma.user.findUnique({ where: { id } });
    return row ? this.mapUser(row) : null;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const row = await this.prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } }
    });
    return row ? this.mapUser(row) : null;
  }

  async findUserByInviteCode(inviteCode: string): Promise<User | null> {
    const clean = inviteCode.trim().toUpperCase();
    const trainers = await this.prisma.user.findMany({ where: { role: 'TRAINER' } });
    const match = trainers.find((u) =>
      (u.inviteCode && u.inviteCode.toUpperCase() === clean) ||
      (`TRN-${u.name.toUpperCase().replace(/\s+/g, '')}` === clean) ||
      u.id === inviteCode
    );
    return match ? this.mapUser(match) : null;
  }

  async findStudentsByTrainerId(trainerId: string): Promise<User[]> {
    const rows = await this.prisma.user.findMany({
      where: { role: 'STUDENT', trainerId }
    });
    return rows.map((row) => this.mapUser(row));
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const row = await this.prisma.user.create({
      data: {
        id: `usr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        email: userData.email,
        passwordHash: userData.passwordHash,
        name: userData.name,
        role: userData.role,
        gymId: userData.gymId,
        trainerId: userData.trainerId,
        inviteCode: userData.inviteCode,
        tags: userData.tags ?? [],
        status: userData.status ?? 'ACTIVE'
      }
    });
    return this.mapUser(row);
  }

  async updateUser(id: string, userData: Partial<User> & { gymId?: string | null }): Promise<User | null> {
    try {
      const data: Prisma.UserUpdateInput = {};
      if (userData.email !== undefined) data.email = userData.email;
      if (userData.passwordHash !== undefined) data.passwordHash = userData.passwordHash;
      if (userData.name !== undefined) data.name = userData.name;
      if (userData.role !== undefined) data.role = userData.role;
      if ('gymId' in userData) {
        data.gym = userData.gymId ? { connect: { id: userData.gymId } } : { disconnect: true };
      }
      if ('trainerId' in userData) {
        data.trainer = userData.trainerId ? { connect: { id: userData.trainerId } } : { disconnect: true };
      }
      if (userData.inviteCode !== undefined) data.inviteCode = userData.inviteCode;
      if (userData.tags !== undefined) data.tags = userData.tags;
      if (userData.status !== undefined) data.status = userData.status;

      const row = await this.prisma.user.update({ where: { id }, data });
      return this.mapUser(row);
    } catch {
      return null;
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findExercisesByTrainerId(trainerId: string): Promise<Exercise[]> {
    const rows = await this.prisma.exercise.findMany({ where: { trainerId } });
    return rows.map((row) => this.mapExercise(row));
  }

  async findExerciseById(id: string): Promise<Exercise | null> {
    const row = await this.prisma.exercise.findUnique({ where: { id } });
    return row ? this.mapExercise(row) : null;
  }

  async createExercise(exerciseData: Omit<Exercise, 'id' | 'createdAt'> & { id?: string }): Promise<Exercise> {
    const id = exerciseData.id || `ex-${Date.now()}`;
    const row = await this.prisma.exercise.upsert({
      where: { id },
      update: {
        name: exerciseData.name,
        category: exerciseData.category,
        muscleGroup: exerciseData.muscleGroup,
        instructions: exerciseData.instructions,
        gifUrl: exerciseData.gifUrl,
        trainerId: exerciseData.trainerId
      },
      create: {
        id,
        trainerId: exerciseData.trainerId,
        name: exerciseData.name,
        category: exerciseData.category,
        muscleGroup: exerciseData.muscleGroup,
        instructions: exerciseData.instructions,
        gifUrl: exerciseData.gifUrl
      }
    });
    return this.mapExercise(row);
  }

  async deleteExercise(id: string): Promise<boolean> {
    try {
      await this.prisma.exercise.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async findActiveScheduleByStudentId(studentId: string): Promise<Schedule | null> {
    const row = await this.prisma.schedule.findFirst({
      where: { studentId, active: true },
      orderBy: { createdAt: 'desc' }
    });
    return row ? this.mapSchedule(row) : null;
  }

  async findSchedulesByStudentId(studentId: string): Promise<Schedule[]> {
    const rows = await this.prisma.schedule.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' }
    });
    return rows.map((row) => this.mapSchedule(row));
  }

  async findScheduleById(id: string): Promise<Schedule | null> {
    const row = await this.prisma.schedule.findUnique({ where: { id } });
    return row ? this.mapSchedule(row) : null;
  }

  async deactivateAllSchedulesForStudent(studentId: string): Promise<void> {
    await this.prisma.schedule.updateMany({
      where: { studentId },
      data: { active: false }
    });
  }

  async createSchedule(scheduleData: Omit<Schedule, 'id' | 'createdAt'> & { id?: string }): Promise<Schedule> {
    if (scheduleData.id) {
      const existing = await this.prisma.schedule.findUnique({ where: { id: scheduleData.id } });
      if (existing) {
        if (scheduleData.active) {
          await this.deactivateAllSchedulesForStudent(scheduleData.studentId);
        }
        const row = await this.prisma.schedule.update({
          where: { id: scheduleData.id },
          data: {
            title: scheduleData.title,
            objective: scheduleData.objective,
            description: scheduleData.description,
            expectationNotes: scheduleData.expectationNotes,
            weeklyMatrix: toJson(scheduleData.weeklyMatrix),
            progression: toJson(scheduleData.progression),
            workouts: toJson(scheduleData.workouts),
            bikePlanNotes: scheduleData.bikePlanNotes,
            recoveryAdvice: toJson(scheduleData.recoveryAdvice),
            dailyCalendar: toJson(scheduleData.dailyCalendar),
            categories: scheduleData.categories ? toJson(scheduleData.categories) : undefined,
            planPrice: scheduleData.planPrice,
            targetEndDate: scheduleData.targetEndDate,
            paymentDueDate: scheduleData.paymentDueDate,
            active: scheduleData.active,
            studentId: scheduleData.studentId,
            trainerId: scheduleData.trainerId
          }
        });
        return this.mapSchedule(row);
      }
    }

    if (scheduleData.active !== false) {
      await this.deactivateAllSchedulesForStudent(scheduleData.studentId);
    }

    const row = await this.prisma.schedule.create({
      data: {
        id: scheduleData.id || `sched-${Date.now()}`,
        studentId: scheduleData.studentId,
        trainerId: scheduleData.trainerId,
        title: scheduleData.title,
        objective: scheduleData.objective ?? '',
        description: scheduleData.description ?? '',
        expectationNotes: scheduleData.expectationNotes ?? '',
        weeklyMatrix: toJson(scheduleData.weeklyMatrix ?? []),
        progression: toJson(scheduleData.progression ?? []),
        workouts: toJson(scheduleData.workouts ?? []),
        bikePlanNotes: scheduleData.bikePlanNotes,
        recoveryAdvice: toJson(scheduleData.recoveryAdvice ?? []),
        dailyCalendar: toJson(scheduleData.dailyCalendar ?? []),
        categories: scheduleData.categories ? toJson(scheduleData.categories) : undefined,
        planPrice: scheduleData.planPrice,
        targetEndDate: scheduleData.targetEndDate,
        paymentDueDate: scheduleData.paymentDueDate,
        active: scheduleData.active !== undefined ? scheduleData.active : true
      }
    });
    return this.mapSchedule(row);
  }

  async logExecution(logData: Omit<WorkoutExecutionLog, 'id'>): Promise<WorkoutExecutionLog> {
    const row = await this.prisma.workoutExecutionLog.create({
      data: {
        id: `log-${Date.now()}`,
        scheduleId: logData.scheduleId,
        studentId: logData.studentId,
        workoutTitle: logData.workoutTitle,
        completedExercises: logData.completedExercises,
        completedAt: new Date(logData.completedAt),
        notes: logData.notes
      }
    });
    return {
      id: row.id,
      scheduleId: row.scheduleId,
      studentId: row.studentId,
      workoutTitle: row.workoutTitle,
      completedExercises: row.completedExercises,
      completedAt: toIso(row.completedAt),
      notes: row.notes ?? undefined
    };
  }

  async findExecutionLogs(studentId: string): Promise<WorkoutExecutionLog[]> {
    const rows = await this.prisma.workoutExecutionLog.findMany({
      where: { studentId },
      orderBy: { completedAt: 'desc' }
    });
    return rows.map((row) => ({
      id: row.id,
      scheduleId: row.scheduleId,
      studentId: row.studentId,
      workoutTitle: row.workoutTitle,
      completedExercises: row.completedExercises,
      completedAt: toIso(row.completedAt),
      notes: row.notes ?? undefined
    }));
  }

  async getTrainerPaymentConfig(trainerId: string): Promise<PaymentConfig | null> {
    const row = await this.prisma.paymentConfig.findUnique({ where: { trainerId } });
    if (!row) return null;
    return {
      trainerId: row.trainerId,
      pixKeyType: row.pixKeyType,
      pixKey: row.pixKey,
      monthlyFee: row.monthlyFee,
      dueDay: row.dueDay
    };
  }

  async saveTrainerPaymentConfig(config: PaymentConfig): Promise<PaymentConfig> {
    const row = await this.prisma.paymentConfig.upsert({
      where: { trainerId: config.trainerId },
      update: {
        pixKeyType: config.pixKeyType,
        pixKey: config.pixKey,
        monthlyFee: config.monthlyFee,
        dueDay: config.dueDay
      },
      create: {
        trainerId: config.trainerId,
        pixKeyType: config.pixKeyType,
        pixKey: config.pixKey,
        monthlyFee: config.monthlyFee,
        dueDay: config.dueDay
      }
    });
    return {
      trainerId: row.trainerId,
      pixKeyType: row.pixKeyType,
      pixKey: row.pixKey,
      monthlyFee: row.monthlyFee,
      dueDay: row.dueDay
    };
  }

  async findStudentPayments(studentId: string): Promise<StudentPayment[]> {
    const rows = await this.prisma.studentPayment.findMany({
      where: { studentId },
      orderBy: { dueDate: 'desc' }
    });
    return rows.map((row) => this.mapPayment(row));
  }

  async findTrainerPayments(trainerId: string): Promise<StudentPayment[]> {
    const rows = await this.prisma.studentPayment.findMany({
      where: { trainerId },
      orderBy: { dueDate: 'desc' }
    });
    return rows.map((row) => this.mapPayment(row));
  }

  async findPaymentById(paymentId: string): Promise<StudentPayment | null> {
    const row = await this.prisma.studentPayment.findUnique({ where: { id: paymentId } });
    return row ? this.mapPayment(row) : null;
  }

  async createPayment(paymentData: Omit<StudentPayment, 'id'>): Promise<StudentPayment> {
    const row = await this.prisma.studentPayment.create({
      data: {
        id: `pay-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        studentId: paymentData.studentId,
        trainerId: paymentData.trainerId,
        amount: paymentData.amount,
        dueDate: new Date(paymentData.dueDate),
        status: paymentData.status,
        paidAt: paymentData.paidAt ? new Date(paymentData.paidAt) : null,
        pixKey: paymentData.pixKey,
        pixKeyType: paymentData.pixKeyType
      }
    });
    return this.mapPayment(row);
  }

  async updatePaymentStatus(paymentId: string, status: 'PAID' | 'PENDING' | 'OVERDUE'): Promise<StudentPayment | null> {
    try {
      const row = await this.prisma.studentPayment.update({
        where: { id: paymentId },
        data: {
          status,
          paidAt: status === 'PAID' ? new Date() : null
        }
      });
      return this.mapPayment(row);
    } catch {
      return null;
    }
  }
}
